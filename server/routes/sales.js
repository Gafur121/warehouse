const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Sale = require('../models/Sale');  // модель продаж

router.get('/:itemId/sales', async (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Неверный ID товара' });
  }

  try {
    const sales = await Sale.aggregate([
      { $match: { itemId: new mongoose.Types.ObjectId(itemId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          quantity: { $sum: "$quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Преобразуем в формат { date, quantity }
    const result = sales.map(s => ({ date: s._id, quantity: s.quantity }));

    res.json(result);
  } catch (err) {
    console.error('Ошибка получения статистики продаж:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
