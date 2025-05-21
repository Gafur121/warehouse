const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// Получить всех поставщиков
router.get('/', async (req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

// Создать нового поставщика
router.post('/', async (req, res) => {
  const newSupplier = new Supplier(req.body);
  const saved = await newSupplier.save();
  res.status(201).json(saved);
});

// Обновить поставщика
router.put('/:id', async (req, res) => {
  const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Удалить поставщика
router.delete('/:id', async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
