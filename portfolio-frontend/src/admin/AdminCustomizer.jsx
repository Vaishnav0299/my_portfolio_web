import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  Check,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useConfig } from '../context/ConfigContext.jsx';

const SECTION_LABELS = [
  { key: 'hero', label: 'Hero / Headline & Pitch', desc: 'Main intro, quick stats & resume CTA' },
  { key: 'githubStrip', label: 'GitHub Activity Strip', desc: 'Realtime public repos, stars, commits & followers' },
  { key: 'about', label: 'About Me & Philosophy', desc: 'Bio summary & engineering philosophy cards' },
  { key: 'experience', label: 'Work Experience & Timeline', desc: 'Interactive career timeline with milestone details' },
  { key: 'projects', label: 'Featured Projects & Previews', desc: 'Full project showcase with filters and architecture breakdown' },
  { key: 'services', label: 'Services & Capabilities', desc: 'What I deliver: SaaS, RAG systems, Architecture audits' },
  { key: 'skills', label: 'Technical Skills Matrix', desc: 'Interactive grouped technical competencies and mastery' },
  { key: 'process', label: 'Engineering Process / Methodology', desc: '4-step methodology from discovery to observability' },
  { key: 'blog', label: 'Technical Writing & Blog', desc: 'Deep-dive articles and architecture teardowns' },
  { key: 'testimonials', label: 'Client Testimonials & Quotes', desc: 'Quotes, ratings, roles and client feedback' },
  { key: 'now', label: "What I'm Doing Now (/now)", desc: 'Current active projects, reading list and focus areas' },
  { key: 'uses', label: 'Hardware & Software Setup (/uses)', desc: 'Development environment, daily tools and gear' },
  { key: 'faq', label: 'Frequently Asked Questions (FAQ)', desc: 'Common questions on timelines, rates and IP ownership' },
  { key: 'contact', label: 'Contact & Project Inquiries Form', desc: 'Direct message submission form with status alerts' },
];

const COMPONENT_SUBCOMPONENTS = {
  hero: [
    { key: 'heroBadge', label: 'Status Pill / Badge', desc: 'Active availability pulse pill ("AVAILABLE FOR WORK")' },
    { key: 'heroTypewriter', label: 'Animated Typewriter Roles', desc: 'Rotating dynamic title text in headline' },
    { key: 'heroCta', label: 'Action Buttons / CTAs', desc: 'Primary & secondary buttons ("View Projects", "Get in Touch")' },
    { key: 'heroStats', label: 'Hero Metric Counters', desc: 'Key quick stats (Years exp, production apps, repos)' },
    { key: 'heroMarquee', label: 'Inline Tech Stack Strip', desc: 'Horizontal scrolling tech icons directly under hero' },
  ],
  githubStrip: [
    { key: 'githubStats', label: 'Live GitHub Metrics', desc: 'Public repos, stars, total contributions & followers' },
  ],
  about: [
    { key: 'aboutBioCard', label: 'Background & Bio Card', desc: 'Core developer profile, history and education overview' },
    { key: 'aboutPhilosophyCard', label: 'Engineering Philosophy Card', desc: 'Resilience, clean architecture and product mindset' },
  ],
  experience: [
    { key: 'timelineFilters', label: 'Segmented Filter Tabs', desc: 'All, Experience, and Education category selector' },
    { key: 'timelineAchievements', label: 'Milestone Achievement Bullets', desc: 'Checkmarked key accomplishments per role' },
    { key: 'timelineStackTags', label: 'Technology Stack Badges', desc: 'Skills and tooling chips used per role' },
  ],
  projects: [
    { key: 'projectsFilters', label: 'Category Filter Pills', desc: 'Filter projects by All, Full-Stack, AI, Systems' },
    { key: 'projectsMetrics', label: 'Project Metric Badges', desc: 'Latency, throughput, and scale metric callouts' },
    { key: 'projectsStack', label: 'Tech Stack Badges', desc: 'Frameworks and database tags on project cards' },
    { key: 'projectsLinks', label: 'Live Preview & Code Links', desc: 'Direct links to GitHub repo and production deployments' },
  ],
  services: [
    { key: 'servicesBullets', label: 'Service Deliverable Bullets', desc: 'Key capabilities checklist under each service offering' },
    { key: 'servicesCta', label: 'Consultation & Sprint Banner', desc: 'Bottom call-to-action banner ("Let\'s Build Together")' },
  ],
  skills: [
    { key: 'skillsCategoryIcons', label: 'Category Header Icons', desc: 'Icons for Frontend, Backend, Cloud & AI categories' },
    { key: 'skillsPercentageBars', label: 'Proficiency Bars & Percentages', desc: 'Visual progress fill bars and % badges per skill' },
  ],
  testimonials: [
    { key: 'testimonialsMarquee', label: 'Continuous Marquee Flow', desc: 'Animated auto-scrolling rail (switches to neat grid if OFF)' },
    { key: 'testimonialsStars', label: '5-Star Rating Badges', desc: 'Gold star rating indicators on recommendation cards' },
    { key: 'testimonialsAvatars', label: 'Client Avatar / Initials Badges', desc: 'Visual avatar icons beside recommender details' },
  ],
  contact: [
    { key: 'contactDirectInfo', label: 'Direct Channels & Info Card', desc: 'Email copy button, location badge, and turnaround notice' },
    { key: 'contactForm', label: 'Interactive Contact Form', desc: 'Role selector, name, email, and message input form' },
  ],
};

