import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, deleteOrder } from '../api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;
  if (!order) return <div className="empty-state"><p>Order not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Order #{order.id}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>← Back</button>
          <button className="btn btn-danger" onClick={handleCancel}>Cancel Order</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">Order Info</div>
          <div className="card-body">
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p style={{ marginTop: 8 }}><strong>Status:</strong> <span className="badge badge-success">{order.status}</span></p>
            <p style={{ marginTop: 8 }}><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p style={{ marginTop: 8 }}><strong>Total:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e40af' }}>${order.total_amount.toFixed(2)}</span></p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Customer</div>
          <div className="card-body">
            {order.customer ? (
              <>
                <p><strong>Name:</strong> {order.customer.full_name}</p>
                <p style={{ marginTop: 8 }}><strong>Email:</strong> {order.customer.email}</p>
                <p style={{ marginTop: 8 }}><strong>Phone:</strong> {order.customer.phone}</p>
              </>
            ) : <p>Customer info unavailable</p>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">Order Items</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || `Product #${item.product_id}`}</td>
                  <td><code>{item.product?.sku || '—'}</code></td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td><strong>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                <td style={{ fontWeight: 700, color: '#1e40af' }}>${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
