const pool = require("../config/db");

const getInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.product_id,
        p.product_name,
        p.product_code,
        i.physical_quantity,
        i.reserved_quantity,
        (
          i.physical_quantity - i.reserved_quantity
        ) AS available_quantity
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      ORDER BY p.id
    `);

    res.status(200).json({
      message: "Inventory fetched successfully",
      inventory: result.rows
    });
  } catch (error) {
    console.error("Inventory error:", error.message);

    res.status(500).json({
      message: "Failed to fetch inventory"
    });
  }
};

module.exports = { getInventory };