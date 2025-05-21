const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Item = require("../models/Item");
const Supplier = require("../models/Supplier");
const sendEmail = require("../utils/email");
const { sendOrderEmail, sendOrderStatusEmail } = require("../utils/email");
const axios = require("axios");
const sendOrderToApi = require("../utils/apiSender");

// Входящий webhook для подтверждения заказа от поставщика
router.post("/confirm", async (req, res) => {
  try {
    const { product, quantity, expectedArrival } = req.body;

    if (!product || !quantity || !expectedArrival) {
      return res.status(400).json({ error: "Неверные данные" });
    }

    const item = await Item.findOne({ name: product });
    if (!item) return res.status(404).json({ error: "Товар не найден" });

    const order = await Order.findOne({
      "items.item": item._id,
      "items.quantity": quantity,
      status: { $ne: "обработан" },
    });

    if (!order)
      return res
        .status(404)
        .json({ error: "Заказ не найден или уже обработан" });

    order.expectedArrival = new Date(expectedArrival);
    order.status = "обработан";
    await order.save();

    res.json({ message: "Заказ обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении заказа:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить все заказы с подгрузкой товаров и складов внутри items, и поставщика
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.item",
        populate: { path: "warehouse", model: "Warehouse" },
      })
      .populate("supplier");

    res.json(orders);
  } catch (err) {
    console.error("Ошибка при загрузке заказов:", err);
    res.status(500).json({ error: "Ошибка при загрузке заказов" });
  }
});

// Создать новый заказ
router.post("/", async (req, res) => {
  try {
    const { itemId, quantity, status } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({ error: "Необходимы itemId и quantity" });
    }

    const item = await Item.findById(itemId).populate("supplierId");
    if (!item) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    const newOrder = new Order({
      items: [{ item: item._id, quantity }],
      supplier: item.supplierId?._id,
      status: status || "ожидается",
      deliveryDate: item.supplierId?.deliveryDays
        ? new Date(
            Date.now() + item.supplierId.deliveryDays * 24 * 60 * 60 * 1000
          )
        : undefined,
    });

    await newOrder.save();

    if (item.supplierId?.apiUrl) {
      await sendOrderToApi(item, quantity);
    } else if (item.supplierId?.email) {
      await sendOrderEmail(item.supplierId.email, item.name, quantity);
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Ошибка при создании заказа:", err);
    res.status(500).json({ error: "Ошибка при создании заказа" });
  }
});

// Обновить статус заказа
router.patch("/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    await sendOrderStatusEmail(order);

    res.json(order);
  } catch (err) {
    console.error("Ошибка при обновлении статуса заказа:", err);
    res.status(500).json({ error: "Ошибка при обновлении статуса" });
  }
});

// Ручная отправка заказа поставщику
router.post("/:id/send", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "items.item",
        populate: { path: "supplierId" },
      })
      .populate("supplier");

    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    // Берём первый товар и его поставщика (для упрощения)
    const firstItem = order.items[0]?.item;
    const supplier = order.supplier || firstItem?.supplierId;

    if (!supplier) {
      return res.status(400).json({ error: "Поставщик не указан" });
    }

    if (supplier.apiUrl) {
      await sendOrderToApi(firstItem, order.items[0].quantity);
    } else if (supplier.email) {
      await sendOrderEmail(
        supplier.email,
        firstItem.name,
        order.items[0].quantity
      );
    } else {
      return res.status(400).json({ error: "Нет ни API, ни email поставщика" });
    }

    res.json({ message: "Заказ успешно отправлен поставщику" });
  } catch (err) {
    console.error("Ошибка при ручной отправке заказа:", err);
    res.status(500).json({ error: "Ошибка при отправке заказа поставщику" });
  }
});

// Автоматическое создание заказов по остаткам
router.post("/generate", async (req, res) => {
  try {
    const items = await Item.find().populate("supplierId");
    const ordersBySupplier = new Map();

    for (const item of items) {
      if (item.stock <= item.minStock && item.supplierId) {
        const qtyToOrder = item.minStock * 2 - item.stock;

        if (!ordersBySupplier.has(item.supplierId._id.toString())) {
          ordersBySupplier.set(item.supplierId._id.toString(), {
            supplier: item.supplierId,
            items: [],
          });
        }

        ordersBySupplier.get(item.supplierId._id.toString()).items.push({
          item,
          quantity: qtyToOrder,
        });
      }
    }

    const createdOrders = [];

    for (const { supplier, items } of ordersBySupplier.values()) {
      const orderDoc = new Order({
        supplier: supplier._id,
        items: items.map((el) => ({
          item: el.item._id,
          quantity: el.quantity,
        })),
        deliveryDate: new Date(
          Date.now() + supplier.deliveryDays * 24 * 60 * 60 * 1000
        ),
      });

      await orderDoc.save();
      createdOrders.push(orderDoc);

      const orderData = {
        supplier: supplier.name,
        items: items.map((el) => `${el.item.name} — ${el.quantity}`).join("\n"),
        deliveryDate: orderDoc.deliveryDate.toLocaleDateString(),
      };

      if (supplier.apiUrl) {
        try {
          await axios.post(supplier.apiUrl, orderData);
          orderDoc.status = "sent";
          await orderDoc.save();
        } catch (apiErr) {
          console.error("Ошибка при отправке заказа на API:", apiErr.message);
        }
      } else if (supplier.email) {
        try {
          await sendEmail({
            to: supplier.email,
            subject: `Новый заказ от системы`,
            text: `Поставщик: ${orderData.supplier}\nТовары:\n${orderData.items}\nОжидаемая дата доставки: ${orderData.deliveryDate}`,
          });
          orderDoc.status = "sent";
          await orderDoc.save();
        } catch (emailErr) {
          console.error("Ошибка при отправке email:", emailErr.message);
        }
      }
    }

    res
      .status(201)
      .json({ message: "Созданы и отправлены заказы", orders: createdOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при генерации заказов" });
  }
});

module.exports = router;
