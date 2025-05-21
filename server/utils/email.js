const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Отправка письма при создании/отправке заказа
const sendOrderEmail = async (email, productName, quantity) => {
  const mailOptions = {
    from: `"Склад" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Новый заказ: ${productName}`,
    text: `Заказан товар: ${productName}\nКоличество: ${quantity}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email отправлен:', email);
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
  }
};

// Отправка письма при изменении статуса заказа
const sendOrderStatusEmail = async (order) => {
  if (!order || !order.itemId) return;

  const mailOptions = {
    from: `"Склад" <${process.env.EMAIL_USER}>`,
    to: order.itemId.supplierEmail || 'manager@example.com',
    subject: `Статус заказа: ${order.itemId.name}`,
    text: `Статус заказа изменен на "${order.status}"\n\n` +
          `Товар: ${order.itemId.name}\n` +
          `Количество: ${order.quantity}\n` +
          `Ожидаемая дата прибытия: ${order.expectedArrival?.toLocaleDateString() || 'не указана'}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email отправлен:', mailOptions.to);
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
  }
};

module.exports = { sendOrderEmail, sendOrderStatusEmail };
