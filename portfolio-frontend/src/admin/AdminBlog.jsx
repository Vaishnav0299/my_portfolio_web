import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  readTime: '5 min read',
  date: new Date().toISOString().split('T')[0],
  tags: '',
  published: true,
};

export function AdminBlog() {
  const [posts, setPosts] = useState([]);
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
      const res = await api.getBlogPosts();
      setPosts(res.data || []);
    } catch {
      setError('Failed to load blog posts');
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

  const handleEdit = (p) => {
    setForm({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
      published: p.published !== false,
    });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: form.excerpt,
      content: form.content,
      readTime: form.readTime || '5 min read',
      date: form.date || new Date().toISOString().split('T')[0],
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: form.published,
    };

    try {
      if (editId) {
        await api.updateBlogPost(editId, payload);
        showToast('Article updated');
      } else {
        await api.createBlogPost(payload);
        showToast('Article created');
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
      await api.deleteBlogPost(id);
      setDeleteId(null);
      showToast('Article deleted');
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
            <BookOpen style={{ color: 'var(--accent-primary)', width: 28, height: 28 }} />
            Engineering Blog & Teardowns
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Publish deep-dives, architectural post-mortems, and engineering insights.
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
          <Plus style={{ width: 18, height: 18 }} /> New Article
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
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
          No articles written yet. Click "New Article" to start writing.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 20, background: p.published !== false ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.2)', color: p.published !== false ? '#10b981' : '#9ca3af' }}>
                    {p.published !== false ? 'Published' : 'Draft'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.date} · {p.readTime}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>{p.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{p.excerpt}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
                  <Pencil style={{ width: 17, height: 17 }} />
                </button>
                <button onClick={() => setDeleteId(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6 }}>
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
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {editId ? 'Edit Article' : 'New Article'}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Title *</label>
                <input required style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Scaling Real-Time WebSockets to 50k Concurrent Conns" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>URL Slug</label>
                  <input style={inputStyle} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="scaling-real-time-websockets" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Read Time</label>
                  <input style={inputStyle} value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} placeholder="e.g. 6 min read" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Short Excerpt *</label>
                <textarea required rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="A concise summary of the article..." />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Full Content (Markdown supported) *</label>
                <textarea required rows={8} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.84rem' }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="## Introduction&#10;&#10;Write the article body here..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Tags (comma-separated)</label>
                  <input style={inputStyle} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="WebSockets, Node.js, Redis, Architecture" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Status</label>
                  <select style={inputStyle} value={form.published ? 'true' : 'false'} onChange={e => setForm({ ...form, published: e.target.value === 'true' })}>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--accent-primary, #8b5cf6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Publish Article'}
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
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Delete Article</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure you want to delete this article? This action cannot be undone.</p>
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

export default AdminBlog;
