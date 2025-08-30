const mongoose = require('mongoose');
const { Schema } = mongoose;

const qrCodesSchema = new Schema({
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  code: { type: String, required: true, unique: true },
  generated_at: { type: Date, required: true },
  scanned_count: { type: Number, default: 0 },
  last_scanned_at: { type: Date },
  consumer_feedback: { type: String }
}, { timestamps: true });

qrCodesSchema.index({ code: 1 });
qrCodesSchema.index({ batch_id: 1 });
qrCodesSchema.index({ generated_at: 1 });
qrCodesSchema.index({ scanned_count: 1 });
qrCodesSchema.index({ last_scanned_at: 1 });

module.exports = mongoose.model('QrCode', qrCodesSchema);