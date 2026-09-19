import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

const emptyForm = {
  quote: '',
  author: '',
  name: '',
  role: '',
  title: '',
  company: '',
  avatar: '',
  avatarInitials: '',
  rating: 5,
  sortOrder: 1,
};

export function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getTestimonials();
      setItems(res.data || []);
    } catch {
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleDbSynced = () => load();
    window.addEventListener('db-synced', handleDbSynced);
    return () => window.removeEventListener('db-synced', handleDbSynced);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleEdit = (t) => {
    const authorVal = t.author || t.name || '';
    const roleVal = t.role || t.title || '';
    const avatarVal = t.avatar || (t.avatarInitials && !t.avatarInitials.startsWith('http') ? '' : t.avatarInitials) || '';
    setForm({
      ...t,
      quote: t.quote || '',
      author: authorVal,
      name: authorVal,
      role: roleVal,
      title: roleVal,
      avatar: avatarVal,
      avatarInitials: t.avatarInitials || '',
      company: t.company || '',
      rating: t.rating ?? 5,
      sortOrder: t.sortOrder ?? 1,
    });
    setEditId(t.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const nameVal = form.author || form.name || '';
    const titleVal = form.role || form.title || '';
    const initials = nameVal
      ? nameVal.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'AN';

    const payload = {
      quote: form.quote,
      author: nameVal,
      name: nameVal,
      role: titleVal,
      title: titleVal,
      company: form.company || '',
      avatar: form.avatar || '',
      avatarInitials: initials,
      rating: Number(form.rating) || 5,
      sortOrder: Number(form.sortOrder) || 1,
    };

    try {
      if (editId) {
        await api.updateTestimonial(editId, payload);
        showToast('Testimonial updated');
      } else {
        await api.createTestimonial(payload);
        showToast('Testimonial created');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTestimonial(id);
      setDeleteId(null);
      showToast('Testimonial deleted');
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.875rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare style={{ color: '#f59e0b', width: 28, height: 28 }} />
            Testimonials & Endorsements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage client reviews, ratings, and recommendations.
          </p>
        </div>

        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); setError(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--accent-primary, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Plus style={{ width: 18, height: 18 }} /> Add Testimonial
        </button>
      </div>

      {toast && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      {error && !showForm && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
          Loading testimonials...
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
          No testimonials yet. Click "Add Testimonial" to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {items.map((t) => (
            <div
              key={t.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.15rem', color: '#f59e0b' }}>
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} style={{ width: 14, height: 14, fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                      <Pencil style={{ width: 16, height: 16 }} />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>

                <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {t.avatar && (t.avatar.startsWith('http') || t.avatar.startsWith('/')) ? (
                  <img
                    src={t.avatar}
                    alt={t.author || t.name}
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                    {t.avatarInitials || (t.author || t.name || 'A').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.author || t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t.role || t.title} {t.company ? `· ${t.company}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {editId ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Client / Colleague Quote *</label>
                <textarea required rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} placeholder="Vaishnav engineered our high-concurrency ingestion pipeline..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Author Name *</label>
                  <input
                    required
                    style={inputStyle}
                    value={form.author || form.name || ''}
                    onChange={e => setForm({ ...form, author: e.target.value, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Role / Position</label>
                  <input
                    style={inputStyle}
                    value={form.role || form.title || ''}
                    onChange={e => setForm({ ...form, role: e.target.value, title: e.target.value })}
                    placeholder="e.g. CTO & Co-founder"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Company / Organization</label>
                  <input style={inputStyle} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Tech" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Rating (Stars)</label>
                  <select style={inputStyle} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Avatar Image URL (optional)</label>
                <input style={inputStyle} value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--accent-primary, #8b5cf6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.75rem', maxWidth: 420, width: '100%' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Delete Testimonial</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTestimonials;
