const mongoose = require('mongoose');
const { Schema } = mongoose;

const manufacturersSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  contact_info: { type: String },
  erp_system_id: { type: String }
}, { timestamps: true });

manufacturersSchema.index({ name: 1 });
manufacturersSchema.index({ location: 1 });
manufacturersSchema.index({ erp_system_id: 1 });

module.exports = mongoose.model('Manufacturer', manufacturersSchema);