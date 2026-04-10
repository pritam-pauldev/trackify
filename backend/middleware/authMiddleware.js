const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // ✅ LINE 1: Get token from header
    const authHeader = req.headers.authorization;

    // ✅ LINE 2: Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // ✅ LINE 3: Extract token
    const token = authHeader.split(" ")[1];

    // ✅ LINE 4: Verify token
    const decoded = jwt.verify(
      token,
      "1q2waSE34rdZXcG457HVnjuY67InKu89PlIFYU64SRTUinvcd4679OJfr",
    );

    // ✅ LINE 5: Attach user info to request
    req.user = decoded; // { userId: ... }

    next(); // move to controller
  } catch (error) {
      console.log("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
