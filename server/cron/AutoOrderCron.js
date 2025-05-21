const cron = require("node-cron");
const Item = require("../models/Item");
const Order = require("../models/Order");
const { sendOrderEmail } = require("../utils/email");
const sendOrderToApi = require("../utils/apiSender");

cron.schedule("*/1 * * * *", async () => {
  try {
    // Загружаем все товары вместе с данными поставщика
    const items = await Item.find().populate("supplierId");

    for (const item of items) {
      if (item.stock < item.minStock) {
        const neededQuantity = item.minStock - item.stock;

        // Ищем уже существующие заказы на этот товар с подходящим статусом
        const existingOrder = await Order.findOne({
          "items.item": item._id,
          status: { $in: ["pending", "sent", "delivered"] },
        });

        if (!existingOrder) {
          if (!item.supplierId) {
            console.warn(`У товара "${item.name}" не указан поставщик`);
            continue;
          }

          // Создаём новый заказ
          const newOrder = new Order({
            supplier: item.supplierId._id,
            items: [
              {
                item: item._id,
                quantity: neededQuantity,
              },
            ],
            status: "pending",
            deliveryDate: new Date(
              Date.now() + (item.leadTime || 0) * 24 * 60 * 60 * 1000
            ), // leadTime в днях
          });

          await newOrder.save();
          console.log(
            `Создан заказ на товар "${item.name}", количество: ${neededQuantity}`
          );

          // Отправляем заказ поставщику через API или email
          try {
            if (item.supplierId.apiUrl || item.supplierId.email) {
              const response = await sendOrderToApi(item, neededQuantity);

              if (response) {
                await Order.findByIdAndUpdate(newOrder._id, { status: "sent" });
                console.log(
                  `Статус заказа обновлён на "sent" для товара "${item.name}"`
                );
              }

              await sendOrderEmail(
                item.supplierId.email,
                item.name,
                neededQuantity
              );
            } else if (item.supplierId.email) {
              await sendOrderEmail(
                item.supplierId.email,
                item.name,
                neededQuantity
              );
            } else {
              console.warn(`Нет контактов поставщика у товара "${item.name}"`);
            }
          } catch (err) {
            console.error(
              `Ошибка при отправке заказа на "${item.name}":`,
              err.message
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Ошибка в автоматическом создании заказов:", error);
  }
});
