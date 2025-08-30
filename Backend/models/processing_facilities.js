const mongoose = require('mongoose');
const { Schema } = mongoose;

const processingFacilitiesSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  contact_info: { type: String },
  line_system_id: { type: String }
}, { timestamps: true });

processingFacilitiesSchema.index({ name: 1 });
processingFacilitiesSchema.index({ location: 1 });
processingFacilitiesSchema.index({ line_system_id: 1 });

module.exports = mongoose.model('ProcessingFacility', processingFacilitiesSchema);