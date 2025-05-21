const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  deliveryDate: { type: Date }, // createdAt + leadTime
  status: { type: String, enum: ['pending', 'sent', 'delivered'], default: 'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
