const express = require("express");

const {
    createCustomer,
    getCustomers
} = require("../controllers/customerController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Create a customer
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    createCustomer
);

// Get all customers
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    getCustomers
);

module.exports = router;