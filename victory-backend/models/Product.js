const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Live Fish', 'Smoked Fish', 'Fish Feed', 'Fingerlings'] },
  price: { type: Number, required: true }, // in Naira
  weight: { type: String }, // e.g. "1kg", "5kg Bag", "Per Piece"
  image: { type: String, default: '/images/default.jpg' },
  description: { type: String },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);