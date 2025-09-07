const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate app JWT token
 */
const authenticateAppToken = (req, res, next) => {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Optional chaining

  if (!token) {
    return res.status(401).json({ error: "Access token required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches { userId, userType }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = { authenticateAppToken };
