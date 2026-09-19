import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

const emptyForm = {
  question: '',
  answer: '',
  sortOrder: 1,
};

export function AdminFaq() {
  const [faqs, setFaqs] = useState([]);
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
      const res = await api.getFaqs();
      setFaqs(res.data || []);
    } catch {
      setError('Failed to load FAQs');
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

  const handleEdit = (f) => {
    setForm({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder || 1,
    });
    setEditId(f.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      question: form.question,
      answer: form.answer,
      sortOrder: Number(form.sortOrder) || 1,
    };

    try {
      if (editId) {
        await api.updateFaq(editId, payload);
        showToast('FAQ updated');
      } else {
        await api.createFaq(payload);
        showToast('FAQ created');
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
      await api.deleteFaq(id);
      setDeleteId(null);
      showToast('FAQ deleted');
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
            <HelpCircle style={{ color: '#06b6d4', width: 28, height: 28 }} />
            Frequently Asked Questions (FAQ)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Answer prospective clients and employers on contract terms, timelines, tech stack, and IP ownership.
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
          <Plus style={{ width: 18, height: 18 }} /> Add Question
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
          Loading FAQs...
        </div>
      ) : faqs.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
          No FAQs created yet. Click "Add Question" to create one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqs.map((f) => (
            <div
              key={f.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 20, background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                    #{f.sortOrder}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{f.question}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{f.answer}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
                  <Pencil style={{ width: 17, height: 17 }} />
                </button>
                <button onClick={() => setDeleteId(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6 }}>
                  <Trash2 style={{ width: 17, height: 17 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {editId ? 'Edit FAQ' : 'Add New FAQ'}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Question *</label>
                <input required style={inputStyle} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="e.g. What is your typical turnaround time?" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Answer *</label>
                <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="Comprehensive and friendly answer..." />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Sort Order</label>
                <input type="number" style={inputStyle} value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--accent-primary, #8b5cf6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create FAQ'}
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
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Delete FAQ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure you want to delete this FAQ question?</p>
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

export default AdminFaq;
