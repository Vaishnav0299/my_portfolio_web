import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const emptyForm = {
  name: '', category: 'fullstack', categoryName: '', type: '', badgeClass: 'fullstack',
  desc: '', longDesc: '', features: '', architecture: '',
  stack: '', github: '', live: '', stars: 0, status: 'Completed', sortOrder: 0,
};

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
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
    api.getProjects()
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEdit = (p) => {
    setForm({ ...p, features: p.features.join('\n'), stack: p.stack.join(', ') });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      features:  form.features.split('\n').filter(Boolean),
      stack:     form.stack.split(',').map(s => s.trim()).filter(Boolean),
      stars:     Number(form.stars),
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editId) {
        await writeWithSync({ method: 'PUT', url: `/api/projects/admin/${editId}`, body: payload });
        showToast('Project updated successfully');
      } else {
        await writeWithSync({ method: 'POST', url: '/api/projects/admin', body: payload });
        showToast('Project created successfully');
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
      await writeWithSync({ method: 'DELETE', url: `/api/projects/admin/${id}` });
      setDeleteId(null);
      showToast('Project deleted');
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.875rem', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: 12,
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
          color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          id="admin-new-project-btn"
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus style={{ width: 16, height: 16 }} /> New Project
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} /> {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>{editId ? 'Edit Project' : 'New Project'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Name *', key: 'name', full: true },
              { label: 'Description *', key: 'desc', full: true },
              { label: 'Long Description *', key: 'longDesc', full: true, textarea: true },
              { label: 'Category', key: 'category' },
              { label: 'Category Name', key: 'categoryName' },
              { label: 'Type', key: 'type' },
              { label: 'Badge Class', key: 'badgeClass' },
              { label: 'Status', key: 'status' },
              { label: 'Stars', key: 'stars', type: 'number' },
              { label: 'Sort Order', key: 'sortOrder', type: 'number' },
              { label: 'GitHub URL *', key: 'github', full: true },
              { label: 'Live URL', key: 'live', full: true },
              { label: 'Stack (comma-separated) *', key: 'stack', full: true },
              { label: 'Features (one per line) *', key: 'features', full: true, textarea: true },
              { label: 'Architecture *', key: 'architecture', full: true, textarea: true },
            ].map(({ label, key, full, textarea, type }) => (
              <div key={key} style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
                <label style={labelStyle}>{label}</label>
                {textarea ? (
                  <textarea
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                ) : (
                  <input
                    type={type ?? 'text'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {projects.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderRadius: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              gap: '1rem',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category} · {p.status}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  id={`edit-project-${p.id}`}
                  onClick={() => handleEdit(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Pencil style={{ width: 14, height: 14 }} /> Edit
                </button>
                {deleteId === p.id ? (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }}>Confirm</button>
                    <button onClick={() => setDeleteId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                ) : (
                  <button
                    id={`delete-project-${p.id}`}
                    onClick={() => setDeleteId(p.id)}
                    className="btn btn-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
