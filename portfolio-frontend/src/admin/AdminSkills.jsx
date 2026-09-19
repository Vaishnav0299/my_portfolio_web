import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Percent,
  Sparkles,
  Layers,
  ListFilter,
  Layout,
  Server,
  Database,
  Cpu,
  Code2,
  Eye,
  Sliders,
  Terminal,
  Cloud,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { writeWithSync } from '../lib/syncManager';

const ICON_MAP = {
  Layout,
  Server,
  Database,
  Cpu,
  Code2,
  Terminal,
  Cloud,
  Shield,
};

const CATEGORY_PRESETS = [
  {
    name: 'Frontend Development',
    icon: 'Layout',
    suggested: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux / Zustand'],
  },
  {
    name: 'Backend & APIs',
    icon: 'Server',
    suggested: ['Node.js', 'Express.js', 'FastAPI', 'Hono', 'WebSockets', 'REST APIs'],
  },
  {
    name: 'AI & Machine Learning',
    icon: 'Cpu',
    suggested: ['Python', 'Scikit-Learn', 'PyTorch', 'LangChain', 'Pandas / NumPy', 'Hugging Face'],
  },
  {
    name: 'Databases & Storage',
    icon: 'Database',
    suggested: ['PostgreSQL', 'Redis', 'MongoDB', 'Supabase', 'Drizzle ORM', 'Prisma'],
  },
  {
    name: 'DevOps & Cloud',
    icon: 'Cloud',
    suggested: ['Docker', 'AWS', 'CI/CD Pipelines', 'Linux', 'Vercel', 'Nginx'],
  },
  {
    name: 'Core CS & Languages',
    icon: 'Code2',
    suggested: ['Data Structures & Algorithms', 'C++', 'Java', 'System Design', 'Git / GitHub'],
  },
];

export function parseMasteryToPercentage(input) {
  if (input === null || input === undefined) return '';
  const str = String(input).trim();
  if (!str) return '';

  if (str.includes('%')) {
    const num = parseFloat(str.replace(/%/g, '').trim());
    if (isNaN(num)) return '';
    const clamped = Math.min(100, Math.max(0, num));
    return `${Math.round(clamped)}%`;
  }

  if (str.includes('/')) {
    const [numStr, denStr] = str.split('/');
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      const pct = Math.min(100, Math.max(0, (num / den) * 100));
      return `${Math.round(pct)}%`;
    }
  }

  const num = parseFloat(str);
  if (isNaN(num)) return '';

  if (num >= 0 && num <= 10) {
    const pct = Math.min(100, Math.max(0, num * 10));
    return `${Math.round(pct)}%`;
  }

  if (num > 10 && num <= 100) {
    return `${Math.round(num)}%`;
  }

  if (num > 100) {
    return '100%';
  }

  return `${Math.round(num)}%`;
}

const emptyForm = {
  category: '',
  icon: 'Layout',
  sortOrder: 1,
  items: [{ name: '', rating: '9.0', val: '90%' }],
};

