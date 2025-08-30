const mongoose = require('mongoose');
const { Schema } = mongoose;

const sustainabilityComplianceSchema = new Schema({
  compliance_type: { type: String, required: true },
  status: { type: String, required: true },
  validated_by: { type: String },
  validation_timestamp: { type: Date },
  certificate_url: { type: String },
  notes: { type: String },
  collection_event_id: { type: Schema.Types.ObjectId, ref: 'CollectionEvent' }
}, { timestamps: true });

sustainabilityComplianceSchema.index({ compliance_type: 1 });
sustainabilityComplianceSchema.index({ status: 1 });
sustainabilityComplianceSchema.index({ collection_event_id: 1 });
sustainabilityComplianceSchema.index({ validation_timestamp: 1 });

module.exports = mongoose.model('SustainabilityCompliance', sustainabilityComplianceSchema);