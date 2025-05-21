import React from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

import AddWarehouseForm from "./components/AddWarehouseForm";
import AddItemForm from "./components/AddItemForm";
import ItemList from "./components/ItemList";
import SellItemForm from "./components/SellItemForm";

function InventoryPage() {
  return (
    <div className="container">
      <h2>Складские товары</h2>
      <AddWarehouseForm />
      <AddItemForm />
      <ItemList />
    </div>
  );
}

function SellPage() {
  return (
    <div className="container">
      <SellItemForm />
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sell" element={<SellPage />} />
      </Routes>
    </Router>
  );
};

export default App;
