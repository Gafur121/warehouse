// models/Settings.js
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  name: { type: String, unique: true }, // например, "system-behavior"
  mode: { type: String, default: 'auto' },
  analysisDepth: { type: Number, default: 14 },
  minStockAlgorithm: { type: String, default: 'average' },
});

module.exports = mongoose.model('Settings', SettingsSchema);
