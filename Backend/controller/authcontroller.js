// controllers/authController.js
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const {
  User,
  Consumer,
  Manufacturer,
  FarmerUnion,
  Laboratory,
} = require("../models/auth-models");

class AuthController {
  /**
   * Verify Firebase token, sign in or register user, return app JWT
   */
  static async verifyAndSignIn(req, res) {
    const { idToken, userType, ...registrationData } = req.body;

    try {
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      // 1. Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, phone_number } = decodedToken;

      if (!phone_number) {
        return res
          .status(400)
          .json({ error: "Phone number missing from Firebase token" });
      }

      // 2. Find existing user by phone number
      let user = await User.findOne({ phoneNumber: phone_number });

      // 3. If user does not exist → register
      if (!user) {
        if (!userType) {
          return res
            .status(400)
            .json({ error: "userType is required for new registration." });
        }

        const userData = {
          firebaseUid: uid,
          phoneNumber: phone_number,
          userType, // keep track in schema
          ...registrationData,
        };

        switch (userType) {
          case "Consumer":
            user = new Consumer(userData);
            break;
          case "Manufacturer":
            user = new Manufacturer(userData);
            break;
          case "FarmerUnion":
            user = new FarmerUnion(userData);
            break;
          case "Laboratory":
            user = new Laboratory(userData);
            break;
          default:
            return res.status(400).json({ error: "Invalid user type" });
        }

        await user.save();
      }

      // 4. Generate app JWT
      const appToken = jwt.sign(
        { userId: user._id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 5. Return success response
      return res.status(200).json({
        message: "Authentication successful!",
        token: appToken,
        user,
      });
    } catch (error) {
      console.error("verifyAndSignIn error:", error);

      // Firebase specific error
      if (error.code === "auth/argument-error") {
        return res.status(400).json({ error: "Invalid Firebase ID token" });
      }

      return res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get profile from MongoDB using JWT middleware
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error("getProfile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user.userId, req.body, {
        new: true,
      });
      res.json({ message: "Profile updated", user });
    } catch (error) {
      console.error("updateProfile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
}

module.exports = { AuthController };