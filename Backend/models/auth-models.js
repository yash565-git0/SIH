const mongoose = require('mongoose');
const { Schema } = mongoose;

// Base schema that all user types will share
const baseUserSchema = new Schema({
  firebaseUid: { // To link with the Firebase Auth user
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\+[1-9]\d{1,14}$/,
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true, // Allows multiple null values, but unique if provided
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: true }, // Verified by Firebase
  lastLogin: { type: Date },
}, { 
  timestamps: true, // Adds createdAt and updatedAt
  discriminatorKey: 'userType' // The field Mongoose will use to know the type
});

// The base User model
const User = mongoose.model('User', baseUserSchema);

// -- Discriminator Schemas for each user type --

// Consumer
const consumerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  preferences: {
    sustainabilityFocus: Boolean,
    allergens: [String],
  },
  scanHistory: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    scannedAt: Date,
  }],
});
const Consumer = User.discriminator('Consumer', consumerSchema);

// Manufacturer
const manufacturerSchema = new Schema({
  companyName: { type: String, required: true },
  businessRegistrationNumber: { type: String, required: true, unique: true },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  businessType: { type: String, enum: ['processor', 'packager', 'distributor', 'exporter'] },
  isVerified: { type: Boolean, default: false },
});
const Manufacturer = User.discriminator('Manufacturer', manufacturerSchema);

// FarmerUnion
const farmerUnionSchema = new Schema({
  unionName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  memberCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
});
const FarmerUnion = User.discriminator('FarmerUnion', farmerUnionSchema);

// Laboratory
const laboratorySchema = new Schema({
  labName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  isAccredited: { type: Boolean, default: false },
});
const Laboratory = User.discriminator('Laboratory', laboratorySchema);


module.exports = {
  User,
  Consumer,
  Manufacturer,
  FarmerUnion,
  Laboratory,
};