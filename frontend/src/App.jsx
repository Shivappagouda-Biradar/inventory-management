import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import './App.css';

const NAV_LINKS = [
  { to: '/',          label: 'Dashboard', icon: '🏠', end: true },
  { to: '/products',  label: 'Products',  icon: '🛍️' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/orders',    label: 'Orders',    icon: '📋' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* ── Mobile Top Bar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span>📦</span> InventoryPro
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Open menu">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* ── Sidebar overlay (mobile) ── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <div className="layout">
        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <span className="brand-icon">📦</span>
            <span className="brand-name">InventoryPro</span>
          </div>
          <nav className="sidebar-nav">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeSidebar}
              >
                <span>{link.icon}</span> {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/products"   element={<Products />} />
            <Route path="/customers"  element={<Customers />} />
            <Route path="/orders"     element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
