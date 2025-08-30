const mongoose = require('mongoose');
const { Schema } = mongoose;

const consumersSchema = new Schema({
  name: { type: String, required: true },
  contact_info: { type: String },
  registration_date: { type: Date, required: true },
  region: { type: String }
}, { timestamps: true });

consumersSchema.index({ name: 1 });
consumersSchema.index({ region: 1 });
consumersSchema.index({ registration_date: 1 });

module.exports = mongoose.model('Consumer', consumersSchema);