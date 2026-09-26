const pool = require("../config/db");

// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const {
            company_name,
            contact_person,
            mobile,
            email,
            city
        } = req.body;

        // Validate required fields
        if (
            !company_name ||
            !contact_person ||
            !mobile ||
            !email ||
            !city
        ) {
            return res.status(400).json({
                message: "All customer fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Save the customer in PostgreSQL
        const result = await pool.query(
            `INSERT INTO customers
             (company_name, contact_person, mobile, email, city)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                company_name.trim(),
                contact_person.trim(),
                mobile.trim(),
                email.trim(),
                city.trim()
            ]
        );

        return res.status(201).json({
            message: "Customer created successfully",
            customer: result.rows[0]
        });

    } catch (error) {
        console.error("Create customer error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Get all customers
const getCustomers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM customers ORDER BY id DESC"
        );

        return res.status(200).json({
            message: "Customers fetched successfully",
            customers: result.rows
        });

    } catch (error) {
        console.error("Get customers error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
module.exports = { createCustomer, getCustomers };