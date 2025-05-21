const cron = require('node-cron');
const Item = require('../models/Item');
const Sale = require('../models/Sale'); // подключаем модель продаж

const calculateMinStock = async () => {
  try {
    const items = await Item.find();
    const today = new Date();

    const analysisDepth = 30;         // анализируем последние 30 дней
    const bufferCoefficient = 0.2;    // буфер 20%

    const sinceDate = new Date();
    sinceDate.setDate(today.getDate() - analysisDepth);

    for (let item of items) {
      // Находим все продажи конкретного товара за последние N дней
      const recentSales = await Sale.find({
        itemId: item._id,
        date: { $gte: sinceDate }
      });

      const totalSold = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const averageDailySales = totalSold / analysisDepth;

      const forecast = averageDailySales * analysisDepth;
      const buffer = forecast * bufferCoefficient;

      item.minStock = Math.ceil(forecast + buffer);
      await item.save();

      console.log(`✅ ${item.name}: minStock рассчитан как ${item.minStock}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при расчёте minStock:', error);
  }
};

// Запуск раз в минуту
cron.schedule('0 0 * * *', () => {
  console.log('⏰ Запуск перерасчёта минимального остатка...');
  calculateMinStock();
});

module.exports = calculateMinStock;
