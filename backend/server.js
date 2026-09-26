
const express = require("express");

const app = express();
const PORT = 5000;

// Middleware to read JSON request bodies
app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "PERN ERP Backend is running!"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});