import React, { useState } from 'react';
import axios from 'axios';

function AddWarehouseForm() {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/warehouses', { name })
      .then(() => {
        alert('Склад создан');
        setName('');
      })
      .catch(err => {
        console.error('Ошибка при добавлении склада:', err);
        alert('Ошибка при создании склада');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Добавить склад</h2>
      <input
        type="text"
        placeholder="Название склада"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <button type="submit">Создать</button>
    </form>
  );
}

export default AddWarehouseForm;
