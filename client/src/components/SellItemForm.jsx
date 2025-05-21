import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function SellItemForm() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/items')
      .then(res => setItems(res.data))
      .catch(err => console.error('Ошибка при загрузке товаров:', err));
  }, []);

  useEffect(() => {
    if (!selectedItemId) {
      setSalesData([]);
      return;
    }

    axios.get(`http://localhost:5000/api/items/${selectedItemId}/sales`)
      .then(res => setSalesData(res.data))
      .catch(err => {
        console.error('Ошибка загрузки истории продаж:', err);
        setSalesData([]);
      });
  }, [selectedItemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !quantity) return;

    const item = items.find(i => i._id === selectedItemId);
    const qty = parseInt(quantity);

    if (item && qty > item.stock) {
      alert('❌ Нельзя продать больше, чем есть на складе');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/sell', {
        itemId: selectedItemId,
        quantity: qty
      });

      alert(`✅ Продано: ${qty} шт. товара "${res.data.item.name}"`);
      setQuantity('');
      setSelectedItemId('');

      const today = new Date().toISOString().slice(0, 10);
      const lastEntry = salesData[salesData.length - 1];

      setSalesData(prev => {
        if (lastEntry && lastEntry.date === today) {
          return prev.map(entry =>
            entry.date === today
              ? { ...entry, quantity: entry.quantity + qty }
              : entry
          );
        } else {
          return [...prev, { date: today, quantity: qty }];
        }
      });

      // Обновим список товаров с новым остатком
      axios.get('http://localhost:5000/api/items')
        .then(res => setItems(res.data));

    } catch (err) {
      console.error('Ошибка при продаже:', err);
      alert(err.response?.data?.error || 'Произошла ошибка');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Продажа товара</h2>

        <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} required>
          <option value="">Выберите товар</option>
          {items.map(item => (
            <option key={item._id} value={item._id}>
              {item.name} (Остаток: {item.stock})
            </option>
          ))}
        </select>

        {/* Отображение остатка выбранного товара */}
        {selectedItemId && (
          <p>
            Остаток на складе:{" "}
            <strong>
              {items.find(item => item._id === selectedItemId)?.stock ?? 'Неизвестно'}
            </strong>
          </p>
        )}

        <input
          type="number"
          placeholder="Количество"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          required
          min={1}
        />

        <button type="submit">Продать</button>
      </form>

      {salesData.length > 0 && (
        <div style={{ marginTop: 30, width: '100%', height: 300 }}>
          <h3>Статистика продаж</h3>
          <ResponsiveContainer>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default SellItemForm;
