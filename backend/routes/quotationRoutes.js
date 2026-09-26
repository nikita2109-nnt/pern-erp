const express = require("express");
const router = express.Router();

const {
    createQuotation,
    getQuotations
} = require("../controllers/quotationController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Create a quotation
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    createQuotation
);
// Get all quotations
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    getQuotations
);
module.exports = router;