const EFFECT_LABELS = [
  { key: 'cursorSpotlight', label: 'Interactive Cursor Spotlight', desc: 'Smooth radial glow following cursor movement' },
  { key: 'scrollProgress', label: 'Scroll Progress Bar', desc: 'Top gradient bar tracking reading progress' },
  { key: 'marquee', label: 'Tech Stack Scrolling Marquee', desc: 'Dynamic ticker displaying tools and languages' },
  { key: 'backgroundGrid', label: 'Ambient Background Grid & Glows', desc: 'Cyberpunk grid pattern with diffused radial lighting' },
];

const ACCENT_OPTIONS = [
  { id: 'violet', label: 'Cyber Violet', hex: '#8b5cf6' },
  { id: 'cyan', label: 'Electric Cyan', hex: '#06b6d4' },
  { id: 'emerald', label: 'Matrix Emerald', hex: '#10b981' },
  { id: 'amber', label: 'Solar Amber', hex: '#f59e0b' },
  { id: 'rose', label: 'Neon Rose', hex: '#f43f5e' },
];

export function AdminCustomizer() {
  const { config, refreshConfig, updateConfigLocally } = useConfig();
  const [formData, setFormData] = useState(config);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    hero: true,
    projects: true,
    testimonials: true,
    experience: true,
  });

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const toggleSectionExpand = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleComponent = (key) => {
    setFormData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: !prev.components?.[key],
      },
    }));
  };

  const toggleSubcomponent = (subKey) => {
    setFormData((prev) => ({
      ...prev,
      subcomponents: {
        ...prev.subcomponents,
        [subKey]: prev.subcomponents?.[subKey] === false ? true : false,
      },
    }));
  };

  const setAllComponents = (enable) => {
    const updated = {};
    SECTION_LABELS.forEach(({ key }) => {
      updated[key] = enable;
    });
    setFormData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        ...updated,
      },
    }));
  };

  const setAllSubcomponents = (compKey, enable) => {
    const subs = COMPONENT_SUBCOMPONENTS[compKey] || [];
    const updatedSubs = {};
    subs.forEach(({ key }) => {
      updatedSubs[key] = enable;
    });
    setFormData((prev) => ({
      ...prev,
      subcomponents: {
        ...prev.subcomponents,
        ...updatedSubs,
      },
    }));
  };

  const toggleEffect = (key) => {
    setFormData((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        [key]: !prev.effects?.[key],
      },
    }));
  };

  const handleAccentChange = (accent) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        accentColor: accent,
      },
    }));
  };

  const handleOpenToWorkText = (text) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        openToWorkText: text,
      },
    }));
  };

  const toggleOpenToWorkStatus = () => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        openToWorkStatus: !prev.theme?.openToWorkStatus,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await api.updateConfig(formData);
      updateConfigLocally(formData);
      await refreshConfig();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Filter components based on search query
  const filteredComponents = SECTION_LABELS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesParent =
      item.label.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query);

    const subs = COMPONENT_SUBCOMPONENTS[item.key] || [];
    const matchesSub = subs.some(
      (s) =>
        s.label.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query)
    );

    return matchesParent || matchesSub;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              margin: 0,
            }}
          >
            <Sliders style={{ color: 'var(--accent-primary)', width: 28, height: 28 }} />
            Site Customizer & Component Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Toggle top-level sections or granular subcomponents on &amp; off instantly with real-time preview sync.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent-gradient, linear-gradient(135deg, #8b5cf6, #06b6d4))',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.75rem 1.6rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? (
              <>
                <RefreshCw style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check style={{ width: 18, height: 18 }} /> Saved Live!
              </>
            ) : (
              <>
                <Save style={{ width: 18, height: 18 }} /> Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem 1.2rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div
          style={{
            padding: '0.85rem 1.2rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 8,
            color: '#10b981',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check style={{ width: 16, height: 16 }} /> Configuration successfully updated and synced across the live site!
        </div>
      )}

      {/* Search & Bulk Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          padding: '0.75rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 300px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search component or subcomponent (e.g. hero, stars, filters)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setAllComponents(true)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <CheckCircle2 size={14} /> Enable All
          </button>
          <button
            type="button"
            onClick={() => setAllComponents(false)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <XCircle size={14} /> Disable All
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.75rem' }}>
        {/* Left Column: Hierarchical Component & Subcomponent Manager */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
              Components &amp; Subcomponents
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredComponents.length} sections
            </span>
          </div>

          {filteredComponents.map(({ key, label, desc }) => {
            const isComponentOn = formData.components?.[key] !== false;
            const subcomponents = COMPONENT_SUBCOMPONENTS[key] || [];
            const hasSubcomponents = subcomponents.length > 0;
            const isExpanded = !!expandedSections[key];

            // Count active subcomponents
            const activeSubsCount = subcomponents.filter(
              (s) => formData.subcomponents?.[s.key] !== false
            ).length;

            return (
              <div
                key={key}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isComponentOn ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-color)'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Parent Component Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: isComponentOn
                      ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)'
                      : 'var(--bg-surface)',
                  }}
                >
                  {/* Left info & accordion trigger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, paddingRight: '1rem' }}>
                    {hasSubcomponents && (
                      <button
                        type="button"
                        onClick={() => toggleSectionExpand(key)}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        title={isExpanded ? 'Collapse subcomponents' : 'Expand subcomponents'}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.98rem',
                            color: isComponentOn ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {label}
                        </span>

                        {hasSubcomponents && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 12,
                              background: isComponentOn ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: isComponentOn ? 'var(--accent-primary)' : 'var(--text-muted)',
                              fontWeight: 600,
                            }}
                          >
                            {activeSubsCount}/{subcomponents.length} Subcomponents ON
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {desc}
                      </div>
                    </div>
                  </div>

                  {/* Master Component Switch */}
                  <div
                    onClick={() => toggleComponent(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    title={isComponentOn ? 'Turn component OFF' : 'Turn component ON'}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isComponentOn ? 'var(--accent-primary)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {isComponentOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      style={{
                        width: 46,
                        height: 24,
                        borderRadius: 12,
                        background: isComponentOn ? 'var(--accent-primary)' : '#4b5563',
                        position: 'relative',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          top: 3,
                          left: isComponentOn ? 25 : 3,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subcomponents Accordion Panel */}
                {hasSubcomponents && isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '0.85rem 1.25rem 1rem 2.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    {/* Header bar inside subcomponents */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span>Granular Internal Elements:</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setAllSubcomponents(key, true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Enable All
                        </button>
                        <span>&middot;</span>
                        <button
                          type="button"
                          onClick={() => setAllSubcomponents(key, false)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    {!isComponentOn && (
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 6,
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: '#f59e0b',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <HelpCircle size={14} />
                        Parent component is currently OFF. Turn it ON above to render these elements.
                      </div>
                    )}

                    {subcomponents.map((sub) => {
                      const isSubOn = formData.subcomponents?.[sub.key] !== false;
                      return (
                        <div
                          key={sub.key}
                          onClick={() => toggleSubcomponent(sub.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            borderRadius: 8,
                            background: isSubOn ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                            border: `1px solid ${isSubOn ? 'rgba(139, 92, 246, 0.2)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ paddingRight: '0.75rem' }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                color: isSubOn ? 'var(--text-primary)' : 'var(--text-muted)',
                              }}
                            >
                              {sub.label}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              {sub.desc}
                            </div>
                          </div>

                          <div
                            style={{
                              width: 38,
                              height: 20,
                              borderRadius: 10,
                              background: isSubOn ? 'var(--accent-primary)' : '#4b5563',
                              position: 'relative',
                              flexShrink: 0,
                              transition: 'background 0.2s',
                              opacity: isComponentOn ? 1 : 0.6,
                            }}
                          >
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: 3,
                                left: isSubOn ? 21 : 3,
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

        {/* Right Column: Visual Effects & Theme Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Visual Effects */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
              }}
            >
              <Sparkles style={{ width: 20, height: 20, color: '#f59e0b' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Visual & Ambient Effects
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {EFFECT_LABELS.map(({ key, label, desc }) => {
                const isEnabled = formData.effects?.[key] !== false;
                return (
                  <div
                    key={key}
                    onClick={() => toggleEffect(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 8,
                      background: isEnabled ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-primary)',
                      border: `1px solid ${isEnabled ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ paddingRight: '1rem' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {desc}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: isEnabled ? '#f59e0b' : '#4b5563',
                        position: 'relative',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          top: 3,
                          left: isEnabled ? 23 : 3,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme & Palette */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
              }}
            >
              <Palette style={{ width: 20, height: 20, color: '#06b6d4' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Theme & Accent
              </h2>
            </div>

            {/* Accent selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.6rem',
                }}
              >
                Primary Accent Color
              </label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {ACCENT_OPTIONS.map(({ id, label, hex }) => {
                  const isSelected = formData.theme?.accentColor === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleAccentChange(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: 8,
                        background: isSelected ? 'rgba(255,255,255,0.08)' : 'var(--bg-primary)',
                        border: `2px solid ${isSelected ? hex : 'var(--border-color)'}`,
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: hex,
                          display: 'inline-block',
                        }}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Banner Config */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Availability Status Pill
                </label>
                <button
                  type="button"
                  onClick={toggleOpenToWorkStatus}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: formData.theme?.openToWorkStatus ? '#10b981' : '#6b7280',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {formData.theme?.openToWorkStatus ? '● Active' : '○ Hidden'}
                </button>
              </div>

              <input
                type="text"
                value={formData.theme?.openToWorkText || ''}
                onChange={(e) => handleOpenToWorkText(e.target.value)}
                placeholder="e.g. Open to Work · Full-Time & Contracts"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCustomizer;
