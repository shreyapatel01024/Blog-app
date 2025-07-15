// backend/middlewares/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token missing
    if (!token) {
      return res
        .status(401)
        .json({ message: "❌ Not authorized, token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = {
      id: decoded.userId,         // ✅ Standardized
      userId: decoded.userId,     // ✅ Optional backward compatibility
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err.message);
    return res
      .status(401)
      .json({ message: "❌ Not authorized, token invalid" });
  }
};

module.exports = protect;
