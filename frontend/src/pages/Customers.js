import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    getCustomers()
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createCustomer(form);
      toast.success('Customer added');
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
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
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowModal(true); }}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p className="empty-text">No customers yet. Add your first customer.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.full_name)}>
                        Delete
                      </button>
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
              <span>Add Customer</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {field('full_name', 'Full Name', 'text', 'John Doe')}
                {field('email', 'Email Address', 'email', 'john@example.com')}
                {field('phone', 'Phone Number', 'tel', '+1 555 0100')}
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Create'}
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
