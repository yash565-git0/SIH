const mongoose = require('mongoose');
const { Schema } = mongoose;

const productsSchema = new Schema({
  batch_id: { type: String, required: true },
  name: { type: String, required: true },
  packaging_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },
  retail_location: { type: String },
  status: { type: String, required: true },
  qr_code_id: { type: String, unique: true },
  manufacturer_id: { type: String }
}, { timestamps: true });

productsSchema.index({ batch_id: 1 });
productsSchema.index({ name: 1 });
productsSchema.index({ status: 1 });
productsSchema.index({ qr_code_id: 1 });
productsSchema.index({ manufacturer_id: 1 });
productsSchema.index({ expiry_date: 1 });
productsSchema.index({ retail_location: 1 });
productsSchema.index({ packaging_date: 1, expiry_date: 1 }); 

module.exports = mongoose.model('Product', productsSchema);