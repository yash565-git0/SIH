const mongoose = require('mongoose');
const { Schema } = mongoose;

const cooperativesSchema = new Schema({
  name: { type: String, required: true },
  region: { type: String },
  contact_info: { type: String },
  conservation_credentials: { type: String }
}, { timestamps: true });

cooperativesSchema.index({ name: 1 });
cooperativesSchema.index({ region: 1 });

module.exports = mongoose.model('Cooperative', cooperativesSchema);