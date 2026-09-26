const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createDispatch
} = require("../controllers/dispatchController");

// Dispatch a confirmed sales order
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    createDispatch
);

module.exports = router;