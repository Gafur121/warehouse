const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Молочные продукты', calculationMethod: 'average', analysisDepth: 7, buffer: 0.3 },
  { name: 'Хлебобулочные изделия', calculationMethod: 'average', analysisDepth: 3, buffer: 0.4 },
  { name: 'Бытовая химия', calculationMethod: 'fixed', analysisDepth: 30, buffer: 0.1 },
  { name: 'Консервы', calculationMethod: 'exponential', analysisDepth: 60, buffer: 0.15 },
  { name: 'Фрукты и овощи', calculationMethod: 'average', analysisDepth: 7, buffer: 0.3 }
];

module.exports = async function preloadCategories() {
  for (const cat of defaultCategories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`Добавлена категория: ${cat.name}`);
    }
  }
};
