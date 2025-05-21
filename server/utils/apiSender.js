const axios = require("axios");

async function sendOrderToApi(item, quantity) {
  if (!item.supplierId.apiUrl) return;

  try {
    const response = await axios.post(item.supplierId.apiUrl, {
      product: item.name,
      quantity: quantity,
    });

    console.log(`Заказ отправлен по API поставщика ${item.supplierId.apiUrl}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при отправке заказа через API:", error.message);
  }
}
module.exports = sendOrderToApi;
