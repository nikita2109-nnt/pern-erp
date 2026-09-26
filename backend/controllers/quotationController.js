const pool = require("../config/db");

// Calculate the final amount for one product
const calculateLineAmount = (
    quantity,
    unitPrice,
    discountPercent,
    gstPercent
) => {
    const subtotal = quantity * unitPrice;

    const discount =
        (subtotal * discountPercent) / 100;

    const taxableAmount = subtotal - discount;

    const gst =
        (taxableAmount * gstPercent) / 100;

    return Math.round((taxableAmount + gst) * 100) / 100;
};

const createQuotation = async (req, res) => {
    const {
        enquiry_id,
        valid_until,
        items
    } = req.body || {};

    // Validate the request
    if (
        !Number.isInteger(enquiry_id) ||
        enquiry_id <= 0 ||
        !valid_until ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "Valid enquiry ID, validity date and items are required"
        });
    }

    const productIds = new Set();

    for (const item of items) {
        if (
            !item ||
            !Number.isInteger(item.product_id) ||
            !Number.isInteger(item.quantity) ||
            item.product_id <= 0 ||
            item.quantity <= 0 ||
            typeof item.unit_price !== "number" ||
            !Number.isFinite(item.unit_price) ||
            item.unit_price < 0 ||
            typeof item.discount_percent !== "number" ||
            item.discount_percent < 0 ||
            item.discount_percent > 100 ||
            typeof item.gst_percent !== "number" ||
            item.gst_percent < 0 ||
            item.gst_percent > 100 ||
            !Number.isFinite(item.discount_percent) ||
            !Number.isFinite(item.gst_percent) ||
            productIds.has(item.product_id)
        ) {
            return res.status(400).json({
                message: "Invalid or duplicate quotation item"
            });
        }

        productIds.add(item.product_id);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Find and lock the enquiry
        const enquiryResult = await client.query(
            `SELECT id, customer_id, status
             FROM enquiries
             WHERE id = $1
             FOR UPDATE`,
            [enquiry_id]
        );

        if (enquiryResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Enquiry not found"
            });
        }

        const enquiry = enquiryResult.rows[0];

        if (enquiry.status !== "NEW") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Only NEW enquiries can be quoted"
            });
        }

        // Verify products and quantities against the enquiry
        const requestedItems = await client.query(
            `SELECT product_id, quantity
             FROM enquiry_items
             WHERE enquiry_id = $1`,
            [enquiry_id]
        );

        const requestedProducts = new Map(
            requestedItems.rows.map(item => [
                item.product_id,
                item.quantity
            ])
        );

        if (
            items.length !== requestedProducts.size ||
            items.some(item =>
                requestedProducts.get(item.product_id) !== item.quantity
            )
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Quotation items must match the enquiry"
            });
        }

        // Calculate each line and the grand total
        const calculatedItems = items.map(item => ({
            ...item,
            line_amount: calculateLineAmount(
                item.quantity,
                item.unit_price,
                item.discount_percent,
                item.gst_percent
            )
        }));

        const grandTotal = Math.round(
            calculatedItems.reduce(
                (sum, item) => sum + item.line_amount,
                0
            ) * 100
        ) / 100;

        // Create a unique quotation number
        const numberResult = await client.query(
            `SELECT nextval(
                pg_get_serial_sequence('quotations', 'id')
             ) AS number`
        );

        const quotationNumber =
            `QUO-${String(numberResult.rows[0].number).padStart(5, "0")}`;

        // Save the quotation
        const quotationResult = await client.query(
            `INSERT INTO quotations
             (quotation_number, enquiry_id, customer_id,
              created_by, valid_until, grand_total, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
             RETURNING *`,
            [
                quotationNumber,
                enquiry_id,
                enquiry.customer_id,
                req.user.id,
                valid_until,
                grandTotal
            ]
        );

        const quotation = quotationResult.rows[0];

        // Save quotation items
        for (const item of calculatedItems) {
            await client.query(
                `INSERT INTO quotation_items
                 (quotation_id, product_id, quantity,
                  unit_price, discount_percent,
                  gst_percent, line_amount)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    quotation.id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.discount_percent,
                    item.gst_percent,
                    item.line_amount
                ]
            );
        }

        // Mark the enquiry as quoted
        await client.query(
            `UPDATE enquiries
             SET status = 'QUOTED'
             WHERE id = $1`,
            [enquiry_id]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Quotation created successfully",
            quotation,
            items: calculatedItems
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create quotation error:", error.message);

        return res.status(500).json({
            message: "Failed to create quotation"
        });

    } finally {
        client.release();
    }
};

// Get all quotations with customer and enquiry details
const getQuotations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                q.id,
                q.quotation_number,
                q.enquiry_id,
                e.enquiry_number,
                q.customer_id,
                c.company_name AS customer_name,
                q.quotation_date,
                q.valid_until,
                q.grand_total,
                q.status,
                u.name AS created_by_name
             FROM quotations q
             JOIN enquiries e
                ON q.enquiry_id = e.id
             JOIN customers c
                ON q.customer_id = c.id
             JOIN users u
                ON q.created_by = u.id
             ORDER BY q.id DESC`
        );

        return res.status(200).json({
            message: "Quotations fetched successfully",
            quotations: result.rows
        });

    } catch (error) {
        console.error("Get quotations error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch quotations"
        });
    }
};

module.exports = { createQuotation,
     getQuotations
 };