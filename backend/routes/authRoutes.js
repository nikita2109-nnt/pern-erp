const express = require("express");

const { register, login } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Public: existing users can log in
router.post("/login", login);

// Protected: only ADMIN can create users
router.post(
    "/register",
    authenticate,
    authorize("ADMIN"),
    register
);

module.exports = router;