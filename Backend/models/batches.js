const mongoose = require('mongoose');
const { Schema } = mongoose;

const batchesSchema = new Schema({
  collection_event_ids: [{ type: Schema.Types.ObjectId, ref: 'CollectionEvent' }],
  species_id: { type: Schema.Types.ObjectId, ref: 'Species' },
  processing_step_ids: [{ type: String }],
  quality_test_ids: [{ type: String }],
  status: { type: String, required: true },
  current_location: { type: String },
  provenance_bundle_url: { type: String },
  recall_flag: { type: Boolean, default: false },
  qr_code_id: { type: String, unique: true }
}, { timestamps: true });

batchesSchema.index({ status: 1 });
batchesSchema.index({ species_id: 1 });
batchesSchema.index({ current_location: 1 });
batchesSchema.index({ recall_flag: 1 });
batchesSchema.index({ qr_code_id: 1 });
batchesSchema.index({ collection_event_ids: 1 });

module.exports = mongoose.model('Batch', batchesSchema);