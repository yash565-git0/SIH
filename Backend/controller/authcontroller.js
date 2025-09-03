const jwt = require('jsonwebtoken');
const { User, Session, OTP } = require('../models/auth-models');
const speakeasy = require('speakeasy');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const twilio = require('twilio');

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(`SMS sent to ${phoneNumber}: SID ${response.sid}`);
  } catch (err) {
    console.error('Twilio SMS error:', err);
    throw new Error('Failed to send SMS');
  }
};

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1, // limit each IP to 1 OTP request per minute
  message: 'Too many OTP requests, please wait before requesting again',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.userType
      });
    }

    next();
  };
};

// Utility function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Utility function to normalize phone number
const normalizePhoneNumber = (phoneNumber) => {
  // Remove all non-digits and add country code if missing
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // Add default country code (adjust as needed)
  if (normalized.length === 10) {
    normalized = '1' + normalized; // US/Canada default
  }
  
  return '+' + normalized;
};

// Authentication Controllers
class AuthController {
  
  // Send OTP for Registration/Login
  static async sendOTP(req, res) {
    try {
      const { phoneNumber, purpose } = req.body; // purpose: 'register' or 'login'
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // Check if user exists for login, or doesn't exist for registration
      const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
      
      if (purpose === 'register' && existingUser) {
        return res.status(400).json({ error: 'User already exists with this phone number' });
      }
      
      if (purpose === 'login' && !existingUser) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await OTP.findOneAndUpdate(
        { phoneNumber: normalizedPhone, purpose },
        { 
          otpCode,
          expiresAt,
          attempts: 0,
          verified: false
        },
        { upsert: true, new: true }
      );

      // Send SMS
      const message = `Your verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code.`;
      await sendSMS(normalizedPhone, message);

      res.json({ 
        message: 'OTP sent successfully',
        phoneNumber: normalizedPhone
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  // Verify OTP and Register User
  static async register(req, res) {
    try {
      const { phoneNumber, otp, userType, ...userData } = req.body;

      if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      // Find and verify OTP
      const otpRecord = await OTP.findOne({ 
        phoneNumber: normalizedPhone, 
        purpose: 'register',
        otpCode: otp,
        expiresAt: { $gt: new Date() },
        verified: false
      });

      if (!otpRecord) {
        // Increment attempts if OTP exists but is wrong
        await OTP.updateOne(
          { phoneNumber: normalizedPhone, purpose: 'register' },
          { $inc: { attempts: 1 } }
        );
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Check attempts limit
      if (otpRecord.attempts >= 3) {
        return res.status(429).json({ error: 'Too many failed attempts. Request a new OTP.' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this phone number' });
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Create user based on type
      let user;
      switch (userType) {
        case 'Manufacturer':
          const { Manufacturer } = require('./auth-models');
          user = new Manufacturer({ phoneNumber: normalizedPhone, ...userData });
          break;
        case 'Consumer':
          const { Consumer } = require('./auth-models');
          user = new Consumer({ phoneNumber: normalizedPhone, ...userData });
          break;
        case 'FarmerUnion':
          const { FarmerUnion } = require('./auth-models');
          user = new FarmerUnion({ phoneNumber: normalizedPhone, ...userData });
          break;
        case 'Laboratory':
          const { Laboratory } = require('./auth-models');
          user = new Laboratory({ phoneNumber: normalizedPhone, ...userData });
          break;
        default:
          return res.status(400).json({ error: 'Invalid user type' });
      }

      await user.save();

      // Clean up OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.refreshToken;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  // Verify OTP and Login User
  static async login(req, res) {
    try {
      const { phoneNumber, otp, twoFactorToken } = req.body;

      if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      // Find and verify OTP
      const otpRecord = await OTP.findOne({ 
        phoneNumber: normalizedPhone, 
        purpose: 'login',
        otpCode: otp,
        expiresAt: { $gt: new Date() },
        verified: false
      });

      if (!otpRecord) {
        // Increment attempts if OTP exists but is wrong
        await OTP.updateOne(
          { phoneNumber: normalizedPhone, purpose: 'login' },
          { $inc: { attempts: 1 } }
        );
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Check attempts limit
      if (otpRecord.attempts >= 3) {
        return res.status(429).json({ error: 'Too many failed attempts. Request a new OTP.' });
      }

      // Find user
      const user = await User.findOne({ phoneNumber: normalizedPhone });
      
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({ 
          error: 'Account temporarily locked due to too many failed login attempts' 
        });
      }

      // Two-factor authentication check (if enabled)
      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          return res.status(200).json({ 
            requiresTwoFactor: true,
            message: 'Two-factor authentication required' 
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 2
        });

        if (!verified) {
          return res.status(401).json({ error: 'Invalid two-factor authentication code' });
        }
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Save refresh token
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      // Create session record
      await Session.create({
        userId: user._id,
        refreshToken,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      // Clean up OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.refreshToken;
      delete userResponse.twoFactorSecret;

      res.json({
        message: 'Login successful',
        user: userResponse,
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Resend OTP
  static async resendOTP(req, res) {
    try {
      const { phoneNumber, purpose } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      // Check if there's a recent OTP request (rate limiting)
      const recentOTP = await OTP.findOne({
        phoneNumber: normalizedPhone,
        purpose,
        createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // within last minute
      });

      if (recentOTP) {
        return res.status(429).json({ error: 'Please wait before requesting another OTP' });
      }

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await OTP.findOneAndUpdate(
        { phoneNumber: normalizedPhone, purpose },
        { 
          otpCode,
          expiresAt,
          attempts: 0,
          verified: false
        },
        { upsert: true, new: true }
      );

      // Send SMS
      const message = `Your verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code.`;
      await sendSMS(normalizedPhone, message);

      res.json({ 
        message: 'OTP resent successfully',
        phoneNumber: normalizedPhone
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: 'Failed to resend OTP' });
    }
  }

  // Refresh Token (unchanged)
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user and session
      const user = await User.findById(decoded.userId);
      const session = await Session.findOne({ refreshToken, userId: decoded.userId });

      if (!user || !session || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Update user and session
      user.refreshToken = newRefreshToken;
      await user.save();

      session.refreshToken = newRefreshToken;
      await session.save();

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(403).json({ error: 'Token refresh failed' });
    }
  }

  // Logout (unchanged)
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user._id;

      // Remove refresh token from user
      await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

      // Remove session
      if (refreshToken) {
        await Session.deleteOne({ refreshToken, userId });
      }

      res.json({ message: 'Logout successful' });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Setup Two-Factor Authentication
  static async setupTwoFactor(req, res) {
    try {
      const userId = req.user._id;
      
      const secret = speakeasy.generateSecret({
        name: `Fisheries App (${req.user.phoneNumber})`,
        issuer: 'Fisheries Traceability'
      });

      // Save secret temporarily (not enabled until verified)
      await User.findByIdAndUpdate(userId, { 
        twoFactorSecret: secret.base32 
      });

      res.json({
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url,
        manualEntryKey: secret.base32
      });

    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Two-factor setup failed' });
    }
  }

  // Verify and Enable Two-Factor Authentication
  static async verifyTwoFactor(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId);

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      await user.save();

      res.json({ message: 'Two-factor authentication enabled successfully' });

    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: 'Two-factor verification failed' });
    }
  }

  // Get Current User Profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-refreshToken -twoFactorSecret');
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Update User Profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updates.phoneNumber; // Phone number changes should require OTP verification
      delete updates.refreshToken;
      delete updates.twoFactorSecret;

      const user = await User.findByIdAndUpdate(
        userId, 
        updates, 
        { new: true, runValidators: true }
      ).select('-refreshToken -twoFactorSecret');

      res.json({
        message: 'Profile updated successfully',
        user
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  }

  // Change Phone Number (requires OTP verification)
  static async changePhoneNumber(req, res) {
    try {
      const { newPhoneNumber, otp } = req.body;
      const userId = req.user._id;

      if (!newPhoneNumber || !otp) {
        return res.status(400).json({ error: 'New phone number and OTP are required' });
      }

      const normalizedPhone = normalizePhoneNumber(newPhoneNumber);

      // Verify OTP for new phone number
      const otpRecord = await OTP.findOne({ 
        phoneNumber: normalizedPhone, 
        purpose: 'change_phone',
        otpCode: otp,
        expiresAt: { $gt: new Date() },
        verified: false
      });

      if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Check if new phone number is already in use
      const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }

      // Update user's phone number
      const user = await User.findByIdAndUpdate(
        userId,
        { phoneNumber: normalizedPhone },
        { new: true }
      ).select('-refreshToken -twoFactorSecret');

      // Mark OTP as verified and clean up
      await OTP.deleteOne({ _id: otpRecord._id });

      res.json({
        message: 'Phone number updated successfully',
        user
      });

    } catch (error) {
      console.error('Change phone number error:', error);
      res.status(500).json({ error: 'Failed to change phone number' });
    }
  }
}

module.exports = {
  AuthController,
  authenticateToken,
  authorize,
  authLimiter,
  otpLimiter
};