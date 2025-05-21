const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  apiUrl: String,
  deliveryDays: { type: Number, default: 3 }
});

module.exports = mongoose.model('Supplier', supplierSchema);
