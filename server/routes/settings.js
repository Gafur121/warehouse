const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Получить настройки поведения системы
router.get('/system-behavior', async (req, res) => {
  try {
    let settings = await Settings.findOne({ name: 'system-behavior' });
    if (!settings) {
      // Если настроек нет — создаём дефолтные
      settings = new Settings({ name: 'system-behavior' });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить настройки поведения системы
router.put('/system-behavior', async (req, res) => {
  try {
    const updated = await Settings.findOneAndUpdate(
      { name: 'system-behavior' },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
