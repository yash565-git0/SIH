const jwt = require('jsonwebtoken');
const { User, Session } = require('../models/auth-models');
const speakeasy = require('speakeasy');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
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

// Authentication Controllers
class AuthController {
  
  // User Registration
  static async register(req, res) {
    try {
      const { email, password, userType, ...userData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      let user;
      switch (userType) {
        case 'Manufacturer':
          const { Manufacturer } = require('./auth-models');
          user = new Manufacturer({ email, password, ...userData });
          break;
        case 'Consumer':
          const { Consumer } = require('./auth-models');
          user = new Consumer({ email, password, ...userData });
          break;
        case 'FarmerUnion':
          const { FarmerUnion } = require('./auth-models');
          user = new FarmerUnion({ email, password, ...userData });
          break;
        case 'Laboratory':
          const { Laboratory } = require('./auth-models');
          user = new Laboratory({ email, password, ...userData });
          break;
        default:
          return res.status(400).json({ error: 'Invalid user type' });
      }

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  // User Login
  static async login(req, res) {
    try {
      const { email, password, twoFactorToken } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({ 
          error: 'Account temporarily locked due to too many failed login attempts' 
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Two-factor authentication check
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

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
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

  // Refresh Token
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

  // Logout
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
        name: `Fisheries App (${req.user.email})`,
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
      const user = await User.findById(req.user._id).select('-password -refreshToken -twoFactorSecret');
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
      delete updates.password;
      delete updates.email;
      delete updates.refreshToken;
      delete updates.twoFactorSecret;

      const user = await User.findByIdAndUpdate(
        userId, 
        updates, 
        { new: true, runValidators: true }
      ).select('-password -refreshToken -twoFactorSecret');

      res.json({
        message: 'Profile updated successfully',
        user
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  }
}

module.exports = {
  AuthController,
  authenticateToken,
  authorize,
  authLimiter
};
