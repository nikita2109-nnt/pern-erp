const pool = require("../config/db");

// Sales Order functions will be added here.
const createSalesOrder = async (req, res) => {
    const quotationId = Number(req.body?.quotation_id);

    if (!Number.isInteger(quotationId) || quotationId <= 0) {
        return res.status(400).json({
            message: "Valid quotation ID is required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Find and lock the quotation
        const quotationResult = await client.query(
            `SELECT *
             FROM quotations
             WHERE id = $1
             FOR UPDATE`,
            [quotationId]
        );

        if (quotationResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        const quotation = quotationResult.rows[0];

        // 2. Only accepted quotations can become orders
        if (quotation.status !== "ACCEPTED") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Quotation must be ACCEPTED"
            });
        }

        // 3. Prevent duplicate sales orders
        const existingOrder = await client.query(
            `SELECT id
             FROM sales_orders
             WHERE quotation_id = $1`,
            [quotationId]
        );

        if (existingOrder.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Sales order already exists for this quotation"
            });
        }

        // 4. Get quotation items
        const itemsResult = await client.query(
            `SELECT product_id, quantity,
                    unit_price, line_amount
             FROM quotation_items
             WHERE quotation_id = $1`,
            [quotationId]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Quotation has no items"
            });
        }

        // 5. Generate a unique order number
        const numberResult = await client.query(
            `SELECT nextval(
                pg_get_serial_sequence('sales_orders', 'id')
             ) AS number`
        );

        const orderNumber =
            `SO-${String(numberResult.rows[0].number).padStart(5, "0")}`;

        // 6. Create the sales order
        const orderResult = await client.query(
            `INSERT INTO sales_orders
             (order_number, customer_id, quotation_id,
              total_amount, status)
             VALUES ($1, $2, $3, $4, 'PENDING')
             RETURNING *`,
            [
                orderNumber,
                quotation.customer_id,
                quotationId,
                quotation.grand_total
            ]
        );

        const order = orderResult.rows[0];

        // 7. Copy quotation items into the sales order
        for (const item of itemsResult.rows) {
            await client.query(
                `INSERT INTO sales_order_items
                 (sales_order_id, product_id, quantity,
                  unit_price, line_amount)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.line_amount
                ]
            );
        }

        // 8. Mark the original enquiry as WON
        await client.query(
            `UPDATE enquiries
             SET status = 'WON'
             WHERE id = $1`,
            [quotation.enquiry_id]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Sales order created successfully",
            order,
            items: itemsResult.rows
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create sales order error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Sales order already exists"
            });
        }

        return res.status(500).json({
            message: "Failed to create sales order"
        });

    } finally {
        client.release();
    }
};

const confirmSalesOrder = async (req, res) => {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            message: "Invalid sales order ID"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock the order to prevent simultaneous confirmation
        const orderResult = await client.query(
            `SELECT id, status
             FROM sales_orders
             WHERE id = $1
             FOR UPDATE`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Sales order not found"
            });
        }

        if (orderResult.rows[0].status !== "PENDING") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Only PENDING orders can be confirmed"
            });
        }

        // 2. Retrieve products in a consistent order
        const itemsResult = await client.query(
            `SELECT product_id, quantity
             FROM sales_order_items
             WHERE sales_order_id = $1
             ORDER BY product_id`,
            [orderId]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Sales order has no products"
            });
        }

        // 3. Reserve each product only if enough stock exists
        for (const item of itemsResult.rows) {
            const inventoryResult = await client.query(
                `UPDATE inventory
                 SET reserved_quantity =
                     reserved_quantity + $1
                 WHERE product_id = $2
                   AND physical_quantity - reserved_quantity >= $1
                 RETURNING product_id, physical_quantity,
                           reserved_quantity`,
                [item.quantity, item.product_id]
            );

            if (inventoryResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: `Insufficient available stock for product ${item.product_id}`
                });
            }
        }

        // 4. Confirm the order
        const confirmedOrder = await client.query(
            `UPDATE sales_orders
             SET status = 'CONFIRMED'
             WHERE id = $1
             RETURNING *`,
            [orderId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Sales order confirmed and inventory reserved",
            order: confirmedOrder.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Confirm order error:", error.message);

        return res.status(500).json({
            message: "Failed to confirm sales order"
        });

    } finally {
        client.release();
    }
};
module.exports = {
    createSalesOrder,
    confirmSalesOrder
};