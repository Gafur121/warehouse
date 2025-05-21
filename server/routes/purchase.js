const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Item = require('../models/Item');

router.post('/purchase', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Неверные данные' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ error: 'Недостаточно товара на складе' });
    }

    // Обновляем количество на складе
    item.quantity -= quantity;
    await item.save();

    // Сохраняем запись о продаже
    const sale = new Sale({
      itemId,
      quantity,
      date: new Date()
    });
    await sale.save();

    res.json({ message: 'Продано успешно', item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
