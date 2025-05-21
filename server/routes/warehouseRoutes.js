const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');

// Создание склада
router.post('/', async (req, res) => {
  try {
    const warehouse = new Warehouse({ name: req.body.name });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании склада' });
  }
});

// Получение всех складов
router.get('/', async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении складов' });
  }
});

module.exports = router;
