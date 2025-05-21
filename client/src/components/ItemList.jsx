import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ItemList.css';

function ItemList() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouse] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/warehouses')
      .then(res => setWarehouses(res.data))
      .catch(err => console.error('Ошибка загрузки складов:', err));
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      axios.get(`http://localhost:5000/api/items/warehouse/${selectedWarehouseId}`)
        .then(res => setItems(res.data))
        .catch(err => console.error('Ошибка загрузки товаров:', err));
    } else {
      setItems([]);
    }
  }, [selectedWarehouseId]);

  return (
    <div className="item-list-container">
      <h2>Складские товары</h2>

      <select
        value={selectedWarehouseId}
        onChange={e => setSelectedWarehouse(e.target.value)}
        className="warehouse-select"
      >
        <option value="">Выберите склад</option>
        {warehouses.map(wh => (
          <option key={wh._id} value={wh._id}>{wh.name}</option>
        ))}
      </select>

      {items.length === 0 && selectedWarehouseId && (
        <p className="no-items-msg">Товары отсутствуют</p>
      )}

      <div className="items-grid">
       {items.map(item => (
  <div key={item._id} className="item-card">
    <h3 className="item-name">{item.name}</h3>
    <p>Категория: {item.categoryId?.name || 'Не указана'}</p>
    <p>Остаток: <span className="stock">{item.stock}</span></p>
    <p>Минимальный остаток: <span className="min-stock">{item.minStock}</span></p>
  </div>
))}
      </div>
    </div>
  );
}

export default ItemList;
