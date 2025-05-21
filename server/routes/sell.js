const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Sale = require('../models/Sale');

router.post('/', async (req, res) => {
  const { itemId, quantity } = req.body;

  if (!itemId || quantity === undefined) {
    return res.status(400).json({ error: 'itemId и quantity обязательны' });
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Количество должно быть положительным числом' });
  }

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    if (qty > item.stock) {
      return res.status(400).json({ error: 'Недостаточно товара на складе' });
    }

    item.stock -= qty;
    await item.save();

    const today = new Date().toISOString().slice(0, 10);
    await Sale.create({ itemId, quantity: qty, date: today });

    res.json({ message: 'Продажа завершена', item });
  } catch (err) {
    console.error('Ошибка при продаже:', err);
    res.status(500).json({ error: 'Ошибка сервера при продаже' });
  }
});

module.exports = router;