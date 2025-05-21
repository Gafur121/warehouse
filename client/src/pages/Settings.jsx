import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    apiUrl: '',
    deliveryDays: 3,
  });
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // --- КАТЕГОРИИ ---

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:5000/api/categories');
    setCategories(res.data);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await axios.put(`http://localhost:5000/api/categories/${editingCategoryId}`, categoryForm);
      } else {
        await axios.post('http://localhost:5000/api/categories', categoryForm);
      }
      setCategoryForm({ name: '' });
      setEditingCategoryId(null);
      fetchCategories();
    } catch (err) {
      console.error('Ошибка сохранения категории', err);
    }
  };

  const handleCategoryEdit = (cat) => {
    setCategoryForm({ name: cat.name });
    setEditingCategoryId(cat._id);
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Удалить категорию?')) return;
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
    if (editingCategoryId === id) {
      setCategoryForm({ name: '' });
      setEditingCategoryId(null);
    }
    fetchCategories();
  };

  // --- ПОСТАВЩИКИ ---

  const fetchSuppliers = async () => {
    const res = await axios.get('http://localhost:5000/api/suppliers');
    setSuppliers(res.data);
  };

  const handleSupplierChange = (e) => {
    setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value });
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplierId) {
        await axios.put(`http://localhost:5000/api/suppliers/${editingSupplierId}`, supplierForm);
      } else {
        await axios.post('http://localhost:5000/api/suppliers', supplierForm);
      }
      setSupplierForm({ name: '', email: '', apiUrl: '', deliveryDays: 3 });
      setEditingSupplierId(null);
      fetchSuppliers();
    } catch (err) {
      console.error('Ошибка сохранения поставщика', err);
    }
  };

  const handleSupplierEdit = (supplier) => {
    setSupplierForm({
      name: supplier.name,
      email: supplier.email || '',
      apiUrl: supplier.apiUrl || '',
      deliveryDays: supplier.deliveryDays || 3,
    });
    setEditingSupplierId(supplier._id);
  };

  const handleSupplierDelete = async (id) => {
    if (!window.confirm('Удалить поставщика?')) return;
    await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
    if (editingSupplierId === id) {
      setSupplierForm({ name: '', email: '', apiUrl: '', deliveryDays: 3 });
      setEditingSupplierId(null);
    }
    fetchSuppliers();
  };

  return (
    <div className="container">
      <h2>Управление категориями товаров</h2>
      <form onSubmit={handleCategorySubmit}>
        <input
          type="text"
          placeholder="Название категории"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({ name: e.target.value })}
          required
        />
        <button type="submit">{editingCategoryId ? 'Сохранить' : 'Добавить'}</button>
      </form>

      <ul className="items-grid">
        {categories.map(cat => (
          <li key={cat._id}>
            <b>{cat.name}</b>
            <div>
              <button onClick={() => handleCategoryEdit(cat)}>Редактировать</button>
              <button onClick={() => handleCategoryDelete(cat._id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>Управление поставщиками</h2>
      <form onSubmit={handleSupplierSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Название поставщика"
          value={supplierForm.name}
          onChange={handleSupplierChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={supplierForm.email}
          onChange={handleSupplierChange}
        />
        <input
          type="text"
          name="apiUrl"
          placeholder="API URL"
          value={supplierForm.apiUrl}
          onChange={handleSupplierChange}
        />
        <input
          type="number"
          name="deliveryDays"
          placeholder="Дней на доставку"
          value={supplierForm.deliveryDays}
          onChange={handleSupplierChange}
          min="1"
        />
        <button type="submit">{editingSupplierId ? 'Сохранить' : 'Добавить'}</button>
      </form>

      <ul className="items-grid">
        {suppliers.map(sup => (
          <li key={sup._id}>
            <b>{sup.name}</b> <br />
            Email: {sup.email} <br />
            API: {sup.apiUrl} <br />
            Доставка: {sup.deliveryDays} дней
            <div>
              <button onClick={() => handleSupplierEdit(sup)}>Редактировать</button>
              <button onClick={() => handleSupplierDelete(sup._id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Settings;
