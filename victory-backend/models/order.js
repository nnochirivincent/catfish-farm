const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  items: [
    { name: String, price: Number, qty: Number, image: String }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' }, // pending, paid, failed
  paystackRef: { type: String },
  deliveryAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);