import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddItemForm() {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState(''); // выбранный поставщик

  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // список поставщиков

  useEffect(() => {
    axios.get('http://localhost:5000/api/warehouses')
      .then(res => setWarehouses(res.data))
      .catch(err => console.error('Ошибка при загрузке складов:', err));

    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка при загрузке категорий:', err));

    axios.get('http://localhost:5000/api/suppliers') // загрузка поставщиков
      .then(res => setSuppliers(res.data))
      .catch(err => console.error('Ошибка при загрузке поставщиков:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/api/items', {
      name,
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      warehouse: warehouseId,
      categoryId: categoryId,
      supplierId: supplierId, // передаём id поставщика
    })
    .then(() => {
      alert('Товар добавлен');
      setName('');
      setStock('');
      setMinStock('');
      setWarehouseId('');
      setCategoryId('');
      setSupplierId('');
    })
    .catch(err => {
      console.error('Ошибка при добавлении товара:', err);
      alert('Ошибка при добавлении товара');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Добавить товар</h2>

      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Остаток"
        value={stock}
        onChange={e => setStock(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Минимальный остаток"
        value={minStock}
        onChange={e => setMinStock(e.target.value)}
        required
      />

      <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
        <option value="">Выберите склад</option>
        {warehouses.map(wh => (
          <option key={wh._id} value={wh._id}>{wh.name}</option>
        ))}
      </select>

      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
        <option value="">Выберите категорию</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
        <option value="">Выберите поставщика</option>
        {suppliers.map(sup => (
          <option key={sup._id} value={sup._id}>{sup.name}</option>
        ))}
      </select>

      <button type="submit">Добавить</button>
    </form>
  );
}

export default AddItemForm;
