import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    getProducts()
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid non-negative price required';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid non-negative quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-control ${errors[key] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
      {errors[key] && <div className="form-error">{errors[key]}</div>}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <p className="empty-text">No products yet. Add your first product.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
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
              <span>{editing ? 'Edit Product' : 'Add Product'}</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {field('name', 'Product Name', 'text', 'e.g. Wireless Mouse')}
                {field('sku', 'SKU / Code', 'text', 'e.g. WM-001')}
                <div className="form-row">
                  {field('price', 'Price ($)', 'number', '0.00')}
                  {field('quantity', 'Quantity', 'number', '0')}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
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
