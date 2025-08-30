const mongoose = require('mongoose');
const { Schema } = mongoose;

const collectorsSchema = new Schema({
  cooperative_id: { type: String },
  name: { type: String, required: true },
  type: { type: String },
  contact_info: { type: String },
  profile_url: { type: String },
  community_profile: { type: String }
}, { timestamps: true });

collectorsSchema.index({ cooperative_id: 1 });
collectorsSchema.index({ name: 1 });
collectorsSchema.index({ type: 1 });

module.exports = mongoose.model('Collector', collectorsSchema);