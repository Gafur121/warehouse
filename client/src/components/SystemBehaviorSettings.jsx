import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Settings.css';

const SystemBehaviorSettings = () => {
  const [mode, setMode] = useState('auto');
  const [analysisDepth, setAnalysisDepth] = useState(14);
  const [minStockAlgorithm, setMinStockAlgorithm] = useState('average');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Загрузка настроек с сервера
    axios.get('/api/settings/system-behavior')
      .then(res => {
        const settings = res.data;
        setMode(settings.mode || 'auto');
        setAnalysisDepth(settings.analysisDepth || 14);
        setMinStockAlgorithm(settings.minStockAlgorithm || 'average');
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки настроек:', err);
        setError('Не удалось загрузить настройки');
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    axios.put('/api/settings/system-behavior', {
      mode,
      analysisDepth,
      minStockAlgorithm
    })
    .then(() => alert('Настройки сохранены!'))
    .catch(err => {
      console.error('Ошибка сохранения настроек:', err);
      alert('Ошибка при сохранении настроек');
    });
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div className="settings-section">
      <h2>Поведение системы</h2>

      <label>Режим работы:</label>
      <select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="auto">Автоматическое пополнение</option>
        <option value="notify">Только уведомления</option>
        <option value="manual">Ручной режим</option>
      </select>

      <label>Глубина анализа спроса (в днях):</label>
      <select value={analysisDepth} onChange={e => setAnalysisDepth(Number(e.target.value))}>
        <option value={7}>7</option>
        <option value={14}>14</option>
        <option value={30}>30</option>
        <option value={60}>60</option>
      </select>

      <label>Алгоритм расчета минимального остатка:</label>
      <select value={minStockAlgorithm} onChange={e => setMinStockAlgorithm(e.target.value)}>
        <option value="average">Скользящее среднее</option>
        <option value="exponential">Эксп. сглаживание</option>
        <option value="fixed">Фиксированный порог</option>
      </select>

      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
};

export default SystemBehaviorSettings;
