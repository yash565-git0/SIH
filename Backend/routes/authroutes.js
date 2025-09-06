// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const { AuthController } = require("../controller/authcontroller");
const { authenticateAppToken } = require("../middleware/authMiddleware");

// Middleware: Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation failed:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ✅ Verify and Signin Route
router.post(
  "/verify-and-signin",
  [
    body("idToken")
      .notEmpty()
      .withMessage("Firebase ID token is required."),
    body("userType")
      .optional()
      .isIn(["Consumer", "Manufacturer", "FarmerUnion", "Laboratory"])
      .withMessage("Invalid user type"),
  ],
  handleValidationErrors,
  (req, res) => {
    console.log("Incoming payload:", req.body); // 🔍 Debug log
    AuthController.verifyAndSignIn(req, res);
  }
);

// ✅ Get Profile
router.get("/profile", authenticateAppToken, AuthController.getProfile);

// ✅ Update Profile
router.put("/profile", authenticateAppToken, AuthController.updateProfile);

module.exports = router;