const mongoose = require('mongoose');
const { Schema } = mongoose;

const processingStepsSchema = new Schema({
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  step_type: { type: String, required: true },
  timestamp: { type: Date, required: true },
  conditions: { type: String },
  notes: { type: String },
  facility_id: { type: Schema.Types.ObjectId, ref: 'ProcessingFacility' },
  quality_id: { type: Schema.Types.ObjectId, ref: 'QualityTest' },
  operator_id: { type: Schema.Types.ObjectId, ref: 'Participant' }
}, { timestamps: true });

processingStepsSchema.index({ batch_id: 1 });
processingStepsSchema.index({ step_type: 1 });
processingStepsSchema.index({ timestamp: 1 });
processingStepsSchema.index({ facility_id: 1 });
processingStepsSchema.index({ operator_id: 1 });
processingStepsSchema.index({ batch_id: 1, timestamp: 1 });

module.exports = mongoose.model('ProcessingStep', processingStepsSchema);