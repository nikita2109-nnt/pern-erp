const express = require("express");
const router = express.Router();

const {
    createSalesOrder,
    confirmSalesOrder,
    getOrders
} = require("../controllers/orderController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Create a sales order from an accepted quotation
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    createSalesOrder
);

// Confirm a sales order and reserve inventory
router.patch(
    "/:id/confirm",
    authenticate,
    authorize("ADMIN", "SALES_USER"),
    confirmSalesOrder
);
router.get("/", authenticate, getOrders);
module.exports = router;