export function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const load = () => {
    setLoading(true);
    api.getSkills()
      .then((res) => setSkills(res.data || []))
      .catch(() => setError('Failed to load skills'))
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

  const handleOpenNew = () => {
    setForm({
      category: '',
      icon: 'Layout',
      sortOrder: skills.length + 1,
      items: [{ name: '', rating: '9.0', val: '90%' }],
    });
    setBulkMode(false);
    setBulkText('');
    setEditId(null);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (s) => {
    const parsedItems = Array.isArray(s.items) && s.items.length > 0
      ? s.items.map((item) => {
          const valStr = typeof item.val === 'string' ? item.val : `${item.level || item.val || 80}%`;
          return {
            name: item.name || '',
            rating: valStr,
            val: parseMasteryToPercentage(valStr) || valStr,
          };
        })
      : [{ name: '', rating: '', val: '' }];

    setForm({
      category: s.category || '',
      icon: s.icon || 'Layout',
      sortOrder: s.sortOrder ?? 0,
      items: parsedItems,
    });
    setBulkText(parsedItems.map((i) => `${i.name}:${i.val}`).join('\n'));
    setBulkMode(false);
    setEditId(s.id);
    setShowForm(true);
    setError('');
  };

  const handleCategoryPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      category: preset.name,
      icon: preset.icon,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = [...prev.items];
      const current = { ...nextItems[index], [field]: value };

      if (field === 'rating') {
        const converted = parseMasteryToPercentage(value);
        current.val = converted;
      } else if (field === 'val') {
        current.rating = value;
      }

      nextItems[index] = current;
      return { ...prev, items: nextItems };
    });
  };

  const handleAddItem = (presetName = '', presetRating = '9.0') => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: presetName,
          rating: presetRating,
          val: parseMasteryToPercentage(presetRating) || '90%',
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => {
      const nextItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: nextItems.length > 0 ? nextItems : [{ name: '', rating: '', val: '' }],
      };
    });
  };

  const toggleBulkMode = () => {
    if (!bulkMode) {
      const lines = form.items
        .filter((i) => i.name)
        .map((i) => `${i.name}:${i.val || parseMasteryToPercentage(i.rating) || '80%'}`)
        .join('\n');
      setBulkText(lines);
      setBulkMode(true);
    } else {
      const parsed = bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) {
            return { name: line, rating: '9.0', val: '90%' };
          }
          const name = line.substring(0, colonIdx).trim();
          const rawRating = line.substring(colonIdx + 1).trim();
          const converted = parseMasteryToPercentage(rawRating) || '80%';
          return { name, rating: rawRating, val: converted };
        });

      setForm((prev) => ({
        ...prev,
        items: parsed.length > 0 ? parsed : [{ name: '', rating: '', val: '' }],
      }));
      setBulkMode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let finalItems = [];
    if (bulkMode) {
      finalItems = bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(':');
          const name = colonIdx !== -1 ? line.substring(0, colonIdx).trim() : line.trim();
          const rawVal = colonIdx !== -1 ? line.substring(colonIdx + 1).trim() : '90%';
          const val = parseMasteryToPercentage(rawVal) || '80%';
          return { name, val };
        })
        .filter((i) => i.name);
    } else {
      finalItems = form.items
        .map((item) => {
          const pct = item.val || parseMasteryToPercentage(item.rating) || '80%';
          return {
            name: (item.name || '').trim(),
            val: pct.endsWith('%') ? pct : `${pct}%`,
          };
        })
        .filter((i) => i.name);
    }

    if (!form.category.trim()) {
      setError('Please provide a category name');
      return;
    }

    if (finalItems.length === 0) {
      setError('Please add at least one skill name');
      return;
    }

    setSaving(true);
    const payload = {
      category: form.category.trim(),
      icon: form.icon?.trim() || 'Layout',
      sortOrder: Number(form.sortOrder) || 0,
      items: finalItems,
    };

    try {
      if (editId) {
        await writeWithSync({ method: 'PUT', url: `/api/skills/admin/${editId}`, body: payload });
        showToast('Skill updated successfully');
      } else {
        await writeWithSync({ method: 'POST', url: '/api/skills/admin', body: payload });
        showToast('Skill category created successfully');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message || 'Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await writeWithSync({ method: 'DELETE', url: `/api/skills/admin/${id}` });
      setDeleteId(null);
      showToast('Skill deleted');
      load();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  const SelectedIcon = ICON_MAP[form.icon] || Layout;

  const currentCategoryPreset = CATEGORY_PRESETS.find(
    (p) => p.name.toLowerCase() === form.category.toLowerCase()
  );

  const activeSkillsList = bulkMode
    ? bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(':');
          const name = colonIdx !== -1 ? line.substring(0, colonIdx).trim() : line.trim();
          const rawVal = colonIdx !== -1 ? line.substring(colonIdx + 1).trim() : '90%';
          const val = parseMasteryToPercentage(rawVal) || '80%';
          return { name, val };
        })
    : form.items
        .filter((i) => i.name && i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          val: i.val || parseMasteryToPercentage(i.rating) || '80%',
        }));

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
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
    display: 'block',
  };

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

      {/* Header */}
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
            <Layers style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} />
            Skills &amp; Mastery Matrix
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage technical skill categories, ratings, and real-time proficiency percentage bars.
          </p>
        </div>
        <button
          id="admin-new-skill-btn"
          className="btn btn-primary"
          onClick={handleOpenNew}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus style={{ width: 16, height: 16 }} /> New Category
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
              maxWidth: '1100px',
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
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SelectedIcon size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {editId ? `Edit Category: ${form.category || 'Untitled'}` : 'Create Skill Category'}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {editId ? 'Refine technical stack skills and proficiency percentages.' : 'Add a new core competency group.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  title="Toggle real-time card preview"
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

            {/* Modal Body */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: showPreview ? '1.25fr 0.75fr' : '1fr',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Form Scroll Area */}
              <form onSubmit={handleSubmit} style={{ padding: '1.75rem', overflowY: 'auto', maxHeight: '72vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Category Presets */}
                  <div>
                    <label style={labelStyle}>Quick Category Presets</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {CATEGORY_PRESETS.map((preset) => {
                        const isSelected = form.category.toLowerCase() === preset.name.toLowerCase();
                        const PresetIcon = ICON_MAP[preset.icon] || Layout;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleCategoryPreset(preset)}
                            style={{
                              padding: '0.35rem 0.7rem',
                              borderRadius: 8,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-primary)',
                              border: isSelected ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
                              color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <PresetIcon size={13} />
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Name & Sort Order */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Category Name *</label>
                      <input
                        required
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        style={inputStyle}
                        placeholder="e.g. Frontend Development"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Sort Order</label>
                      <input
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Visual Icon Selector */}
                  <div>
                    <label style={labelStyle}>Category Icon</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {Object.keys(ICON_MAP).map((iconKey) => {
                        const Icon = ICON_MAP[iconKey];
                        const isSelected = form.icon === iconKey;
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, icon: iconKey }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.4rem 0.75rem',
                              borderRadius: 8,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-primary)',
                              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                              color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Icon size={14} />
                            <span>{iconKey}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Suggestion Pills */}
                  {currentCategoryPreset?.suggested && (
                    <div style={{ padding: '0.75rem', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Suggested Skills for {currentCategoryPreset.name}:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {currentCategoryPreset.suggested.map((sName) => {
                          const isAlready = form.items.some(
                            (i) => i.name.toLowerCase() === sName.toLowerCase()
                          );
                          return (
                            <button
                              key={sName}
                              type="button"
                              onClick={() => handleAddItem(sName, '9.0')}
                              disabled={isAlready}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 5,
                                fontSize: '0.72rem',
                                cursor: isAlready ? 'default' : 'pointer',
                                background: isAlready ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                color: isAlready ? '#10b981' : 'var(--text-secondary)',
                                opacity: isAlready ? 0.6 : 1,
                              }}
                            >
                              {isAlready ? `✓ ${sName}` : `+ ${sName}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Skills Editor */}
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 12,
                      padding: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ ...labelStyle, marginBottom: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Skills &amp; Mastery Levels
                          </label>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: 'var(--accent-primary)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 6,
                              fontWeight: 600,
                            }}
                          >
                            Auto-converts 1-10 or %
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Enter rating out of 10 (e.g. <b>9.5</b> → 95%, <b>9/10</b> → 90%) or percentage (<b>92%</b>).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={toggleBulkMode}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ListFilter style={{ width: 13, height: 13 }} />
                        {bulkMode ? 'Visual Row Builder' : 'Raw Text Mode'}
                      </button>
                    </div>

                    {bulkMode ? (
                      <div>
                        <textarea
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          rows={6}
                          style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', resize: 'vertical' }}
                          placeholder={'React:95%\nNext.js:9.2\nTypeScript:90%\nTailwind CSS:94%'}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                          Format: <code>SkillName:RatingOrPercentage</code> (one per line).
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(140px, 2fr) minmax(130px, 1.4fr) minmax(110px, 1fr) 36px',
                            gap: '0.75rem',
                            padding: '0 0.25rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <div>Skill Name</div>
                          <div>Rating (1-10 or %)</div>
                          <div>Auto-Converted</div>
                          <div></div>
                        </div>

                        {form.items.map((item, idx) => {
                          const percentageStr = item.val || parseMasteryToPercentage(item.rating) || '0%';
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(140px, 2fr) minmax(130px, 1.4fr) minmax(110px, 1fr) 36px',
                                gap: '0.75rem',
                                alignItems: 'center',
                                background: 'var(--bg-surface)',
                                padding: '0.4rem 0.5rem',
                                borderRadius: 10,
                                border: '1px solid var(--border-color)',
                              }}
                            >
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                style={{ ...inputStyle, padding: '0.5rem 0.75rem' }}
                                placeholder="e.g. React.js"
                              />

                              <input
                                type="text"
                                value={item.rating}
                                onChange={(e) => handleItemChange(idx, 'rating', e.target.value)}
                                style={{ ...inputStyle, padding: '0.5rem 0.75rem' }}
                                placeholder="9.5 or 95%"
                              />

                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  gap: '0.2rem',
                                  padding: '0.35rem 0.5rem',
                                  background: 'var(--bg-primary)',
                                  borderRadius: 8,
                                  border: '1px solid var(--border-color)',
                                }}
                              >
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                  {percentageStr}
                                </span>
                                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: percentageStr,
                                      height: '100%',
                                      background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                                      borderRadius: 999,
                                      transition: 'width 0.25s ease-out',
                                    }}
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.35rem',
                                  borderRadius: 6,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Remove skill"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleAddItem('', '9.0')}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                          >
                            <Plus size={14} /> Add Skill
                          </button>
                        </div>
                      </div>
                    )}
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
                    Preview shows public skills card with progress bars.
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
                      {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Category'}
                    </button>
                  </div>
                </div>
              </form>

              {/* ── REAL-TIME SKILLS CARD PREVIEW (RIGHT SIDE) ─────────────── */}
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
                    <Eye size={13} /> Live Category Simulation
                  </div>

                  {/* Public Card Mockup */}
                  <div
                    className="glass-card"
                    style={{
                      padding: '1.75rem',
                      borderRadius: '16px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SelectedIcon size={20} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {form.category || 'Category Name'}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                      {activeSkillsList.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                          No skills added yet
                        </div>
                      ) : (
                        activeSkillsList.map((s, sIdx) => {
                          const pct = s.val || '80%';
                          return (
                            <div key={sIdx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {s.name || 'Skill Name'}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                                  {pct}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: '7px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  borderRadius: '9999px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: pct,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary, #06b6d4))',
                                    borderRadius: '9999px',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Card mirrors the public <code>/skills</code> view in real time.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILLS LIST VIEW                                                          */}
      {/* ========================================================================= */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading skills…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {skills.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                borderRadius: 14,
                border: '1px dashed var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              No skill categories created yet. Click &quot;New Category&quot; to get started.
            </div>
          ) : (
            skills.map((s) => {
              const ItemIcon = ICON_MAP[s.icon] || Layout;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.35rem',
                    borderRadius: 14,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(139, 92, 246, 0.12)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <ItemIcon size={18} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {s.category}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--accent-primary)',
                            background: 'rgba(139, 92, 246, 0.12)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {s.icon}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Order #{s.sortOrder ?? s.sort_order ?? 0}
                        </span>
                      </div>

                      {/* Pill badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {(s.items || []).map((item, iIdx) => (
                          <span
                            key={iIdx}
                            style={{
                              fontSize: '0.76rem',
                              padding: '0.18rem 0.5rem',
                              borderRadius: 6,
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                            <span
                              style={{
                                color: 'var(--accent-primary)',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {item.val || `${item.level || 0}%`}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <button
                      id={`edit-skill-${s.id}`}
                      onClick={() => handleEdit(s)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Pencil style={{ width: 14, height: 14 }} /> Edit
                    </button>

                    {deleteId === s.id ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleDelete(s.id)}
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
                        id={`delete-skill-${s.id}`}
                        onClick={() => setDeleteId(s.id)}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '0.45rem 0.65rem',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                        title="Delete category"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AdminSkills;
