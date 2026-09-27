const pool = require("../config/db");

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, product_code, product_name,
              category, unit, base_price
       FROM products
       ORDER BY id ASC`
    );

    res.status(200).json({
      products: result.rows
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
};

module.exports = { getProducts };