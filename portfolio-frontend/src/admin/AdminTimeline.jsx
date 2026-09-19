import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  Sliders,
  Layers,
  Code2,
  Building2,
} from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const PERIOD_PRESETS = [
  '2024 — Present',
  '2023 — 2024',
  '2022 — 2024',
  '2020 — 2024',
  '2018 — 2022',
];

const LOCATION_PRESETS = [
  'Pune, India (Remote)',
  'Remote Worldwide',
  'Bengaluru, India',
  'San Francisco, CA',
  'Hybrid',
];

const POPULAR_STACK = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Docker',
  'AWS',
  'FastAPI',
  'Tailwind CSS',
  'MongoDB',
  'Redis',
];

const emptyForm = {
  type: 'work',
  time: '',
  title: '',
  inst: '',
  location: '',
  desc: '',
  achievements: [''],
  stack: '',
  sortOrder: 1,
};

export function AdminTimeline() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const load = () => {
    setLoading(true);
    api.getTimeline()
      .then((res) => setEntries(res.data || []))
      .catch(() => setError('Failed to load timeline'))
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
      sortOrder: entries.length + 1,
    });
    setEditId(null);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (e) => {
    setForm({
      type: e.type || 'work',
      time: e.time || '',
      title: e.title || '',
      inst: e.inst || '',
      location: e.location || '',
      desc: e.desc || '',
      achievements: Array.isArray(e.achievements) && e.achievements.length > 0 ? e.achievements : [''],
      stack: Array.isArray(e.stack) ? e.stack.join(', ') : (e.stack || ''),
      sortOrder: e.sortOrder ?? 1,
    });
    setEditId(e.id);
    setShowForm(true);
    setError('');
  };

  const handleAddAchievement = () => {
    setForm((f) => ({
      ...f,
      achievements: [...(f.achievements || []), ''],
    }));
  };

  const handleUpdateAchievement = (index, value) => {
    setForm((f) => {
      const next = [...(f.achievements || [])];
      next[index] = value;
      return { ...f, achievements: next };
    });
  };

  const handleRemoveAchievement = (index) => {
    setForm((f) => {
      const next = (f.achievements || []).filter((_, i) => i !== index);
      return { ...f, achievements: next.length > 0 ? next : [''] };
    });
  };

  const handleAddStackTag = (tag) => {
    const currentList = (form.stack || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentList.includes(tag)) {
      currentList.push(tag);
      setForm((f) => ({ ...f, stack: currentList.join(', ') }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.inst.trim() || !form.time.trim()) {
      setError('Please fill in Title, Institution/Company, and Year/Period.');
      return;
    }

    setSaving(true);
    setError('');

    const cleanAchievements = (form.achievements || [])
      .map((a) => (typeof a === 'string' ? a.trim() : ''))
      .filter(Boolean);

    const cleanStack = (form.stack || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      type: form.type || 'work',
      time: form.time.trim(),
      title: form.title.trim(),
      inst: form.inst.trim(),
      location: form.location?.trim() || undefined,
      desc: form.desc?.trim() || form.title.trim(),
      achievements: cleanAchievements.length > 0 ? cleanAchievements : undefined,
      stack: cleanStack.length > 0 ? cleanStack : undefined,
      sortOrder: Number(form.sortOrder) || 1,
    };

    try {
      if (editId) {
        await writeWithSync({ method: 'PUT', url: `/api/timeline/admin/${editId}`, body: payload });
        showToast('Milestone updated successfully');
      } else {
        await writeWithSync({ method: 'POST', url: '/api/timeline/admin', body: payload });
        showToast('Milestone created successfully');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await writeWithSync({ method: 'DELETE', url: `/api/timeline/admin/${id}` });
      setDeleteId(null);
      showToast('Milestone deleted');
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const currentStackList = (form.stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isEducation = form.type === 'education';
  const accentColor = isEducation ? '#10b981' : '#8b5cf6';
  const IconComponent = isEducation ? GraduationCap : Briefcase;

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.875rem',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  };

  const filteredEntries = entries.filter((e) => {
    if (filterTab === 'all') return true;
    return e.type === filterTab;
  });

  return (
    <div>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: '0.75rem 1.25rem',
            borderRadius: 12,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            color: '#10b981',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} />
            Career &amp; Education Timeline
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage professional roles, academic milestones, locations, and key accomplishments.
          </p>
        </div>

        <button
          id="admin-new-timeline-btn"
          className="btn btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus style={{ width: 16, height: 16 }} /> New Milestone
        </button>
      </div>

      {error && !showForm && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'all', label: 'All Milestones' },
          { id: 'work', label: 'Work Experience' },
          { id: 'education', label: 'Education' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterTab === tab.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: filterTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* CUSTOMIZED CREATION & EDIT MODAL                                          */}
      {/* ========================================================================= */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1080px',
              maxHeight: '92vh',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isEducation ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {editId ? `Edit Milestone: ${form.title || 'Untitled'}` : 'Create New Milestone'}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {editId
                      ? 'Modify role, institution, key achievements, and technologies.'
                      : 'Record a new position, academic degree, or engineering milestone.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  title="Toggle real-time timeline card preview"
                >
                  <Eye size={14} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: 8,
                    display: 'flex',
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  margin: '1rem 1.75rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Modal Body: Form (Left) & Real-Time Card Preview (Right) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: showPreview ? '1.2fr 0.8fr' : '1fr',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Form Area */}
              <form onSubmit={handleSubmit} style={{ padding: '1.75rem', overflowY: 'auto', maxHeight: '72vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Type Selector (Work vs Education) */}
                  <div>
                    <label style={labelStyle}>
                      <Sliders size={13} /> Milestone Category / Type *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: 'work' }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          borderRadius: 10,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: form.type === 'work' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-primary)',
                          border: form.type === 'work' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                          color: form.type === 'work' ? '#8b5cf6' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Briefcase size={16} /> Work Experience / Role
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: 'education' }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          borderRadius: 10,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: form.type === 'education' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                          border: form.type === 'education' ? '2px solid #10b981' : '1px solid var(--border-color)',
                          color: form.type === 'education' ? '#10b981' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <GraduationCap size={16} /> Education &amp; Academics
                      </button>
                    </div>
                  </div>

                  {/* Title and Institution */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        {isEducation ? <GraduationCap size={13} /> : <Briefcase size={13} />}
                        {isEducation ? 'Degree / Field of Study *' : 'Role / Position Title *'}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={isEducation ? 'e.g. B.Tech in Computer Engineering' : 'e.g. Full-Stack Software Engineer'}
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        <Building2 size={13} />
                        {isEducation ? 'University / Institution *' : 'Company / Organization *'}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={isEducation ? 'e.g. Pune University' : 'e.g. Tech Corp / Freelance'}
                        value={form.inst}
                        onChange={(e) => setForm((f) => ({ ...f, inst: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Period & Location */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ ...labelStyle, margin: 0 }}>
                          <Calendar size={13} /> Year / Period *
                        </label>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 2024 — Present"
                        value={form.time}
                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                        style={inputStyle}
                      />
                      {/* Period Presets */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                        {PERIOD_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, time: p }))}
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: 4,
                              fontSize: '0.72rem',
                              background: form.time === p ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: form.time === p ? 'var(--accent-primary)' : 'var(--text-muted)',
                              cursor: 'pointer',
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        <MapPin size={13} /> Location (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune, India (Remote)"
                        value={form.location || ''}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        style={inputStyle}
                      />
                      {/* Location Presets */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                        {LOCATION_PRESETS.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, location: loc }))}
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: 4,
                              fontSize: '0.72rem',
                              background: form.location === loc ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: form.location === loc ? '#10b981' : 'var(--text-muted)',
                              cursor: 'pointer',
                            }}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Narrative Overview / Description */}
                  <div>
                    <label style={labelStyle}>Overview &amp; Context *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Brief summary of your responsibilities, course focus, or scope of impact..."
                      value={form.desc}
                      onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  {/* Key Achievements Bullets */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ ...labelStyle, margin: 0 }}>
                        <CheckCircle2 size={13} style={{ color: accentColor }} /> Key Achievements &amp; Impact
                      </label>
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        + Add Bullet
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(form.achievements || []).map((ach, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <CheckCircle2 size={14} style={{ color: accentColor, flexShrink: 0 }} />
                          <input
                            type="text"
                            placeholder="e.g. Scaled distributed pipeline to handle 10k concurrent WebSocket connections"
                            value={ach}
                            onChange={(e) => handleUpdateAchievement(idx, e.target.value)}
                            style={{ ...inputStyle, padding: '0.5rem 0.75rem', fontSize: '0.84rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievement(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.35rem',
                              opacity: (form.achievements || []).length > 1 ? 1 : 0.4,
                            }}
                            disabled={(form.achievements || []).length <= 1}
                            title="Remove bullet"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack & Tooling */}
                  <div>
                    <label style={labelStyle}>
                      <Code2 size={13} /> Technologies Used (Comma-Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
                      value={form.stack || ''}
                      onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))}
                      style={inputStyle}
                    />

                    {/* Quick Stack Adder */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Quick-Add Technologies:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {POPULAR_STACK.map((tag) => {
                          const isAlready = currentStackList.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleAddStackTag(tag)}
                              disabled={isAlready}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 5,
                                fontSize: '0.72rem',
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
                  </div>

                  {/* Sort Order */}
                  <div style={{ width: '140px' }}>
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

                {/* Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Preview reflects public timeline styling in real time.
                  </span>
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
                      style={{
                        padding: '0.6rem 1.4rem',
                        borderRadius: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Milestone'}
                    </button>
                  </div>
                </div>
              </form>

              {/* ── REAL-TIME TIMELINE CARD PREVIEW (RIGHT SIDE) ──────────── */}
              {showPreview && (
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    borderLeft: '1px solid var(--border-color)',
                    padding: '1.75rem',
                    overflowY: 'auto',
                    maxHeight: '72vh',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem',
                    }}
                  >
                    <Eye size={13} /> Live Timeline Simulation
                  </div>

                  {/* Public Card Mockup */}
                  <div style={{ position: 'relative', paddingLeft: '1.75rem', borderLeft: '2px solid var(--border-color)', marginTop: '0.5rem' }}>
                    {/* Bullet Node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.05rem',
                        top: '0.5rem',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'var(--bg-surface)',
                        border: `2px solid ${accentColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accentColor,
                        boxShadow: `0 0 12px ${accentColor}40`,
                      }}
                    >
                      <IconComponent size={15} />
                    </div>

                    {/* Timeline Body */}
                    <div
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        borderRadius: '14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {form.title || 'Milestone Title'}
                          </h3>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: accentColor, marginTop: '0.2rem' }}>
                            {form.inst || 'Institution / Company'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-muted)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-color)',
                              display: 'inline-block',
                            }}
                          >
                            {form.time || '2024 — Present'}
                          </span>
                          {form.location && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.3rem',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <MapPin size={11} />
                              <span>{form.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.65rem 0 0.85rem' }}>
                        {form.desc || 'Brief overview description goes here...'}
                      </p>

                      {/* Achievements */}
                      {(form.achievements || []).filter((a) => a && a.trim()).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                          {(form.achievements || [])
                            .filter((a) => a && a.trim())
                            .map((ach, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.45rem',
                                  fontSize: '0.8rem',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <CheckCircle2 size={13} style={{ color: accentColor, flexShrink: 0, marginTop: '2px' }} />
                                <span>{ach}</span>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Tech Stack */}
                      {currentStackList.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.3rem',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '0.75rem',
                          }}
                        >
                          {currentStackList.map((s, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Type is configured as <strong>{isEducation ? 'Education' : 'Work Experience'}</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIMELINE LIST VIEW                                                        */}
      {/* ========================================================================= */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading timeline…</p>
      ) : filteredEntries.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-color)',
            borderRadius: 16,
            color: 'var(--text-muted)',
          }}
        >
          No timeline entries found under &quot;{filterTab}&quot;. Click &quot;New Milestone&quot; to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredEntries.map((e) => {
            const entryEdu = e.type === 'education';
            const entryColor = entryEdu ? '#10b981' : '#8b5cf6';
            const EntryIcon = entryEdu ? GraduationCap : Briefcase;
            const achCount = Array.isArray(e.achievements) ? e.achievements.length : 0;
            const stackCount = Array.isArray(e.stack) ? e.stack.length : 0;

            return (
              <div
                key={e.id}
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', flex: '1 1 300px', minWidth: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${entryColor}18`,
                      color: entryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <EntryIcon size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{e.title}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 6,
                          background: `${entryColor}20`,
                          color: entryColor,
                        }}
                      >
                        {entryEdu ? 'Education' : 'Work'}
                      </span>
                      <span style={{ fontWeight: 700, color: entryColor, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {e.time}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{e.inst}</span>
                      {e.location && (
                        <>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
                            <MapPin size={12} /> {e.location}
                          </span>
                        </>
                      )}
                      {achCount > 0 && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--text-muted)' }}>{achCount} achievements</span>
                        </>
                      )}
                      {stackCount > 0 && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--text-muted)' }}>{stackCount} tech tags</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    id={`edit-timeline-${e.id}`}
                    onClick={() => handleEdit(e)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} /> Edit
                  </button>

                  {deleteId === e.id ? (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleDelete(e.id)}
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
                      id={`delete-timeline-${e.id}`}
                      onClick={() => setDeleteId(e.id)}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                        padding: '0.45rem 0.65rem',
                        cursor: 'pointer',
                        borderRadius: 8,
                      }}
                      title="Delete entry"
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

export default AdminTimeline;
