import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [predictedShortages, setPredictedShortages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/items")
      .then((res) => {
        const items = res.data;
        setTotalItems(items.length);
        setLowStockItems(items.filter((item) => item.stock < item.minStock));

        // Прогноз дефицита на основе продаж за последние 7 дней
        const shortage = items.filter((item) => {
          const weekSales = item.salesHistory?.filter((sale) => {
            const date = new Date(sale.date);
            return Date.now() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
          });

          const totalSold = weekSales.reduce((sum, s) => sum + s.quantity, 0);
          const avgPerDay = totalSold / 7;
          return avgPerDay > 0 && item.stock / avgPerDay <= 3; // Закончится за 3 дня
        });

        setPredictedShortages(shortage);
      })
      .catch((err) => console.error("Ошибка загрузки товаров:", err));

    axios
      .get("http://localhost:5000/api/orders")
      .then((res) => {
        const today = new Date().toISOString().split("T")[0];
        const orders = res.data.filter((order) => {
          const date = new Date(order.arrivalDate);
          return !isNaN(date) && date.toISOString().split("T")[0] === today;
        });
        setIncomingOrders(orders);
      })
      .catch((err) => console.error("Ошибка загрузки заказов:", err));
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Обзор склада</h2>

      <div className="kpi-boxes">
        <div className="kpi-card">Всего товаров: {totalItems}</div>
        <div className="kpi-card warning">
          Ниже минимума: {lowStockItems.length}
        </div>
        <div className="kpi-card alert">
          Прогноз дефицита: {predictedShortages.length}
        </div>
        <div className="kpi-card">
          Ожидаемые заказы: {incomingOrders.length}
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="section">
          <h3>Товары ниже минимума</h3>
          <ul>
            {lowStockItems.map((item) => (
              <li key={item._id}>
                {item.name} — Остаток: {item.stock} / Мин: {item.minStock}
              </li>
            ))}
          </ul>
        </div>
      )}

      {predictedShortages.length > 0 && (
        <div className="section">
          <h3>Прогнозируемый дефицит (менее 3 дней)</h3>
          <ul>
            {predictedShortages.map((item) => (
              <li key={item._id}>
                {item.name} — Остаток: {item.stock}
              </li>
            ))}
          </ul>
        </div>
      )}

      {incomingOrders.length > 0 && (
        <div className="section">
          <h3>Ожидаемые заказы на сегодня</h3>
          <ul>
            {incomingOrders.map((order) => (
              <li key={order._id}>
                {order.name} — {order.quantity} шт
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
