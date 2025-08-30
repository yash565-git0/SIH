const mongoose = require('mongoose');
const { Schema } = mongoose;

const collectionEventsSchema = new Schema({
  sustainability_compliance_id: { type: String },
  collector_id: { type: String },
  cooperative_id: { type: String },
  species_id: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date },
  harvest_method: { type: String },
  initial_quality_metrics: { type: String },
  environmental_conditions: { type: String },
  notes: { type: String },
  batch_id: { type: String }
}, { timestamps: true });

collectionEventsSchema.index({ collector_id: 1 });
collectionEventsSchema.index({ cooperative_id: 1 });
collectionEventsSchema.index({ species_id: 1 });
collectionEventsSchema.index({ timestamp: 1 });
collectionEventsSchema.index({ batch_id: 1 });
collectionEventsSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('CollectionEvent', collectionEventsSchema);