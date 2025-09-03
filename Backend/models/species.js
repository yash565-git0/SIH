const mongoose = require('mongoose');
const { Schema } = mongoose;

const speciesSchema = new Schema({
  scientific_name: { type: String, required: true },
  common_name: { type: String },
  conservation_status: { type: String },
  approved_zones: { type: String },
  seasonal_restrictions: { type: String },
  nmfs_guidelines: { type: String }
}, { timestamps: true });

speciesSchema.index({ scientific_name: 1 });
speciesSchema.index({ common_name: 1 });
speciesSchema.index({ conservation_status: 1 });

module.exports = mongoose.model('Species', speciesSchema);