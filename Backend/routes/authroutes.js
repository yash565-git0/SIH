const express = require('express');
const { AuthController, authenticateToken, authorize, authLimiter, otpLimiter } = require('../controller/authcontroller');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Phone number validation helper
const phoneValidation = body('phoneNumber')
  .isMobilePhone('any', { strictMode: false })
  .withMessage('Please provide a valid phone number')
  .customSanitizer(value => {
    // Normalize phone number to E.164 format
    let normalized = value.replace(/\D/g, '');
    if (normalized.length === 10) {
      normalized = '1' + normalized; // Add US/Canada country code
    }
    return '+' + normalized;
  });

// OTP validation
const otpValidation = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be a 6-digit number');

// Base validation for registration
const baseRegisterValidation = [
  phoneValidation,
  body('userType')
    .isIn(['Manufacturer', 'Consumer', 'FarmerUnion', 'Laboratory'])
    .withMessage('Invalid user type'),
  otpValidation
];

// PUBLIC ROUTES (No authentication required)

// Send OTP for registration or login
router.post('/send-otp', [
  phoneValidation,
  body('purpose')
    .isIn(['register', 'login'])
    .withMessage('Purpose must be either register or login')
], handleValidationErrors, otpLimiter, AuthController.sendOTP);

// Resend OTP
router.post('/resend-otp', [
  phoneValidation,
  body('purpose')
    .isIn(['register', 'login', 'change_phone'])
    .withMessage('Invalid purpose')
], handleValidationErrors, otpLimiter, AuthController.resendOTP);

