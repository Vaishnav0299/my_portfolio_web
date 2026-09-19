import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Github,
  Layers,
  Sparkles,
  Eye,
  Code2,
  Sliders,
  Globe,
  Calendar,
  User,
  TrendingUp,
  FileText,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const CATEGORY_PRESETS = [
  { id: 'fullstack', label: 'Full-Stack Systems', categoryName: 'Full-Stack Systems', type: 'Full Stack Platform', badgeClass: 'fullstack', color: '#6366f1' },
  { id: 'ai', label: 'AI & Automation', categoryName: 'AI & Automation', type: 'AI & Automation', badgeClass: 'ai', color: '#f59e0b' },
  { id: 'data-analytics', label: 'Data Analytics & ML', categoryName: 'Data Analytics & ML', type: 'Data Analytics & ML', badgeClass: 'data', color: '#8b5cf6' },
  { id: 'utility', label: 'Web Utility', categoryName: 'Web Utility', type: 'Web Utility', badgeClass: 'fullstack', color: '#06b6d4' },
  { id: 'backend', label: 'Backend API Service', categoryName: 'Backend API', type: 'Backend API', badgeClass: 'fullstack', color: '#ec4899' },
];

const STATUS_PRESETS = [
  { value: 'Production Ready', color: '#10b981', label: 'Production Ready' },
  { value: 'Active Development', color: '#3b82f6', label: 'Active Development' },
  { value: 'Completed', color: '#8b5cf6', label: 'Completed' },
  { value: 'Maintained', color: '#f59e0b', label: 'Maintained' },
];

const POPULAR_TAGS = [
  'React', 'TypeScript', 'Next.js', 'Node.js', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'Docker', 'Express', 'Scikit-Learn', 'Pandas', 'MongoDB',
  'WebSockets', 'LangChain', 'FastAPI', 'Redis'
];

const emptyForm = {
  name: '',
  category: 'fullstack',
  categoryName: 'Full-Stack Systems',
  type: 'Full Stack Platform',
  badgeClass: 'fullstack',
  tagline: '',
  desc: '',
  longDesc: '',
  problem: '',
  solution: '',
  architecture: '',
  challenges: '',
  role: 'Full-Stack Developer',
  period: '2024 — 2025',
  github: '',
  live: '',
  status: 'Production Ready',
  sortOrder: 1,
  stack: '',
  features: '',
  metrics: [
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
  ],
  stars: 0,
};

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && trimmed !== '#' && trimmed !== 'undefined';
}

