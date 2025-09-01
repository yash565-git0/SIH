const express = require('express');
const { AuthController, authenticateToken, authorize, authLimiter } = require('..controller/');
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

// Registration validation
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 8 characters including uppercase, lowercase, number, and special character'),
  body('userType')
    .isIn(['Manufacturer', 'Consumer', 'FarmerUnion', 'Laboratory'])
    .withMessage('Invalid user type')
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// PUBLIC ROUTES (No authentication required)

// User Registration - Different validation based on user type
router.post('/register/manufacturer', [
  ...registerValidation,
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('businessRegistrationNumber').notEmpty().withMessage('Business registration number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required'),
  body('businessType').isIn(['processor', 'packager', 'distributor', 'exporter']).withMessage('Invalid business type')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/consumer', [
  ...registerValidation,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/farmer-union', [
  ...registerValidation,
  body('unionName').notEmpty().withMessage('Union name is required'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

router.post('/register/laboratory', [
  ...registerValidation,
  body('labName').notEmpty().withMessage('Laboratory name is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact person first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact person last name is required')
], handleValidationErrors, authLimiter, AuthController.register);

// User Login
router.post('/login', loginValidation, handleValidationErrors, authLimiter, AuthController.login);

// Refresh Token
router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], handleValidationErrors, AuthController.refreshToken);

// PROTECTED ROUTES (Authentication required)

// Logout
router.post('/logout', authenticateToken, AuthController.logout);

// Get user profile
router.get('/profile', authenticateToken, AuthController.getProfile);

// Update user profile
router.put('/profile', authenticateToken, AuthController.updateProfile);

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
      facilities: req.user.facilityIds 
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
      scanHistory: req.user.scanHistory 
    });
  }
);

// Farmer Union-only routes
router.get('/farmer-union/members', 
  authenticateToken, 
  authorize('FarmerUnion'), 
  (req, res) => {
    res.json({ 
      message: 'Farmer union members', 
      memberCount: req.user.memberCount,
      cooperatives: req.user.cooperativeIds 
    });
  }
);

// Laboratory-only routes
router.get('/laboratory/test-queue', 
  authenticateToken, 
  authorize('Laboratory'), 
  (req, res) => {
    res.json({ 
      message: 'Laboratory test queue', 
      capabilities: req.user.testingCapabilities 
    });
  }
);

// Multi-role routes (Admin functions)
router.get('/admin/users', 
  authenticateToken, 
  authorize('Manufacturer', 'Laboratory'), 
  async (req, res) => {
    try {
      const { User } = require('./auth-models');
      const users = await User.find({ isActive: true }).select('-password -refreshToken');
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Authentication Service' 
  });
});

module.exports = router;