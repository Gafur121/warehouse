import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="logo">📦 Склад</div>
      <nav className="nav-links">
        <Link to="/">Главная</Link>
        <Link to="/inventory">Товары</Link>
        <Link to="/orders">Заказы</Link>
        <Link to="/settings">Настройки</Link>
        <Link to="/sell">Продажа</Link> {/* 👈 Добавленная ссылка */}
      </nav>
    </header>
  );
}

export default Header;
