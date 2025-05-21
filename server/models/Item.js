const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true },
  minStock: { type: Number },
  leadTime: { type: Number },
  salesHistory: [
    {
      date: { type: Date, default: Date.now },
      quantity: Number,
    },
  ],
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category'},


supplierId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Supplier'
},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
