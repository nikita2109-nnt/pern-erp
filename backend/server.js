const express = require("express");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middleware/authMiddleware");
const authorize = require("./middleware/roleMiddleware");
const customerRoutes = require("./routes/customerRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to read JSON request bodies
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));
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

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected API — requires a valid JWT
app.get("/api/profile", authenticate, (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});
// Temporary admin-only test API
app.get(
    "/api/admin/test",
    authenticate,
    authorize("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome, Admin!",
            user: req.user
        });
    }
);
app.use("/api/customers", customerRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dispatches", dispatchRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});