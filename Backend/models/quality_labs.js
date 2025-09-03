const mongoose = require('mongoose');
const { Schema } = mongoose;

const qualityLabsSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  contact_info: { type: String },
  accreditation: { type: String }
}, { timestamps: true });

qualityLabsSchema.index({ name: 1 });
qualityLabsSchema.index({ location: 1 });
qualityLabsSchema.index({ accreditation: 1 });

module.exports = mongoose.model('QualityLab', qualityLabsSchema);