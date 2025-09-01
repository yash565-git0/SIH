const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

const otpSchema = new Schema({
  phoneNumber: { 
    type: String, 
    required: true,
    match: /^\+[1-9]\d{1,14}$/ 
  },
  otpCode: { 
    type: String, 
    required: true,
    length: 6
  },
  purpose: { 
    type: String, 
    enum: ['register', 'login', 'change_phone', 'password_reset'], 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  attempts: { 
    type: Number, 
    default: 0,
    max: 3
  },
  verified: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Indexes for OTP
otpSchema.index({ phoneNumber: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

const OTP = mongoose.model('OTP', otpSchema);

// Consumer Schema (Base User Model)
const consumerSchema = new Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\+[1-9]\d{1,14}$/ // E.164 format validation
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { // Optional for notifications
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    sustainabilityFocus: { type: Boolean, default: false },
    allergens: [String],
    dietaryRestrictions: [String]
  },
  scanHistory: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    scannedAt: { type: Date, default: Date.now },
    location: String
  }],
  privacySettings: {
    shareLocation: { type: Boolean, default: false },
    sharePreferences: { type: Boolean, default: false },
    marketingMessages: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// JWT token generation for Consumer
consumerSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      phoneNumber: this.phoneNumber, 
      userType: 'Consumer'
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

consumerSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Account lockout methods
consumerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

consumerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Indexes
consumerSchema.index({ phoneNumber: 1 });
consumerSchema.index({ firstName: 1, lastName: 1 });
consumerSchema.index({ email: 1 }, { sparse: true });

const Consumer = mongoose.model('Consumer', consumerSchema);

// Manufacturer Model (Separate collection)
const manufacturerSchema = new Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\+[1-9]\d{1,14}$/ // E.164 format validation
  },
  companyName: { type: String, required: true },
  businessRegistrationNumber: { type: String, required: true, unique: true },
  email: { // Optional for business communications
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    alternatePhone: String,
    position: String
  },
  businessType: { 
    type: String, 
    enum: ['processor', 'packager', 'distributor', 'exporter'],
    required: true 
  },
  certifications: [{
    name: String,
    issuedBy: String,
    validFrom: Date,
    validUntil: Date,
    certificateUrl: String
  }],
  facilityIds: [{ type: Schema.Types.ObjectId, ref: 'ProcessingFacility' }],
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  verificationDate: Date,
  documents: [{
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to manufacturer
manufacturerSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      phoneNumber: this.phoneNumber, 
      userType: 'Manufacturer'
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

manufacturerSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

manufacturerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

manufacturerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

manufacturerSchema.index({ phoneNumber: 1 });
manufacturerSchema.index({ businessRegistrationNumber: 1 });
manufacturerSchema.index({ companyName: 1 });
manufacturerSchema.index({ isVerified: 1 });

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

// Farmer Union Model (Separate collection)
const farmerUnionSchema = new Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\+[1-9]\d{1,14}$/ // E.164 format validation
  },
  unionName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  establishedYear: Number,
  email: { // Optional for official communications
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    alternatePhone: String,
    position: String
  },
  memberCount: { type: Number, default: 0 },
  cooperativeIds: [{ type: Schema.Types.ObjectId, ref: 'Cooperative' }],
  collectorIds: [{ type: Schema.Types.ObjectId, ref: 'Collector' }],
  operatingRegions: [String],
  certifications: [{
    name: String,
    issuedBy: String,
    validFrom: Date,
    validUntil: Date,
    certificateUrl: String
  }],
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  verificationDate: Date,
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to farmerUnion
farmerUnionSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      phoneNumber: this.phoneNumber, 
      userType: 'FarmerUnion'
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

farmerUnionSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

farmerUnionSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

farmerUnionSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

farmerUnionSchema.index({ phoneNumber: 1 });
farmerUnionSchema.index({ registrationNumber: 1 });
farmerUnionSchema.index({ unionName: 1 });
farmerUnionSchema.index({ isVerified: 1 });

const FarmerUnion = mongoose.model('FarmerUnion', farmerUnionSchema);

// Laboratory Model (Separate collection)
const laboratorySchema = new Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\+[1-9]\d{1,14}$/ // E.164 format validation
  },
  labName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  email: { // Optional for lab reports and communications
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    alternatePhone: String,
    position: String
  },
  accreditations: [{
    name: String,
    issuedBy: String,
    validFrom: Date,
    validUntil: Date,
    certificateUrl: String
  }],
  testingCapabilities: [{
    testType: String,
    methodology: String,
    turnaroundTime: String,
    costPerTest: Number
  }],
  equipmentList: [{
    name: String,
    model: String,
    calibrationDate: Date,
    nextCalibrationDue: Date
  }],
  isAccredited: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  accreditationDate: Date,
  qualityManagementSystem: String,
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to laboratory
laboratorySchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      phoneNumber: this.phoneNumber, 
      userType: 'Laboratory'
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

laboratorySchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

laboratorySchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

laboratorySchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

laboratorySchema.index({ phoneNumber: 1 });
laboratorySchema.index({ licenseNumber: 1 });
laboratorySchema.index({ labName: 1 });
laboratorySchema.index({ isAccredited: 1 });

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

// Session Management Schema
const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['Consumer', 'Manufacturer', 'FarmerUnion', 'Laboratory'], required: true },
  refreshToken: { type: String, required: true },
  userAgent: String,
  ipAddress: String,
  createdAt: { type: Date, default: Date.now, expires: 604800 } // 7 days
});

sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshToken: 1 });

const Session = mongoose.model('Session', sessionSchema);

// Create a unified User model for easy querying across all user types
const User = {
  findOne: async (query) => {
    // Try to find in all user collections
    let user = await Consumer.findOne(query);
    if (user) return { ...user.toObject(), userType: 'Consumer' };
    
    user = await Manufacturer.findOne(query);
    if (user) return { ...user.toObject(), userType: 'Manufacturer' };
    
    user = await FarmerUnion.findOne(query);
    if (user) return { ...user.toObject(), userType: 'FarmerUnion' };
    
    user = await Laboratory.findOne(query);
    if (user) return { ...user.toObject(), userType: 'Laboratory' };
    
    return null;
  },
  
  findById: async (id) => {
    // Try to find in all user collections
    let user = await Consumer.findById(id);
    if (user) return { ...user.toObject(), userType: 'Consumer' };
    
    user = await Manufacturer.findById(id);
    if (user) return { ...user.toObject(), userType: 'Manufacturer' };
    
    user = await FarmerUnion.findById(id);
    if (user) return { ...user.toObject(), userType: 'FarmerUnion' };
    
    user = await Laboratory.findById(id);
    if (user) return { ...user.toObject(), userType: 'Laboratory' };
    
    return null;
  }
};

module.exports = {
  Consumer,
  Manufacturer,
  FarmerUnion,
  Laboratory,
  Session,
  OTP,
  User
};