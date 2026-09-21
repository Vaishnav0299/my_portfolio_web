import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext.jsx';
import { api } from '../lib/api.js';

const SECTIONS = [
  { key: 'hero', label: 'Hero / Headline', desc: 'Main headline, bio summary & resume CTA' },
  { key: 'githubStrip', label: 'GitHub Activity Strip', desc: 'Realtime repos, stars, commits & followers' },
  { key: 'about', label: 'About & Philosophy', desc: 'Bio details & philosophy cards' },
  { key: 'experience', label: 'Career & Timeline', desc: 'Experience and education milestones' },
  { key: 'projects', label: 'Projects Showcase', desc: 'Featured projects with filters & links' },
  { key: 'services', label: 'Services & Capabilities', desc: 'Full-stack development, APIs, modernization' },
  { key: 'skills', label: 'Skills Matrix', desc: 'Grouped technical competencies' },
  { key: 'process', label: 'Engineering Process', desc: 'Methodology from discovery to deployment' },
  { key: 'blog', label: 'Articles & Blog', desc: 'Technical write-ups and teardowns' },
  { key: 'testimonials', label: 'Testimonials & Reviews', desc: 'Recommendations and client feedback' },
  { key: 'now', label: "What I'm Doing Now (/now)", desc: 'Current active projects & reading list' },
  { key: 'uses', label: 'Setup & Tools (/uses)', desc: 'Hardware, software, dev environment' },
  { key: 'faq', label: 'FAQ', desc: 'Common questions on timelines, rates & IP' },
  { key: 'contact', label: 'Contact Form & Channels', desc: 'Direct email info & inquiry form' },
];

const SUBCOMPONENTS = {
  hero: [
    { key: 'heroBadge', label: 'Status Pill ("Available for Work")' },
    { key: 'heroTypewriter', label: 'Rotating Animated Roles' },
    { key: 'heroCta', label: 'Action Buttons (Projects / Contact)' },
    { key: 'heroMarquee', label: 'Inline Tech Stack Strip' },
  ],
  githubStrip: [
    { key: 'githubStats', label: 'Live Metrics (Repos, Stars, Commits)' },
  ],
  about: [
    { key: 'aboutBioCard', label: 'Bio & Background Card' },
    { key: 'aboutPhilosophyCard', label: 'Philosophy Card' },
  ],
  experience: [
    { key: 'timelineFilters', label: 'Filter Tabs (All / Roles / Edu)' },
    { key: 'timelineAchievements', label: 'Key Achievement Bullets' },
    { key: 'timelineStackTags', label: 'Stack Tags & Chips' },
  ],
  projects: [
    { key: 'projectsFilters', label: 'Category Filter Tabs' },
    { key: 'projectsMetrics', label: 'Metrics Badges (scale, latency)' },
    { key: 'projectsStack', label: 'Technology Badges' },
    { key: 'projectsLinks', label: 'Live Preview & Code Buttons' },
  ],
  services: [
    { key: 'servicesBullets', label: 'Service Deliverable Bullets' },
    { key: 'servicesCta', label: 'Sprint Consultation Banner' },
  ],
  skills: [
    { key: 'skillsCategoryIcons', label: 'Category Header Icons' },
    { key: 'skillsPercentageBars', label: 'Proficiency Bars & Percentages' },
  ],
  testimonials: [
    { key: 'testimonialsMarquee', label: 'Auto-scrolling Marquee' },
    { key: 'testimonialsStars', label: '5-Star Rating Indicators' },
    { key: 'testimonialsAvatars', label: 'Avatar / Initials Badges' },
  ],
  contact: [
    { key: 'contactDirectInfo', label: 'Direct Channels & Location Card' },
    { key: 'contactForm', label: 'Message Submission Form' },
  ],
};

