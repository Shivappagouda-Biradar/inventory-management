import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../api';

const PIE_COLORS = ['#16a34a', '#f59e0b', '#ef4444'];

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name === 'Revenue' ? `$${p.value.toFixed(2)}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="empty-state">
      <div className="empty-icon">⏳</div>
      <p className="empty-text">Loading dashboard...</p>
    </div>
  );

  if (!stats) return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <p className="empty-text">Failed to load stats.</p>
    </div>
  );

  const hasOrders = stats.order_trends && stats.order_trends.length > 0;
  const hasTopProducts = stats.top_products && stats.top_products.length > 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Live overview of your business</span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="stats-grid">
        <StatCard icon="🛍️" label="Total Products"  value={stats.total_products}  color="#1e40af" />
        <StatCard icon="👥" label="Total Customers" value={stats.total_customers} color="#7c3aed" />
        <StatCard icon="📋" label="Total Orders"    value={stats.total_orders}    color="#0891b2" />
        <StatCard icon="💰" label="Total Revenue"   value={`$${(stats.total_revenue || 0).toFixed(2)}`} color="#16a34a" />
        <StatCard
          icon="⚠️"
          label="Low / Out of Stock"
          value={stats.low_stock_products.length}
          color={stats.low_stock_products.length > 0 ? '#ef4444' : '#16a34a'}
        />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="chart-row-2">

        {/* Order & Revenue Trend */}
        <div className="card">
          <div className="card-header">📈 Order & Revenue Trend</div>
          <div className="card-body">
            {hasOrders ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.order_trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#1e40af" fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area yAxisId="left"  type="monotone" dataKey="orders"  name="Orders"  stroke="#7c3aed" fill="url(#colorOrders)"  strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">📋</div>
                <p className="empty-text">No orders yet — chart will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Status Pie */}
        <div className="card">
          <div className="card-header">🥧 Inventory Status</div>
          <div className="card-body">
            {stats.total_products > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.inventory_summary}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${value}` : ''}
                    labelLine={false}
                  >
                    {stats.inventory_summary.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🛍️</div>
                <p className="empty-text">Add products to see chart.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="chart-row-equal">

        {/* Top Products Bar Chart */}
        <div className="card">
          <div className="card-header">🏆 Top Products by Units Sold</div>
          <div className="card-body">
            {hasTopProducts ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.top_products} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total_sold" name="Units Sold" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🏆</div>
                <p className="empty-text">Place orders to see top products.</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert Table */}
        <div className="card">
          <div className="card-header">⚠️ Low Stock Alert (≤ 10 units)</div>
          {stats.low_stock_products.length === 0 ? (
            <div className="card-body empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">✅</div>
              <p className="empty-text">All products have healthy stock.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th></tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {p.quantity === 0 ? 'Out of Stock' : p.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
