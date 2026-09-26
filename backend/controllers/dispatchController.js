
const pool = require("../config/db");

const createDispatch = async (req, res) => {
    console.log("Dispatch request received:", req.body);

    const orderId = Number(req.body?.sales_order_id);
    const { vehicle_number, driver_name } = req.body;

    // 1. Validate sales order ID
    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            message: "Valid sales order ID is required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 2. Lock the sales order
        const orderResult = await client.query(
            `SELECT *
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

        const order = orderResult.rows[0];

        // Only confirmed orders can be dispatched
        if (order.status !== "CONFIRMED") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Only CONFIRMED orders can be dispatched"
            });
        }

        // 3. Get all products in the sales order
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
                message: "Sales order has no items"
            });
        }

        // 4. Update inventory for every product
        for (const item of itemsResult.rows) {
            const stockResult = await client.query(
                `UPDATE inventory
                 SET
                     physical_quantity = physical_quantity - $1,
                     reserved_quantity = reserved_quantity - $1
                 WHERE product_id = $2
                   AND physical_quantity >= $1
                   AND reserved_quantity >= $1
                 RETURNING *`,
                [item.quantity, item.product_id]
            );

            if (stockResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message:
                        `Insufficient reserved stock for product ${item.product_id}`
                });
            }
        }

        // 5. Generate a unique dispatch number
        const numberResult = await client.query(
            `SELECT nextval(
                pg_get_serial_sequence('dispatches', 'id')
             ) AS number`
        );

        const dispatchNumber =
            `DIS-${String(numberResult.rows[0].number).padStart(5, "0")}`;

        // 6. Insert dispatch record
        const dispatchResult = await client.query(
            `INSERT INTO dispatches (
                dispatch_number,
                sales_order_id,
                dispatch_date,
                vehicle_number,
                driver_name,
                dispatched_by
             )
             VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
             RETURNING *`,
            [
                dispatchNumber,
                orderId,
                vehicle_number || null,
                driver_name || null,
                req.user.id
            ]
        );

        const dispatch = dispatchResult.rows[0];

        // 7. Save dispatched products
        for (const item of itemsResult.rows) {
            await client.query(
                `INSERT INTO dispatch_items (
                    dispatch_id,
                    product_id,
                    quantity
                 )
                 VALUES ($1, $2, $3)`,
                [
                    dispatch.id,
                    item.product_id,
                    item.quantity
                ]
            );
        }

        // 8. Mark the sales order as dispatched
        await client.query(
            `UPDATE sales_orders
             SET status = 'DISPATCHED'
             WHERE id = $1`,
            [orderId]
        );

        // 9. Commit all database changes
        await client.query("COMMIT");

        return res.status(201).json({
            message: "Order dispatched successfully",
            dispatch,
            items: itemsResult.rows
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Dispatch error:", error);

        return res.status(500).json({
            message: "Failed to dispatch order"
        });

    } finally {
        client.release();
    }
};

module.exports = {
    createDispatch
};