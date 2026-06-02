import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import './App.css';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">📦</span>
            <span className="brand-name">InventoryPro</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>🏠</span> Dashboard
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>🛍️</span> Products
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>👥</span> Customers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>📋</span> Orders
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
