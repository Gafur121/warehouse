import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setError("Ошибка загрузки заказов. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}/status`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
      alert("Не удалось обновить статус заказа");
    }
  };

  const sendOrder = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/orders/${id}/send`);
      await updateStatus(id, "sent");
      alert("Заказ отправлен поставщику");
    } catch (err) {
      console.error("Ошибка при отправке заказа поставщику:", err);
      alert("Не удалось отправить заказ поставщику");
    }
  };

  if (loading) return <p>Загрузка заказов...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!orders.length) return <p>Заказы не найдены.</p>;

  return (
    <div className="orders-container">
      <h2 className="orders-title">Список заказов</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Товары</th>
            <th>Количество</th>
            <th>Склад</th>
            <th>Поставщик</th>
            <th>Статус</th>
            <th>Ожидаемая дата</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) =>
            order.items.map((orderItem) => {
              const item = orderItem.item || {};
              const warehouseName = item.warehouse?.name || "—";

              // Получаем имя поставщика из order.supplierId.name, если supplierId есть
              const supplierName =
                order.supplier?.name || "Поставщик не указан";

              return (
                <tr key={`${order._id}-${item._id}`}>
                  <td>{item.name || "—"}</td>
                  <td>{orderItem.quantity}</td>
                  <td>{warehouseName}</td>
                  <td
                    style={{
                      color:
                        supplierName === "Поставщик не указан"
                          ? "red"
                          : "inherit",
                    }}
                  >
                    {supplierName}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {order.status}
                  </td>
                  <td>
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    {order.status === "pending" && (
                      <button
                        onClick={() => {
                          sendOrder(order._id);
                        }}
                      >
                        Отправить
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
