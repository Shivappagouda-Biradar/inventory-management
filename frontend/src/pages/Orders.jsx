import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formError, setFormError] = useState('');

  const load = () => {
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => { setOrders(o.data); setCustomers(c.data); setProducts(p.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setFormError('');
    setShowModal(true);
  };

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, key, value) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: value } : it));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!customerId) { setFormError('Select a customer'); return; }
    if (items.some(it => !it.product_id || it.quantity < 1)) {
      setFormError('All items need a product and a quantity ≥ 1'); return;
    }
    setSaving(true);
    try {
      await createOrder({
        customer_id: Number(customerId),
        items: items.map(it => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) }))
      });
      toast.success('Order created');
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openModal}>+ New Order</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-text">No orders yet.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th className="hide-mobile">Items</th>
                  <th>Total</th>
                  <th className="hide-mobile">Status</th>
                  <th className="hide-mobile">Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer?.full_name || '—'}</td>
                    <td className="hide-mobile">{o.items?.length || 0} item(s)</td>
                    <td>${o.total_amount.toFixed(2)}</td>
                    <td className="hide-mobile"><span className="badge badge-success">{o.status}</span></td>
                    <td className="hide-mobile">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Order</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select className="form-control" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Items</label>
                  {items.map((item, i) => (
                    <div className="order-item-row" key={i}>
                      <select
                        className="form-control"
                        value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: 80 }}
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                      />
                      {items.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={addItem}>
                    + Add Item
                  </button>
                </div>

                {formError && <div className="form-error" style={{ marginBottom: 12 }}>⚠️ {formError}</div>}

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Placing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
