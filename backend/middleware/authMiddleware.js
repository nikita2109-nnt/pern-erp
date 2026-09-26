const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    // Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Token required."
        });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using our secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store the authenticated user's details
        req.user = decoded;

        // Continue to the protected route
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;