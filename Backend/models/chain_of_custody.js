const mongoose = require('mongoose');
const { Schema } = mongoose;

const chainOfCustodySchema = new Schema({
  batch_id: { type: String, required: true },
  handoff_timestamp: { type: Date, required: true },
  from_participant_id: { type: String, required: true },
  to_participant_id: { type: String, required: true },
  handoff_method: { type: String },
  notes: { type: String }
}, { timestamps: true });

chainOfCustodySchema.index({ batch_id: 1 });
chainOfCustodySchema.index({ from_participant_id: 1 });
chainOfCustodySchema.index({ to_participant_id: 1 });
chainOfCustodySchema.index({ handoff_timestamp: 1 });
chainOfCustodySchema.index({ batch_id: 1, handoff_timestamp: 1 });

module.exports = mongoose.model('ChainOfCustody', chainOfCustodySchema);