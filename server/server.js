const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

dotenv.config();

// Настройка Nodemailer (можно заменить на другой сервис)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Импорты маршрутов
const itemRoutes = require("./routes/items");
const orderRoutes = require("./routes/orders");
const sellRoutes = require("./routes/sell");
const warehouseRoutes = require("./routes/warehouseRoutes");
const settingsRoutes = require("./routes/settings");
const categoryRoutes = require("./routes/categories");
const purchaseRoute = require("./routes/purchase");
const salesRoutes = require("./routes/sales");
const supplierRoutes = require("./routes/suppliers");

const app = express();

app.use(express.json());
app.use(cors());

// Подключение маршрутов
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purchase", purchaseRoute);
app.use("/api/items", salesRoutes);
app.use("/api/suppliers", supplierRoutes);

// Планировщики
require("./cron/InventoryCron");
require("./cron/AutoOrderCron");

// Предустановка категорий
const preloadCategories = require("./utils/preloadCategories");
preloadCategories();

// Обработчик ошибок — должен быть после всех маршрутов и middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Подключение к базе данных
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Подключено к базе данных"))
  .catch((err) => console.error("❌ Ошибка подключения к базе данных:", err));

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер работает на порту ${PORT}`);
});
