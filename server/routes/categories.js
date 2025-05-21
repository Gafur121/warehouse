const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Получить все категории
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Добавить новую категорию
router.post('/', async (req, res) => {
  const newCategory = new Category(req.body);
  await newCategory.save();
  res.json(newCategory);
});

// Обновить категорию
router.put('/:id', async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Удалить категорию
router.delete('/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Удалено' });
});

module.exports = router;
