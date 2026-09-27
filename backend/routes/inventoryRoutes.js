const express = require("express");
const router = express.Router();

const { getInventory } = require("../controllers/inventoryController");
const authenticate = require("../middleware/authMiddleware");

router.get("/", authenticate, getInventory);

module.exports = router;