const mongoose = require('mongoose');
const { Schema } = mongoose;

const participantsSchema = new Schema({
  node_id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  contact_info: { type: String },
  location: { type: String }
}, { timestamps: true });

participantsSchema.index({ node_id: 1 });
participantsSchema.index({ name: 1 });
participantsSchema.index({ type: 1 });
participantsSchema.index({ location: 1 });

module.exports = mongoose.model('Participant', participantsSchema);