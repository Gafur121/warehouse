import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const SalesChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/api/sales/stats')
      .then(response => setData(response.data))
      .catch(err => console.error('Ошибка загрузки данных продаж:', err));
  }, []);

  return (
    <div className="p-4 bg-gray-900 rounded-xl shadow-md">
      <h2 className="text-white text-lg mb-4">График продаж</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
