const pool = require("../config/db");

// Create an enquiry containing multiple products
const createEnquiry = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            customer_id,
            required_date,
            notes,
            items
        } = req.body || {};

        // Validate the enquiry
        if (
            !Number.isInteger(customer_id) ||
            customer_id <= 0 ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: "Valid customer ID and at least one item are required"
            });
        }

        // Validate every requested product
        const productIds = new Set();

        for (const item of items) {
            if (
                !item ||
                !Number.isInteger(item.product_id) ||
                item.product_id <= 0 ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0 ||
                productIds.has(item.product_id)
            ) {
                return res.status(400).json({
                    message: "Each product must be unique and have a positive integer quantity"
                });
            }

            productIds.add(item.product_id);
        }

        // Start a PostgreSQL transaction
        await client.query("BEGIN");

        // Verify that the customer exists
        const customer = await client.query(
            "SELECT id FROM customers WHERE id = $1",
            [customer_id]
        );

        if (customer.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Generate a unique enquiry number
        const sequence = await client.query(
            "SELECT nextval(pg_get_serial_sequence('enquiries', 'id')) AS number"
        );

        const enquiryNumber = `ENQ-${String(
            sequence.rows[0].number
        ).padStart(5, "0")}`;

        // Insert the main enquiry
        const enquiryResult = await client.query(
            `INSERT INTO enquiries
             (enquiry_number, customer_id, created_by,
              required_date, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'NEW')
             RETURNING *`,
            [
                enquiryNumber,
                customer_id,
                req.user.id,
                required_date || null,
                notes || null
            ]
        );

        const enquiry = enquiryResult.rows[0];

        // Insert every requested product
        for (const item of items) {
            await client.query(
                `INSERT INTO enquiry_items
                 (enquiry_id, product_id, quantity)
                 VALUES ($1, $2, $3)`,
                [
                    enquiry.id,
                    item.product_id,
                    item.quantity
                ]
            );
        }

        // Save everything together
        await client.query("COMMIT");

        return res.status(201).json({
            message: "Enquiry created successfully",
            enquiry
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create enquiry error:", error.message);

        return res.status(500).json({
            message: "Failed to create enquiry"
        });

    } finally {
        client.release();
    }
};

// Get all enquiries with customer details
const getEnquiries = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                e.id,
                e.enquiry_number,
                e.enquiry_date,
                e.required_date,
                e.notes,
                e.status,
                c.company_name AS customer_name,
                u.name AS created_by_name
             FROM enquiries e
             JOIN customers c
                ON e.customer_id = c.id
             JOIN users u
                ON e.created_by = u.id
             ORDER BY e.id DESC`
        );

        return res.status(200).json({
            message: "Enquiries fetched successfully",
            enquiries: result.rows
        });

    } catch (error) {
        console.error("Get enquiries error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch enquiries"
        });
    }
};

module.exports = {
    createEnquiry,
    getEnquiries
};