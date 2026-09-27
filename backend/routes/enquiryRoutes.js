const express = require("express");
const router = express.Router();

//const { createEnquiry } = require("../controllers/enquiryController");

// Import middleware without curly braces
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createEnquiry,
  getEnquiries,
  getEnquiryById
} = require("../controllers/enquiryController");

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById
};
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
console.log("authenticate:", typeof authenticate);
console.log("getEnquiryById:", typeof getEnquiryById);
router.get("/:id", authenticate, getEnquiryById);
module.exports = router;