const mongoose = require('mongoose');
const { Schema } = mongoose;

const consumerScansSchema = new Schema({
  product_id: { type: String, required: true },
  scan_timestamp: { type: Date, required: true },
  location: { type: String },
  device_type: { type: String },
  feedback: { type: String },
  qr_code_id: { type: String },
  consumer_id: { type: String }
}, { timestamps: true });

consumerScansSchema.index({ product_id: 1 });
consumerScansSchema.index({ scan_timestamp: 1 });
consumerScansSchema.index({ consumer_id: 1 });
consumerScansSchema.index({ qr_code_id: 1 });
consumerScansSchema.index({ location: 1 });

module.exports = mongoose.model('ConsumerScan', consumerScansSchema);