function hasRealLiveUrl(live, github) {
  if (!isValidUrl(live)) return false;
  const trimmedLive = live.trim().toLowerCase();
  const trimmedGit = (github || '').trim().toLowerCase();
  if (trimmedGit && trimmedLive === trimmedGit) return false;
  if (trimmedLive.includes('github.com/') && !trimmedLive.includes('.github.io')) return false;
  return true;
}

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    api.getProjects()
      .then((res) => setProjects(res.data || []))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
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

  const handleOpenCreate = () => {
    setForm({
      ...emptyForm,
      sortOrder: projects.length + 1,
    });
    setEditId(null);
    setActiveTab('basic');
    setShowForm(true);
    setError('');
  };

  const handleEdit = (p) => {
    setForm({
      ...emptyForm,
      ...p,
      github: p.github ?? '',
      live: p.live ?? '',
      features: Array.isArray(p.features) ? p.features.join('\n') : (p.features || ''),
      stack: Array.isArray(p.stack) ? p.stack.join(', ') : (p.stack || ''),
      metrics: Array.isArray(p.metrics) && p.metrics.length > 0
        ? p.metrics
        : [{ label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }],
      stars: 0,
    });
    setEditId(p.id);
    setActiveTab('basic');
    setShowForm(true);
    setError('');
  };

  const handleCategorySelect = (preset) => {
    setForm((f) => ({
      ...f,
      category: preset.id === 'utility' || preset.id === 'backend' ? 'fullstack' : preset.id,
      categoryName: preset.categoryName,
      type: preset.type,
      badgeClass: preset.badgeClass,
    }));
  };

  const handleAddTag = (tag) => {
    const current = form.stack ? form.stack.split(',').map((s) => s.trim()).filter(Boolean) : [];
    if (!current.includes(tag)) {
      setForm((f) => ({ ...f, stack: [...current, tag].join(', ') }));
    }
  };

  const handleMetricChange = (index, field, val) => {
    const updated = [...(form.metrics || [])];
    if (!updated[index]) updated[index] = { label: '', value: '' };
    updated[index][field] = val;
    setForm((f) => ({ ...f, metrics: updated }));
  };

  const handleAddMetric = () => {
    setForm((f) => ({
      ...f,
      metrics: [...(f.metrics || []), { label: '', value: '' }],
    }));
  };

  const handleRemoveMetric = (index) => {
    setForm((f) => ({
      ...f,
      metrics: (f.metrics || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Project name is required');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    setError('');

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...formData } = form;
    const payload = {
      ...formData,
      live: (formData.live || '').trim(),
      github: (formData.github || '').trim(),
      features: typeof formData.features === 'string' ? formData.features.split('\n').map((s) => s.trim()).filter(Boolean) : (formData.features || []),
      stack: typeof formData.stack === 'string' ? formData.stack.split(',').map((s) => s.trim()).filter(Boolean) : (formData.stack || []),
      metrics: (formData.metrics || []).filter((m) => m.label && m.value),
      stars: 0,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    try {
      if (editId) {
        const res = await writeWithSync({ method: 'PUT', url: `/api/projects/admin/${editId}`, body: payload });
        if (res && res.error && !res.queued) throw new Error(res.error);
        showToast('Project updated successfully');
      } else {
        const res = await writeWithSync({ method: 'POST', url: '/api/projects/admin', body: payload });
        if (res && res.error && !res.queued) throw new Error(res.error);
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
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  };

  const currentStackList = form.stack ? form.stack.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const validMetrics = (form.metrics || []).filter((m) => m.label || m.value);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '0.85rem 1.4rem', borderRadius: 12,
          background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)',
          color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem',
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        }}>
          <Check style={{ width: 18, height: 18 }} /> {toast}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={26} style={{ color: 'var(--accent-primary)' }} />
            Projects Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Curate and manage showcase applications, production case studies, and live deployment links.
          </p>
        </div>
        <button
          id="admin-new-project-btn"
          className="btn btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem', fontSize: '0.92rem', borderRadius: '10px' }}
        >
          <Plus style={{ width: 18, height: 18 }} /> Add New Project
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1.25rem', borderRadius: 12,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMIZED CREATION & EDIT MODAL / WORKSPACE                              */}
      {/* ========================================================================= */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: '1120px', maxHeight: '92vh',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {editId ? <Pencil size={18} /> : <Sparkles size={18} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {editId ? `Edit Project: ${form.name || 'Untitled'}` : 'Create New Project'}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {editId ? 'Modify metadata, links, and system architecture.' : 'Draft a new production showcase piece.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  title="Toggle live public card preview"
                >
                  <Eye size={14} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '0.4rem', borderRadius: 8, display: 'flex',
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '0.75rem 1.75rem',
              borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)',
              overflowX: 'auto',
            }}>
              {[
                { id: 'basic', label: 'Basic Info', icon: Sliders },
                { id: 'story', label: 'Story & Architecture', icon: FileText },
                { id: 'stack', label: 'Tech Stack & Features', icon: Code2 },
                { id: 'links', label: 'Links & Deployment', icon: Globe },
                { id: 'metrics', label: 'Impact Metrics', icon: TrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: activeTab === id ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === id ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {/* Modal Body: Form (Left) & Real-Time Preview (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1.2fr 0.8fr' : '1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Form Scroll Area */}
              <form onSubmit={handleSubmit} style={{ padding: '1.75rem', overflowY: 'auto', maxHeight: '68vh' }}>
                {/* ── TAB 1: BASIC INFO ──────────────────────────────────── */}
                {activeTab === 'basic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Project Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sales Analytics & Customer Churn Prediction"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* Category Presets */}
                    <div>
                      <label style={labelStyle}>Category Preset</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {CATEGORY_PRESETS.map((preset) => {
                          const isSelected = form.categoryName === preset.categoryName || (form.category === preset.id && !form.categoryName);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleCategorySelect(preset)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: 8,
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: isSelected ? `2px solid ${preset.color}` : '1px solid var(--border-color)',
                                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-primary)',
                                color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Category Slug</label>
                          <input
                            type="text"
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            style={{ ...inputStyle, padding: '0.55rem 0.75rem' }}
                            placeholder="fullstack | ai | data-analytics"
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Display Label</label>
                          <input
                            type="text"
                            value={form.categoryName}
                            onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                            style={{ ...inputStyle, padding: '0.55rem 0.75rem' }}
                            placeholder="e.g. Full-Stack Workspace"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Sort Order */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Status State</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                          style={inputStyle}
                        >
                          {STATUS_PRESETS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Sort Order</label>
                        <input
                          type="number"
                          value={form.sortOrder}
                          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                          style={inputStyle}
                          min={0}
                        />
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div>
                      <label style={labelStyle}>Card Badge Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Production Platform, ML Pipeline, Web Utility"
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* ── TAB 2: STORY & ARCHITECTURE ────────────────────────── */}
                {activeTab === 'story' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Catchy Tagline (Card Subtitle)</label>
                      <input
                        type="text"
                        placeholder="e.g. End-to-end sales cohort analytics & churn prediction ML pipeline."
                        value={form.tagline || ''}
                        onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Short Overview (Fallback)</label>
                      <textarea
                        rows={2}
                        placeholder="Brief 1-2 sentence description..."
                        value={form.desc || ''}
                        onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Comprehensive Case Study Description</label>
                      <textarea
                        rows={4}
                        placeholder="Deep-dive summary of features, capabilities, and business impact..."
                        value={form.longDesc || ''}
                        onChange={(e) => setForm((f) => ({ ...f, longDesc: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ ...labelStyle, color: '#ef4444' }}>The Challenge / Problem</label>
                        <textarea
                          rows={3}
                          placeholder="What architectural or business problem did you solve?"
                          value={form.problem || ''}
                          onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                          style={{ ...inputStyle, resize: 'vertical', borderLeft: '3px solid #ef4444' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: '#10b981' }}>The Solution / Architecture</label>
                        <textarea
                          rows={3}
                          placeholder="How did your technical implementation solve it?"
                          value={form.solution || ''}
                          onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))}
                          style={{ ...inputStyle, resize: 'vertical', borderLeft: '3px solid #10b981' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Technical Architecture Details</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Python pipeline using Pandas, Scikit-Learn. Interactive inference UI served via Streamlit."
                        value={form.architecture || ''}
                        onChange={(e) => setForm((f) => ({ ...f, architecture: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Engineering Challenges &amp; Resolution</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. High class imbalance resolved with SMOTE sampling..."
                        value={form.challenges || ''}
                        onChange={(e) => setForm((f) => ({ ...f, challenges: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  </div>
                )}

                {/* ── TAB 3: TECH STACK & FEATURES ───────────────────────── */}
                {activeTab === 'stack' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Tech Stack (Comma-Separated)</label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Next.js, Node.js, WebSockets"
                        value={form.stack || ''}
                        onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    {/* Quick-add pills */}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                        Quick-Add Popular Technologies:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {POPULAR_TAGS.map((tag) => {
                          const isAlready = currentStackList.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleAddTag(tag)}
                              disabled={isAlready}
                              style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                cursor: isAlready ? 'default' : 'pointer',
                                background: isAlready ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: isAlready ? '#10b981' : 'var(--text-secondary)',
                                opacity: isAlready ? 0.6 : 1,
                              }}
                            >
                              {isAlready ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Key Features (One Line per Bullet)</label>
                      <textarea
                        rows={5}
                        placeholder="Sub-50ms distributed multi-user cursor tracking&#10;CRDT-based state reconciliation&#10;Automated export to PDF"
                        value={form.features || ''}
                        onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                        Tip: Press Enter between each feature. Each line becomes an interactive checklist item in the modal.
                      </span>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: LINKS & DEPLOYMENT ──────────────────────────── */}
                {activeTab === 'links' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ ...labelStyle, margin: 0 }}>GitHub Repository URL</label>
                        {isValidUrl(form.github) && (
                          <a
                            href={form.github}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <ExternalLink size={12} /> Test GitHub Link
                          </a>
                        )}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Github size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="url"
                          placeholder="https://github.com/Vaishnav0299/repo-name"
                          value={form.github || ''}
                          onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
                          style={{ ...inputStyle, paddingLeft: '2.4rem' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                        If provided, a GitHub icon button will be displayed on the card and modal.
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ ...labelStyle, margin: 0 }}>Live Deployment Web URL</label>
                        {hasRealLiveUrl(form.live, form.github) && (
                          <a
                            href={form.live}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <ExternalLink size={12} /> Test Live Demo
                          </a>
                        )}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Globe size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="url"
                          placeholder="https://my-app.vercel.app (Leave empty if not deployed)"
                          value={form.live || ''}
                          onChange={(e) => setForm((f) => ({ ...f, live: e.target.value }))}
                          style={{ ...inputStyle, paddingLeft: '2.4rem' }}
                        />
                      </div>
                      <div style={{
                        marginTop: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: 8,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}>
                        <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                        <span>
                          <strong>Smart Link Visibility:</strong> If left empty or matches your GitHub URL, the Live Demo button is automatically hidden from public visitors.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                      <div>
                        <label style={labelStyle}><User size={13} /> Your Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Full-Stack Engineer"
                          value={form.role || ''}
                          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}><Calendar size={13} /> Period / Timeline</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024 — 2025"
                          value={form.period || ''}
                          onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: IMPACT METRICS ──────────────────────────────── */}
                {activeTab === 'metrics' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ ...labelStyle, margin: 0 }}>Impact Metric Chips</label>
                        <button
                          type="button"
                          onClick={handleAddMetric}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          + Add Metric
                        </button>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
                        Quantitative impact metrics displayed directly on your public cards (e.g. latency, accuracy, uptime).
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(form.metrics || []).map((metric, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1.2fr 1.2fr auto',
                              gap: '0.75rem',
                              alignItems: 'center',
                              padding: '0.75rem',
                              borderRadius: 10,
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                                Metric Label
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Inference Latency"
                                value={metric.label || ''}
                                onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                                style={{ ...inputStyle, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                                Highlight Value
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. <250ms, 99.9%"
                                value={metric.value || ''}
                                onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                                style={{ ...inputStyle, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMetric(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                alignSelf: 'flex-end',
                              }}
                              title="Remove metric"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Action Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    * Star count has been automatically removed.
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                      style={{ padding: '0.6rem 1.25rem', borderRadius: 8 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                      style={{ padding: '0.6rem 1.4rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {saving ? 'Saving…' : editId ? 'Save Changes' : 'Publish Project'}
                    </button>
                  </div>
                </div>
              </form>

              {/* ── REAL-TIME CARD PREVIEW (RIGHT SIDE) ───────────────────── */}
              {showPreview && (
                <div style={{
                  background: 'var(--bg-primary)',
                  borderLeft: '1px solid var(--border-color)',
                  padding: '1.75rem',
                  overflowY: 'auto',
                  maxHeight: '68vh',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem',
                  }}>
                    <Eye size={13} /> Live Portfolio Card Preview
                  </div>

                  {/* Public-Facing Card Simulation */}
                  <div
                    className="glass-card"
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Badge & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <span className={`badge badge-${form.badgeClass || 'fullstack'}`} style={{ fontSize: '0.75rem' }}>
                          {form.type || 'Production Platform'}
                        </span>
                        {form.status && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                            <span
                              style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: hasRealLiveUrl(form.live, form.github) ? '#10b981' : '#6366f1',
                                display: 'inline-block',
                              }}
                            />
                            <span>{form.status}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        {form.name || 'Untitled Project'}
                      </h3>

                      {/* Tagline */}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                        {form.tagline || form.desc || 'No summary entered yet...'}
                      </p>

                      {/* Metric Chips */}
                      {validMetrics.length > 0 && (
                        <div className="metric-chips-grid" style={{ margin: '0.5rem 0' }}>
                          {validMetrics.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="metric-chip-item">
                              <div className="metric-chip-val" style={{ fontSize: '0.85rem' }}>{m.value || '—'}</div>
                              <div className="metric-chip-label" style={{ fontSize: '0.7rem' }}>{m.label || 'Metric'}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tech stack */}
                      {currentStackList.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto', paddingTop: '0.85rem' }}>
                          {currentStackList.slice(0, 4).map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.18rem 0.45rem',
                                borderRadius: '4px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                          {currentStackList.length > 4 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                              +{currentStackList.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="project-card-footer" style={{ padding: '0.75rem 1.25rem' }}>
                      <div className="project-arch-btn" style={{ fontSize: '0.8rem', pointerEvents: 'none' }}>
                        <Layers size={13} />
                        <span>Architecture</span>
                      </div>

                      {(isValidUrl(form.github) || hasRealLiveUrl(form.live, form.github)) && (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {isValidUrl(form.github) && (
                            <div className="project-link-btn" style={{ padding: '0.35rem', pointerEvents: 'none' }}>
                              <Github size={14} />
                            </div>
                          )}
                          {hasRealLiveUrl(form.live, form.github) && (
                            <div className="project-link-btn" style={{ padding: '0.35rem', pointerEvents: 'none' }}>
                              <ExternalLink size={14} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Preview reflects public card state in real time.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECTS LIST VIEW                                                        */}
      {/* ========================================================================= */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)',
          borderRadius: 16, border: '1px dashed var(--border-color)',
        }}>
          <FolderGit2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.6 }} />
          <h3 style={{ margin: 0, fontWeight: 700 }}>No Projects Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', marginBottom: '1.25rem' }}>
            Click &quot;Add New Project&quot; above to create your first portfolio entry.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {projects.map((p) => {
            const hasLive = hasRealLiveUrl(p.live, p.github);
            const hasGit = isValidUrl(p.github);

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem 1.4rem',
                  borderRadius: 14,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
              >
                <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {p.name}
                    </span>
                    <span className={`badge badge-${p.badgeClass || 'fullstack'}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                      {p.categoryName || p.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: hasLive ? '#10b981' : '#6366f1',
                          display: 'inline-block',
                        }}
                      />
                      {p.status || 'Active'}
                    </span>
                    <span>·</span>
                    <span>Order #{p.sortOrder ?? 0}</span>
                    {hasGit && (
                      <>
                        <span>·</span>
                        <a href={p.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Github size={12} /> GitHub
                        </a>
                      </>
                    )}
                    {hasLive && (
                      <>
                        <span>·</span>
                        <a href={p.live} target="_blank" rel="noreferrer" style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <ExternalLink size={12} /> Live Deployed
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    id={`edit-project-${p.id}`}
                    onClick={() => handleEdit(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} /> Edit
                  </button>

                  {deleteId === p.id ? (
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn btn-sm"
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.45rem 0.75rem' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.45rem 0.75rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`delete-project-${p.id}`}
                      onClick={() => setDeleteId(p.id)}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)', padding: '0.45rem 0.65rem',
                        cursor: 'pointer', borderRadius: 8,
                      }}
                      title="Delete Project"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminProjects;
