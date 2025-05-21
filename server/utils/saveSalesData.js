require('dotenv').config();
const mongoose = require('mongoose');


const SaleSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, required: true }
});

const Sale = mongoose.model('Sale', SaleSchema);

const salesData = [
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 10, date: new Date('2025-05-12') },
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 5,  date: new Date('2025-05-13') },
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 8,  date: new Date('2025-05-14') },
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 12, date: new Date('2025-05-15') },
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 7,  date: new Date('2025-05-16') },
  { itemId: '6825c0a5345b7710cbf4f5e9', quantity: 9,  date: new Date('2025-05-17') }
];

async function addSales() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Подключено к MongoDB');

    // Можно удалить предыдущие продажи этого товара, если нужно:
    // await Sale.deleteMany({ itemId: '6825c0a5345b7710cbf4f5e9' });

    await Sale.insertMany(salesData);
    console.log('Продажи добавлены');

    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

addSales();
