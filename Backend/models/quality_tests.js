const mongoose = require('mongoose');
const { Schema } = mongoose;

const qualityTestsSchema = new Schema({
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  lab_id: { type: String },
  test_type: { type: String, required: true },
  result: { type: String, required: true },
  result_value: { type: String },
  units: { type: String },
  timestamp: { type: Date, required: true },
  certificate_url: { type: String },
  fhir_bundle_url: { type: String }
}, { timestamps: true });

qualityTestsSchema.index({ batch_id: 1 });
qualityTestsSchema.index({ lab_id: 1 });
qualityTestsSchema.index({ test_type: 1 });
qualityTestsSchema.index({ result: 1 });
qualityTestsSchema.index({ timestamp: 1 });
qualityTestsSchema.index({ batch_id: 1, test_type: 1 }); 

module.exports = mongoose.model('QualityTest', qualityTestsSchema);