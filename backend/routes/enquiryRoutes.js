const express = require("express");
const router = express.Router();

//const { createEnquiry } = require("../controllers/enquiryController");

// Import middleware without curly braces
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createEnquiry,
    getEnquiries
} = require("../controllers/enquiryController");
// Create a new enquiry
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    createEnquiry
);

// Get all enquiries
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    getEnquiries
);

module.exports = router;