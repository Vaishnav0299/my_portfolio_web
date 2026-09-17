import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const emptyForm = { time: '', title: '', inst: '', desc: '', sortOrder: 0 };

export function AdminTimeline() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');

  const load = () => {
    setLoading(true);
    api.getTimeline()
      .then(res => setEntries(res.data))
      .catch(() => setError('Failed to load timeline'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEdit = (e) => { setForm(e); setEditId(e.id); setShowForm(true); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    try {
      if (editId) {
        await writeWithSync({ method: 'PUT', url: `/api/timeline/admin/${editId}`, body: payload });
        showToast('Entry updated');
      } else {
        await writeWithSync({ method: 'POST', url: '/api/timeline/admin', body: payload });
        showToast('Entry created');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await writeWithSync({ method: 'DELETE', url: `/api/timeline/admin/${id}` });
      setDeleteId(null); showToast('Entry deleted'); load();
    } catch (err) { setError(err.message); }
  };

  const inputStyle = { width: '100%', padding: '0.7rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Timeline</h1>
        <button id="admin-new-timeline-btn" className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Entry
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Entry' : 'New Entry'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: 20, height: 20 }} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={labelStyle}>Year / Period *</label><input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} placeholder="2026" /></div>
            <div><label style={labelStyle}>Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Institution *</label><input value={form.inst} onChange={e => setForm(f => ({ ...f, inst: e.target.value }))} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description *</label><textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{e.time}</span>
                  <span style={{ fontWeight: 700 }}>{e.title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.inst}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button id={`edit-timeline-${e.id}`} onClick={() => handleEdit(e)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Pencil style={{ width: 14, height: 14 }} /> Edit</button>
                {deleteId === e.id ? (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => handleDelete(e.id)} className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }}>Confirm</button>
                    <button onClick={() => setDeleteId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                ) : (
                  <button id={`delete-timeline-${e.id}`} onClick={() => setDeleteId(e.id)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