// User Registration - Different validation based on user type
router.post('/register/manufacturer', [
  ...baseRegisterValidation,
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('businessRegistrationNumber').notEmpty().withMessage('Business registration number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required'),
  body('businessType').isIn(['processor', 'packager', 'distributor', 'exporter']).withMessage('Invalid business type')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/consumer', [
  ...baseRegisterValidation,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/farmer-union', [
  ...baseRegisterValidation,
  body('unionName').notEmpty().withMessage('Union name is required'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/laboratory', [
  ...baseRegisterValidation,
  body('labName').notEmpty().withMessage('Laboratory name is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

// User Login with OTP
router.post('/login', [
  phoneValidation,
  otpValidation
], handleValidationErrors, authLimiter, AuthController.login);

// Refresh Token
router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], handleValidationErrors, AuthController.refreshToken);

// PROTECTED ROUTES (Authentication required)

// Logout
router.post('/logout', authenticateToken, AuthController.logout);

// Get user profile
router.get('/profile', authenticateToken, AuthController.getProfile);

// Update user profile (excluding phone number)
router.put('/profile', [
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
], handleValidationErrors, authenticateToken, AuthController.updateProfile);

// Change phone number (requires OTP verification)
router.put('/change-phone', [
  body('newPhoneNumber')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .customSanitizer(value => {
      let normalized = value.replace(/\D/g, '');
      if (normalized.length === 10) {
        normalized = '1' + normalized;
      }
      return '+' + normalized;
    }),
  otpValidation
], handleValidationErrors, authenticateToken, AuthController.changePhoneNumber);

// Send OTP for phone number change
router.post('/send-otp-change-phone', [
  body('newPhoneNumber')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .customSanitizer(value => {
      let normalized = value.replace(/\D/g, '');
      if (normalized.length === 10) {
        normalized = '1' + normalized;
      }
      return '+' + normalized;
    })
], handleValidationErrors, authenticateToken, otpLimiter, async (req, res, next) => {
  // Add purpose for phone change
  req.body.purpose = 'change_phone';
  req.body.phoneNumber = req.body.newPhoneNumber;
  AuthController.sendOTP(req, res, next);
});

// Two-Factor Authentication routes
router.post('/2fa/setup', authenticateToken, AuthController.setupTwoFactor);
router.post('/2fa/verify', [
  body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
], handleValidationErrors, authenticateToken, AuthController.verifyTwoFactor);

// ROLE-BASED PROTECTED ROUTES

// Manufacturer-only routes
router.get('/manufacturer/dashboard', 
  authenticateToken, 
  authorize('Manufacturer'), 
  (req, res) => {
    res.json({ 
      message: 'Manufacturer dashboard', 
      user: req.user,
      facilities: req.user.facilityIds || []
    });
  }
);

router.get('/manufacturer/verification-status',
  authenticateToken,
  authorize('Manufacturer'),
  (req, res) => {
    res.json({
      message: 'Manufacturer verification status',
      isVerified: req.user.isVerified,
      isPhoneVerified: req.user.isPhoneVerified,
      verificationDate: req.user.verificationDate,
      documents: req.user.documents || []
    });
  }
);

// Consumer-only routes  
router.get('/consumer/scan-history', 
  authenticateToken, 
  authorize('Consumer'), 
  (req, res) => {
    res.json({ 
      message: 'Consumer scan history', 
      scanHistory: req.user.scanHistory || [],
      preferences: req.user.preferences
    });
  }
);

router.put('/consumer/preferences',
  authenticateToken,
  authorize('Consumer'),
  [
    body('sustainabilityFocus').optional().isBoolean(),
    body('allergens').optional().isArray(),
    body('dietaryRestrictions').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { Consumer } = require('../models/auth-models');
      const updatedUser = await Consumer.findByIdAndUpdate(
        req.user._id,
        { preferences: req.body },
        { new: true, runValidators: true }
      ).select('-refreshToken -twoFactorSecret');
      
      res.json({
        message: 'Preferences updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
);

// Farmer Union-only routes
router.get('/farmer-union/members', 
  authenticateToken, 
  authorize('FarmerUnion'), 
  (req, res) => {
    res.json({ 
      message: 'Farmer union members', 
      memberCount: req.user.memberCount || 0,
      cooperatives: req.user.cooperativeIds || [],
      collectors: req.user.collectorIds || [],
      operatingRegions: req.user.operatingRegions || []
    });
  }
);

router.put('/farmer-union/update-members',
  authenticateToken,
  authorize('FarmerUnion'),
  [body('memberCount').isNumeric().withMessage('Member count must be a number')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { FarmerUnion } = require('../models/auth-models');
      const updatedUnion = await FarmerUnion.findByIdAndUpdate(
        req.user._id,
        { memberCount: req.body.memberCount },
        { new: true }
      ).select('-refreshToken -twoFactorSecret');
      
      res.json({
        message: 'Member count updated successfully',
        user: updatedUnion
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update member count' });
    }
  }
);

// Laboratory-only routes
router.get('/laboratory/test-queue', 
  authenticateToken, 
  authorize('Laboratory'), 
  (req, res) => {
    res.json({ 
      message: 'Laboratory test queue', 
      capabilities: req.user.testingCapabilities || [],
      equipment: req.user.equipmentList || [],
      accreditations: req.user.accreditations || []
    });
  }
);

router.post('/laboratory/add-capability',
  authenticateToken,
  authorize('Laboratory'),
  [
    body('testType').notEmpty().withMessage('Test type is required'),
    body('methodology').notEmpty().withMessage('Methodology is required'),
    body('turnaroundTime').notEmpty().withMessage('Turnaround time is required'),
    body('costPerTest').isNumeric().withMessage('Cost per test must be a number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { Laboratory } = require('../models/auth-models');
      const lab = await Laboratory.findById(req.user._id);
      
      lab.testingCapabilities.push(req.body);
      await lab.save();
      
      res.json({
        message: 'Testing capability added successfully',
        capabilities: lab.testingCapabilities
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add testing capability' });
    }
  }
);

// Multi-role routes (Admin functions)
router.get('/admin/users', 
  authenticateToken, 
  authorize('Manufacturer', 'Laboratory'), 
  async (req, res) => {
    try {
      const { Consumer, Manufacturer, FarmerUnion, Laboratory } = require('../models/auth-models');
      
      // Get users from all collections (limit for performance)
      const consumers = await Consumer.find({ isActive: true })
        .select('-refreshToken -twoFactorSecret')
        .limit(50);
      const manufacturers = await Manufacturer.find({ isActive: true })
        .select('-refreshToken -twoFactorSecret')
        .limit(50);
      const farmerUnions = await FarmerUnion.find({ isActive: true })
        .select('-refreshToken -twoFactorSecret')
        .limit(50);
      const laboratories = await Laboratory.find({ isActive: true })
        .select('-refreshToken -twoFactorSecret')
        .limit(50);

      const users = [
        ...consumers.map(u => ({ ...u.toObject(), userType: 'Consumer' })),
        ...manufacturers.map(u => ({ ...u.toObject(), userType: 'Manufacturer' })),
        ...farmerUnions.map(u => ({ ...u.toObject(), userType: 'FarmerUnion' })),
        ...laboratories.map(u => ({ ...u.toObject(), userType: 'Laboratory' }))
      ];

      res.json({ 
        users,
        summary: {
          consumers: consumers.length,
          manufacturers: manufacturers.length,
          farmerUnions: farmerUnions.length,
          laboratories: laboratories.length,
          total: users.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get user statistics
router.get('/admin/stats',
  authenticateToken,
  authorize('Manufacturer', 'Laboratory', 'FarmerUnion'),
  async (req, res) => {
    try {
      const { Consumer, Manufacturer, FarmerUnion, Laboratory } = require('../models/auth-models');
      
      const stats = {
        users: {
          consumers: await Consumer.countDocuments({ isActive: true }),
          manufacturers: await Manufacturer.countDocuments({ isActive: true }),
          farmerUnions: await FarmerUnion.countDocuments({ isActive: true }),
          laboratories: await Laboratory.countDocuments({ isActive: true })
        },
        verification: {
          verifiedManufacturers: await Manufacturer.countDocuments({ isVerified: true }),
          verifiedFarmerUnions: await FarmerUnion.countDocuments({ isVerified: true }),
          accreditedLabs: await Laboratory.countDocuments({ isAccredited: true })
        },
        phoneVerification: {
          verifiedConsumers: await Consumer.countDocuments({ isPhoneVerified: true }),
          verifiedManufacturers: await Manufacturer.countDocuments({ isPhoneVerified: true }),
          verifiedFarmerUnions: await FarmerUnion.countDocuments({ isPhoneVerified: true }),
          verifiedLaboratories: await Laboratory.countDocuments({ isPhoneVerified: true })
        }
      };

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
);

// Verify user account (Admin only - for Manufacturers and FarmerUnions)
router.put('/admin/verify-user/:userId',
  authenticateToken,
  authorize('Laboratory'), // Only labs can verify other entities
  [
    body('userType').isIn(['Manufacturer', 'FarmerUnion']).withMessage('Can only verify Manufacturers and FarmerUnions'),
    body('verified').isBoolean().withMessage('Verified status must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { userType, verified } = req.body;
      
      let Model;
      if (userType === 'Manufacturer') {
        Model = require('../models/auth-models').Manufacturer;
      } else if (userType === 'FarmerUnion') {
        Model = require('../models/auth-models').FarmerUnion;
      }

      const user = await Model.findByIdAndUpdate(
        userId,
        { 
          isVerified: verified,
          verificationDate: verified ? new Date() : null
        },
        { new: true }
      ).select('-refreshToken -twoFactorSecret');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: `${userType} ${verified ? 'verified' : 'unverified'} successfully`,
        user
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update verification status' });
    }
  }
);

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Phone Authentication Service',
    features: [
      'Phone Number Authentication',
      'OTP Verification', 
      'JWT Tokens',
      'Two-Factor Authentication',
      'Role-based Access Control',
      'Rate Limiting'
    ]
  });
});

// Test route to check phone number formatting
router.post('/test-phone-format', [
  phoneValidation
], handleValidationErrors, (req, res) => {
  res.json({
    originalPhone: req.body.phoneNumber,
    formattedPhone: req.body.phoneNumber,
    message: 'Phone number format test successful'
  });
});
module.exports = router;