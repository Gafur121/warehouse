const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  analysisDepth: { type: Number, default: 30 }, // в днях
  bufferCoefficient: { type: Number, default: 0.2 },
  algorithm: { type: String, enum: ['average', 'exponential', 'fixed'], default: 'average' }
});

module.exports = mongoose.model('Category', categorySchema);