export function QuickComponentSwitcher() {
  const { config, updateConfigLocally, refreshConfig } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  // Check if admin is currently logged in
  const [isAdmin, setIsAdmin] = useState(() => {
    return !!(
      localStorage.getItem('portfolio_admin_token') ||
      localStorage.getItem('admin_token')
    );
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(
        !!(
          localStorage.getItem('portfolio_admin_token') ||
          localStorage.getItem('admin_token')
        )
      );
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const toggleParent = async (key) => {
    const current = config.components?.[key] !== false;
    const updated = {
      ...config,
      components: {
        ...config.components,
        [key]: !current,
      },
    };
    updateConfigLocally(updated);
    try {
      await api.updateConfig(updated);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    } catch {
      // Local preview updated regardless
    }
  };

  const toggleSub = async (subKey) => {
    const current = config.subcomponents?.[subKey] !== false;
    const updated = {
      ...config,
      subcomponents: {
        ...config.subcomponents,
        [subKey]: !current,
      },
    };
    updateConfigLocally(updated);
    try {
      await api.updateConfig(updated);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    } catch {
      // Local preview updated regardless
    }
  };

  const toggleAll = async (enable) => {
    const newComps = {};
    SECTIONS.forEach((s) => {
      newComps[s.key] = enable;
    });
    const updated = {
      ...config,
      components: {
        ...config.components,
        ...newComps,
      },
    };
    updateConfigLocally(updated);
    try {
      await api.updateConfig(updated);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    } catch {}
  };

  const toggleAccordion = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = SECTIONS.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchesComp = s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q);
    const subs = SUBCOMPONENTS[s.key] || [];
    const matchesSubs = subs.some((sub) => sub.label.toLowerCase().includes(q) || sub.key.toLowerCase().includes(q));
    return matchesComp || matchesSubs;
  });

  // Only visible to logged-in Admin
  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(17, 24, 39, 0.85)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '30px',
          padding: '0.5rem 0.95rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
        title="Quick On/Off Component & Subcomponent Switcher"
      >
        <Sliders size={15} style={{ color: 'var(--accent-primary)' }} />
        <span>Component Toggles</span>
        {savedBadge && (
          <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem' }}>
            <Check size={12} /> Synced
          </span>
        )}
      </button>

      {/* Slide-out Drawer Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-start',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '430px',
              height: '100%',
              background: 'var(--bg-main, #0f172a)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
              animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowX: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-surface)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Live Component Toggles
                  </h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Turn components and sub-parts on or off live
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions & Search */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-surface)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                }}
              >
                <Search size={15} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter elements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Actions:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleAll(true)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 6,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    All ON
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAll(false)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    All OFF
                  </button>
                </div>
              </div>
            </div>

            {/* List of Components & Subcomponents */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              {filtered.map((sec) => {
                const isCompOn = config.components?.[sec.key] !== false;
                const subs = SUBCOMPONENTS[sec.key] || [];
                const hasSubs = subs.length > 0;
                const isExp = !!expanded[sec.key];

                return (
                  <div
                    key={sec.key}
                    style={{
                      flexShrink: 0,
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isCompOn ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-color)'}`,
                      borderRadius: 10,
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    {/* Top Row: Parent Switch */}
                    <div
                      style={{
                        padding: '0.75rem 0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0 }}>
                        {/* Reserved chevron/bullet slot for uniform text alignment */}
                        <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {hasSubs ? (
                            <button
                              type="button"
                              onClick={() => toggleAccordion(sec.key)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                              }}
                              title={isExp ? 'Collapse sub-parts' : 'Expand sub-parts'}
                            >
                              {isExp ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </button>
                          ) : (
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.5, display: 'inline-block' }} />
                          )}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: isCompOn ? 'var(--text-primary)' : 'var(--text-muted)',
                              lineHeight: 1.3,
                            }}
                          >
                            {sec.label}
                          </div>
                          {hasSubs ? (
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: isCompOn ? 'var(--accent-primary)' : 'var(--text-muted)',
                                marginTop: '0.2rem',
                                lineHeight: 1.2,
                                fontWeight: 500,
                              }}
                            >
                              {subs.filter((s) => config.subcomponents?.[s.key] !== false).length} of {subs.length} sub-parts ON
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.15rem',
                                lineHeight: 1.2,
                              }}
                            >
                              {sec.desc}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Parent Switch Toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isCompOn}
                        onClick={() => toggleParent(sec.key)}
                        style={{
                          width: 42,
                          height: 22,
                          borderRadius: 12,
                          background: isCompOn ? 'var(--accent-primary)' : '#4b5563',
                          position: 'relative',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: 'none',
                          padding: 0,
                          transition: 'background 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: 3,
                            left: isCompOn ? 23 : 3,
                            transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                            display: 'block',
                          }}
                        />
                      </button>
                    </div>

                    {/* Subcomponents Tray */}
                    {hasSubs && isExp && (
                      <div
                        style={{
                          borderTop: '1px solid var(--border-color)',
                          background: 'rgba(139, 92, 246, 0.04)',
                          padding: '0.65rem 1rem 0.65rem 2.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                          borderRadius: '0 0 10px 10px',
                        }}
                      >
                        {subs.map((sub) => {
                          const isSubOn = config.subcomponents?.[sub.key] !== false;
                          return (
                            <div
                              key={sub.key}
                              onClick={() => toggleSub(sub.key)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                padding: '0.2rem 0',
                                gap: '0.5rem',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  color: isSubOn && isCompOn ? 'var(--text-primary)' : 'var(--text-muted)',
                                  fontWeight: isSubOn ? 500 : 400,
                                }}
                              >
                                {sub.label}
                              </span>

                              <div
                                style={{
                                  width: 32,
                                  height: 18,
                                  borderRadius: 9,
                                  background: isSubOn ? 'var(--accent-primary)' : '#4b5563',
                                  position: 'relative',
                                  flexShrink: 0,
                                  opacity: isCompOn ? 1 : 0.4,
                                  transition: 'background 0.2s',
                                }}
                              >
                                <div
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: '#fff',
                                    position: 'absolute',
                                    top: 3,
                                    left: isSubOn ? 17 : 3,
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              <span>Changes apply live immediately</span>
              <Link
                to="/admin/customizer"
                onClick={() => setIsOpen(false)}
                style={{
                  color: 'var(--accent-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                Full Studio &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickComponentSwitcher;
