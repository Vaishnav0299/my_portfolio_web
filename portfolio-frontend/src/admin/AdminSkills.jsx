import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const emptyForm = { category: '', icon: 'Layout', items: '', sortOrder: 0 };

export function AdminSkills() {
  const [skills,   setSkills]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(emptyForm);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');

  const load = () => {
    setLoading(true);
    api.getSkills()
      .then(res => setSkills(res.data))
      .catch(() => setError('Failed to load skills'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEdit = (s) => {
    setForm({ ...s, items: s.items.map(i => `${i.name}:${i.val}`).join('\n') });
    setEditId(s.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder),
      items: form.items.split('\n').filter(Boolean).map(line => {
        const [name, val] = line.split(':');
        return { name: name?.trim() ?? '', val: val?.trim() ?? '' };
      }),
    };
    try {
      if (editId) {
        await writeWithSync({ method: 'PUT', url: `/api/skills/admin/${editId}`, body: payload });
        showToast('Skill updated');
      } else {
        await writeWithSync({ method: 'POST', url: '/api/skills/admin', body: payload });
        showToast('Skill category created');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await writeWithSync({ method: 'DELETE', url: `/api/skills/admin/${id}` });
      setDeleteId(null); showToast('Skill deleted'); load();
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
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Skills</h1>
        <button id="admin-new-skill-btn" className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Category
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
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Skill Category' : 'New Skill Category'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: 20, height: 20 }} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={labelStyle}>Category Name *</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Icon (Layout / Server / Database / Cpu)</label><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Skills (one per line, format: Name:95%)</label>
              <textarea value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'React.js / Next.js:95%\nTypeScript / JavaScript:92%'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {skills.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{s.category}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.items.length} skills</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button id={`edit-skill-${s.id}`} onClick={() => handleEdit(s)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Pencil style={{ width: 14, height: 14 }} /> Edit</button>
                {deleteId === s.id ? (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }}>Confirm</button>
                    <button onClick={() => setDeleteId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                ) : (
                  <button id={`delete-skill-${s.id}`} onClick={() => setDeleteId(s.id)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
