const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');

// Получить все товары
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('categoryId').populate('warehouse');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получить товар по ID
router.get('/:id', getItem, (req, res) => {
  res.json(res.item);
});

// ✅ Получить товары по складу
router.get('/warehouse/:warehouseId', async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;

    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: 'Неверный ID склада' });
    }

    const items = await Item.find({ warehouse: warehouseId }).populate('categoryId').populate('warehouse');
    res.json(items);

  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товаров по складу' });
  }
});

// Добавить новый товар
router.post('/', async (req, res) => {
  console.log('Тело запроса при добавлении товара:', req.body);

  let leadTime = req.body.leadTime;

  // Если leadTime не указан — взять его от поставщика
  if (!leadTime && req.body.supplierId) {
    try {
      const supplier = await Supplier.findById(req.body.supplierId);
      if (supplier && supplier.deliveryDays) {
        leadTime = supplier.deliveryDays;
      }
    } catch (error) {
      console.error('Ошибка при получении поставщика:', error);
      return res.status(500).json({ message: 'Ошибка при получении данных поставщика' });
    }
  }

  const item = new Item({
    name: req.body.name,
    stock: req.body.stock,
    minStock: req.body.minStock,
    salesHistory: req.body.salesHistory || [],
    warehouse: req.body.warehouse,
    categoryId: req.body.categoryId,
    supplierId: req.body.supplierId,
    leadTime
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Добавление продажи к товару
router.post('/:id/sell', async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.id;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Неверное количество' });
  }

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Товар не найден' });

    item.salesHistory.push({ date: new Date(), quantity });
    item.stock -= quantity;

    await item.save();
    res.json({ message: 'Продажа зарегистрирована', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при добавлении продажи' });
  }
});

// Мидлвар для поиска товара по ID
async function getItem(req, res, next) {
  let item;
  try {
    item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.item = item;
  next();
}

module.exports = router;
