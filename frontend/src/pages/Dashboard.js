import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading dashboard...</p></div>;
  if (!stats) return <div className="empty-state"><p>Failed to load stats.</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: stats.low_stock_products.length > 0 ? '#ef4444' : '#16a34a' }}>
            {stats.low_stock_products.length}
          </div>
        </div>
      </div>

      {stats.low_stock_products.length > 0 && (
        <div className="card">
          <div className="card-header">⚠️ Low Stock Products (≤ 10 units)</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Qty in Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="card">
          <div className="card-body empty-state">
            <div className="empty-icon">✅</div>
            <p className="empty-text">All products have healthy stock levels.</p>
          </div>
        </div>
      )}
    </div>
  );
}
