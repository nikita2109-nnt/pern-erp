
const express = require("express");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "PERN ERP Backend is running!"
    });
});

// Database connection test
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database(), NOW()"
        );

        res.json({
            message: "PostgreSQL connected successfully!",
            database: result.rows[0].current_database,
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});