import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Check, RefreshCw, Calendar, User, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages();
      setMessages(res.data || []);
    } catch {
      setError('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteMessage(id);
      setDeleteId(null);
      showToast('Message deleted');
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail style={{ color: 'var(--accent-primary)', width: 28, height: 28 }} />
            Inquiries & Contact Inbox
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Messages received directly from the portfolio contact form.
          </p>
        </div>

        <button
          onClick={load}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '0.65rem 1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <RefreshCw style={{ width: 16, height: 16 }} /> Refresh
        </button>
      </div>

      {toast && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
          <Mail style={{ width: 40, height: 40, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Inbox is Empty</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>New inquiries submitted via the contact form will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <User style={{ width: 16, height: 16, color: 'var(--accent-primary)' }} />
                    {m.name}
                  </div>
                  <a href={`mailto:${m.email}`} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    {m.email}
                  </a>
                  {m.role && (
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {m.role}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    <Calendar style={{ width: 14, height: 14 }} />
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '1rem 1.25rem', borderRadius: 8, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {m.message}
                </div>
              </div>

              <button
                onClick={() => setDeleteId(m.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}
                title="Delete Message"
              >
                <Trash2 style={{ width: 18, height: 18 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.75rem', maxWidth: 420, width: '100%' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Delete Message</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure you want to delete this inquiry?</p>
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

export default AdminMessages;
