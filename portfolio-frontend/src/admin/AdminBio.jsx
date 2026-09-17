import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export function AdminBio() {
  const [form, setForm] = useState({
    name: '', title: '', education: '', location: '', email: '',
    github: '', linkedin: '', resumeUrl: '', avatarUrl: '',
    bio: '', interests: '', currentFocus: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    api.getBio()
      .then(res => setForm({
        ...res.data,
        interests: res.data.interests?.join('\n') ?? '',
      }))
      .catch(() => setError('Failed to load bio'))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      interests: form.interests.split('\n').filter(Boolean),
    };

    try {
      await api.updateBio(payload);
      showToast('Bio updated successfully');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.7rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };

  const Field = ({ label, fieldKey, type = 'text', full = false, textarea = false, rows = 3, placeholder = '' }) => (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          value={form[fieldKey] ?? ''}
          onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
          rows={rows}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          value={form[fieldKey] ?? ''}
          onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading bio…</p>;

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Bio</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          Your personal information shown on the public portfolio.
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem' }}>
        <Field label="Full Name *"    fieldKey="name" />
        <Field label="Title *"        fieldKey="title" />
        <Field label="Education *"    fieldKey="education" />
        <Field label="Location *"     fieldKey="location" />
        <Field label="Email *"        fieldKey="email" type="email" />
        <Field label="GitHub URL *"   fieldKey="github" />
        <Field label="LinkedIn URL *" fieldKey="linkedin" />
        <Field label="Resume URL"     fieldKey="resumeUrl" />
        <Field label="Avatar URL"     fieldKey="avatarUrl" full />
        <Field label="Bio Text *"     fieldKey="bio" full textarea rows={4} />
        <Field label="Current Focus"  fieldKey="currentFocus" full textarea rows={3} />
        <Field
          label="Interests (one per line)"
          fieldKey="interests" full textarea rows={4}
          placeholder={"Full-Stack Web Development\nArtificial Intelligence"}
        />

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="admin-save-bio-btn"
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save style={{ width: 16, height: 16 }} />
            {saving ? 'Saving…' : 'Save Bio'}
          </button>
        </div>
      </form>
    </div>
  );
}
