const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

// Consumer Schema (Base User Model)
const consumerSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: String,
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
    marketingEmails: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Password hashing middleware
consumerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
consumerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT token generation
consumerSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      email: this.email, 
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
consumerSchema.index({ email: 1 });
consumerSchema.index({ firstName: 1, lastName: 1 });
consumerSchema.index({ phoneNumber: 1 });

const Consumer = mongoose.model('Consumer', consumerSchema);

// Manufacturer Model (Separate collection)
const manufacturerSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  companyName: { type: String, required: true },
  businessRegistrationNumber: { type: String, required: true, unique: true },
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
    phoneNumber: String,
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
  verificationDate: Date,
  documents: [{
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to manufacturer
manufacturerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

manufacturerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

manufacturerSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      email: this.email, 
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

manufacturerSchema.index({ email: 1 });
manufacturerSchema.index({ businessRegistrationNumber: 1 });
manufacturerSchema.index({ companyName: 1 });
manufacturerSchema.index({ isVerified: 1 });

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

// Farmer Union Model (Separate collection)
const farmerUnionSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  unionName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  establishedYear: Number,
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
    phoneNumber: String,
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
  verificationDate: Date,
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to farmerUnion
farmerUnionSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

farmerUnionSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

farmerUnionSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      email: this.email, 
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

farmerUnionSchema.index({ email: 1 });
farmerUnionSchema.index({ registrationNumber: 1 });
farmerUnionSchema.index({ unionName: 1 });
farmerUnionSchema.index({ isVerified: 1 });

const FarmerUnion = mongoose.model('FarmerUnion', farmerUnionSchema);

// Laboratory Model (Separate collection)
const laboratorySchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  labName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
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
    phoneNumber: String,
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
  accreditationDate: Date,
  qualityManagementSystem: String,
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

// Add the same methods to laboratory
laboratorySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

laboratorySchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

laboratorySchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      email: this.email, 
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

laboratorySchema.index({ email: 1 });
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

module.exports = {
  Consumer,
  Manufacturer,
  FarmerUnion,
  Laboratory,
  Session
};