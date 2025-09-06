// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Verifies the JWT that YOUR server created and signed
const authenticateAppToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaches { userId, userType } to the request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { authenticateAppToken };