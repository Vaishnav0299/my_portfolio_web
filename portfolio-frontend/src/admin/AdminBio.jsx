import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Save, Check, AlertCircle, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

const FormContext = createContext({ form: {}, handleFieldChange: () => {} });

const inputStyle = { width: '100%', padding: '0.7rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };
const sectionHeadStyle = { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' };

function Field({ label, fieldKey, type = 'text', full = false, textarea = false, rows = 3, placeholder = '', helpText = '' }) {
  const { form, handleFieldChange } = useContext(FormContext);
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          value={form[fieldKey] ?? ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          value={form[fieldKey] ?? ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
      {helpText && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', opacity: 0.8 }}>{helpText}</p>}
    </div>
  );
}

export function AdminBio() {
  const [form, setForm] = useState({
    name: '', title: '', education: '', location: '', email: '',
    github: '', linkedin: '', twitter: '', website: '',
    resumeUrl: '', avatarUrl: '',
    bio: '', interests: '', currentFocus: '',
    // Hero customization
    headlinePrefix: '',
    heroDescription: '',
    typewriterPhrases: '',
    footerTagline: '',
    // Stats
    stats: [
      { label: 'Years of Experience', value: '5+' },
      { label: 'Projects Shipped', value: '30+' },
      { label: 'Happy Clients', value: '20+' },
      { label: 'Production Uptime', value: '99.9%' },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  const loadBio = () => {
    setLoading(true);
    api.getBio()
      .then(res => setForm({
        ...res.data,
        interests: Array.isArray(res.data.interests) ? res.data.interests.join('\n') : (res.data.interests ?? ''),
        typewriterPhrases: Array.isArray(res.data.typewriterPhrases) ? res.data.typewriterPhrases.join('\n') : (res.data.typewriterPhrases ?? ''),
        stats: Array.isArray(res.data.stats) && res.data.stats.length > 0
          ? res.data.stats
          : [
              { label: 'Years of Experience', value: '5+' },
              { label: 'Projects Shipped', value: '30+' },
              { label: 'Happy Clients', value: '20+' },
              { label: 'Production Uptime', value: '99.9%' },
            ],
        headlinePrefix: res.data.headlinePrefix ?? '',
        heroDescription: res.data.heroDescription ?? '',
        footerTagline: res.data.footerTagline ?? '',
        twitter: res.data.twitter ?? '',
        website: res.data.website ?? '',
      }))
      .catch(() => setError('Failed to load bio'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBio();
    const handleDbSynced = () => loadBio();
    window.addEventListener('db-synced', handleDbSynced);
    return () => window.removeEventListener('db-synced', handleDbSynced);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      interests: typeof form.interests === 'string' ? form.interests.split('\n').filter(Boolean) : form.interests,
      typewriterPhrases: typeof form.typewriterPhrases === 'string' ? form.typewriterPhrases.split('\n').filter(Boolean) : form.typewriterPhrases,
      stats: form.stats.filter(s => s.label.trim() && s.value.trim()),
    };

    try {
      await api.updateBio(payload);
      showToast('Bio & site content updated successfully');
      // Dispatch db-synced event so all components re-fetch
      window.dispatchEvent(new Event('db-synced'));
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = useCallback((fieldKey, value) => {
    setForm(f => ({ ...f, [fieldKey]: value }));
  }, []);

  // Stats management
  const addStat = () => {
    setForm(f => ({ ...f, stats: [...f.stats, { label: '', value: '' }] }));
  };

  const removeStat = (idx) => {
    setForm(f => ({ ...f, stats: f.stats.filter((_, i) => i !== idx) }));
  };

  const updateStat = (idx, key, val) => {
    setForm(f => ({
      ...f,
      stats: f.stats.map((s, i) => i === idx ? { ...s, [key]: val } : s),
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'hero', label: 'Hero Content' },
    { id: 'social', label: 'Social Links' },
    { id: 'stats', label: 'Hero Stats' },
  ];

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading bio…</p>;

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Bio & Site Content</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          Edit your personal info, hero content, social links, and statistics — all changes reflect on the live site immediately.
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--bg-surface)', borderRadius: 12, padding: '0.3rem', border: '1px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FormContext.Provider value={{ form, handleFieldChange }}>
      <form onSubmit={handleSubmit}>
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ ...sectionHeadStyle, gridColumn: '1 / -1' }}>Personal Information</div>
            <Field label="Full Name *"    fieldKey="name" />
            <Field label="Title *"        fieldKey="title" placeholder="Full-Stack Developer & AI Systems Engineer" />
            <Field label="Education *"    fieldKey="education" />
            <Field label="Location *"     fieldKey="location" placeholder="Pune, India (Open to Remote Worldwide)" helpText="Shown in Hero pill, About card, and Contact section" />
            <Field label="Email *"        fieldKey="email" type="email" helpText="Used for Contact copy button, mailto links, and footer" />
            <Field label="Resume URL"     fieldKey="resumeUrl" placeholder="/resume.pdf" />
            <Field label="Avatar URL"     fieldKey="avatarUrl" full />
            <Field label="Bio Text *"     fieldKey="bio" full textarea rows={4} helpText="Main bio paragraph shown on the About page" />
            <Field label="Current Focus"  fieldKey="currentFocus" full textarea rows={3} />
            <Field
              label="Interests (one per line)"
              fieldKey="interests" full textarea rows={4}
              placeholder={"Full-Stack Web Development\nArtificial Intelligence"}
            />
          </div>
        )}

        {/* Hero Content Tab */}
        {activeTab === 'hero' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ ...sectionHeadStyle, gridColumn: '1 / -1' }}>Hero Section Content</div>
            <Field
              label="Hero Headline"
              fieldKey="headlinePrefix"
              full
              placeholder="Crafting Systems & Software"
              helpText='The main title displayed on your hero section (e.g. "Crafting Systems & Software")'
            />
            <Field
              label="Hero Description"
              fieldKey="heroDescription"
              full textarea rows={4}
              placeholder="Senior Full-Stack Developer specializing in..."
              helpText="The narrative paragraph under the hero title. Falls back to your main Bio text if empty."
            />
            <Field
              label="Typewriter Phrases (one per line)"
              fieldKey="typewriterPhrases"
              full textarea rows={5}
              placeholder={"building scalable web applications.\ndesigning resilient backend systems.\ncrafting pixel-perfect interactive UIs."}
              helpText="These phrases rotate with a typing animation in the hero section"
            />
            <Field
              label="Footer Tagline"
              fieldKey="footerTagline"
              full
              placeholder="Leave blank for auto-generated: Crafted by [Name]. [Title] based in [Location]."
              helpText="Custom one-liner for the footer. If blank, auto-generates from your name, title, and location."
            />
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ ...sectionHeadStyle, gridColumn: '1 / -1' }}>Social Media & Links</div>
            <Field label="GitHub URL *"    fieldKey="github" placeholder="https://github.com/username" helpText="Used in Hero strip, About, Contact, and Footer" />
            <Field label="LinkedIn URL *"  fieldKey="linkedin" placeholder="https://linkedin.com/in/username" />
            <Field label="Twitter / X URL" fieldKey="twitter" placeholder="https://twitter.com/username" helpText="Leave blank to hide Twitter links across the site" />
            <Field label="Website URL"     fieldKey="website" placeholder="https://yoursite.com" />
            <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span>These links automatically update across all pages: Hero GitHub strip, About card, Contact direct channels, and the Footer social row.</span>
            </div>
          </div>
        )}

        {/* Hero Stats Tab */}
        {activeTab === 'stats' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={sectionHeadStyle}>Hero Metrics Strip</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              These stats appear in the horizontal metrics card on the hero section. Drag to reorder, add or remove as needed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.stats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <GripVertical size={16} style={{ color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={e => updateStat(idx, 'value', e.target.value)}
                      placeholder="5+"
                      style={{ ...inputStyle, fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={e => updateStat(idx, 'label', e.target.value)}
                      placeholder="Years of Experience"
                      style={inputStyle}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#ef4444', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addStat}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.6rem', borderRadius: 10,
                  border: '1px dashed var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                <Plus size={14} /> Add Stat
              </button>
            </div>
          </div>
        )}

        {/* Save Button — always visible */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button
            id="admin-save-bio-btn"
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem' }}
          >
            <Save style={{ width: 16, height: 16 }} />
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </form>
      </FormContext.Provider>
    </div>
  );
}
