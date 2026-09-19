import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Mail,
  BookOpen,
  Wrench,
  MessageSquare,
  Clock,
  GitFork,
  Zap,
  Check,
  ExternalLink,
  Plus,
  Sliders,
  RefreshCw,
  Compass,
  User,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Star,
  Activity,
  Sparkles,
  Layers,
  Settings,
  AlertCircle,
  Eye,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { getPendingCount } from '../lib/syncManager';
import { useConfig } from '../context/ConfigContext.jsx';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { config, updateConfigLocally } = useConfig();

  // Primary data states
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [skills, setSkills] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [blog, setBlog] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [messages, setMessages] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Telemetry & sync
  const [pendingSync, setPendingSync] = useState(0);
  const [health, setHealth] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingDb, setSyncingDb] = useState(false);
  const [togglingKey, setTogglingKey] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        projRes,
        servRes,
        skillRes,
        timeRes,
        blogRes,
        testRes,
        msgRes,
        faqRes,
        healthRes,
      ] = await Promise.all([
        api.getProjects().catch(() => ({ data: [] })),
        api.getServices().catch(() => ({ data: [] })),
        api.getSkills().catch(() => ({ data: [] })),
        api.getTimeline().catch(() => ({ data: [] })),
        api.getBlogPosts().catch(() => ({ data: [] })),
        api.getTestimonials().catch(() => ({ data: [] })),
        api.getMessages().catch(() => ({ data: [] })),
        api.getFaqs().catch(() => ({ data: [] })),
        api.health().catch(() => null),
      ]);

      setProjects(projRes.data || []);
      setServices(servRes.data || []);
      setSkills(skillRes.data || []);
      setTimeline(timeRes.data || []);
      setBlog(blogRes.data || []);
      setTestimonials(testRes.data || []);
      setMessages(msgRes.data || []);
      setFaqs(faqRes.data || []);
      if (healthRes) setHealth(healthRes);

      const pending = await getPendingCount().catch(() => 0);
      setPendingSync(pending);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    const handleSyncChange = () => {
      getPendingCount().then(setPendingSync).catch(() => {});
    };
    window.addEventListener('sync-queue-change', handleSyncChange);
    window.addEventListener('db-synced', fetchAllData);

    return () => {
      window.removeEventListener('sync-queue-change', handleSyncChange);
      window.removeEventListener('db-synced', fetchAllData);
    };
  }, [fetchAllData]);

  const handleManualSync = async () => {
    setSyncingDb(true);
    try {
      await api.syncDb();
      showToast('Database & cache synchronized successfully');
      await fetchAllData();
    } catch (err) {
      showToast(err.message || 'Sync failed');
    } finally {
      setSyncingDb(false);
    }
  };

  const handleToggleComponent = async (key) => {
    setTogglingKey(key);
    const isCurrentlyOn = config?.components?.[key] !== false;
    const nextVal = !isCurrentlyOn;
    updateConfigLocally({ components: { [key]: nextVal } });
    try {
      await api.updateConfig({ components: { [key]: nextVal } });
      showToast(`"${key}" section is now ${nextVal ? 'enabled' : 'hidden'}`);
    } catch {
      updateConfigLocally({ components: { [key]: isCurrentlyOn } });
      showToast(`Could not update "${key}" section`);
    } finally {
      setTogglingKey(null);
    }
  };

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Total skills counter
  const totalSkillItems = skills.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

  // Quick stats array
  const kpis = [
    {
      label: 'Projects',
      value: projects.length,
      detail: `${projects.filter((p) => p.category === 'fullstack').length} Fullstack · ${projects.filter((p) => p.category === 'ai').length} AI`,
      icon: Package,
      color: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.12)',
      path: '/admin/projects',
    },
    {
      label: 'Contact Inquiries',
      value: messages.length,
      detail: messages.length > 0 ? `${messages.length} messages received` : 'Inbox clear',
      icon: Mail,
      color: '#06b6d4',
      bgLight: 'rgba(6, 182, 212, 0.12)',
      path: '/admin/messages',
    },
    {
      label: 'Engineering Blog',
      value: blog.length,
      detail: 'Published teardowns & guides',
      icon: BookOpen,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      path: '/admin/blog',
    },
    {
      label: 'Skills Matrix',
      value: totalSkillItems || skills.length,
      detail: `${skills.length} categories configured`,
      icon: Wrench,
      color: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.12)',
      path: '/admin/skills',
    },
    {
      label: 'Testimonials',
      value: testimonials.length,
      detail: 'Client endorsements',
      icon: MessageSquare,
      color: '#ec4899',
      bgLight: 'rgba(236, 72, 153, 0.12)',
      path: '/admin/testimonials',
    },
    {
      label: 'System & Sync',
      value: pendingSync === 0 ? 'All Synced' : `${pendingSync} Queued`,
      detail: health?.latencyMs ? `Supabase · ${health.latencyMs}ms` : 'Operational',
      icon: GitFork,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      path: '/admin/customizer',
    },
  ];

  // Quick feature toggles config
  const toggleFeatures = [
    { key: 'blog', label: 'Tech Blog' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'now', label: 'What I\'m Doing Now' },
    { key: 'uses', label: 'Developer Uses' },
    { key: 'faq', label: 'FAQs' },
    { key: 'githubStrip', label: 'GitHub Strip' },
  ];

  // All 10 CMS modules directory
  const cmsModules = [
    {
      title: 'Site Customizer',
      desc: 'Toggle components, tweak theme accents, hero typewriter, and visual effects.',
      icon: Sliders,
      path: '/admin/customizer',
      badge: 'Visual Editor',
      color: '#8b5cf6',
    },
    {
      title: 'Projects Showcase',
      desc: 'Manage case studies, live links, github repos, architecture notes and metrics.',
      icon: Package,
      path: '/admin/projects',
      badge: `${projects.length} Projects`,
      color: '#3b82f6',
    },
    {
      title: 'Services & Offerings',
      desc: 'Customize commercial services, pricing deliverables, and scope packages.',
      icon: Briefcase,
      path: '/admin/services',
      badge: `${services.length} Packages`,
      color: '#10b981',
    },
    {
      title: 'Skills Matrix',
      desc: 'Manage frontend, backend, databases, and DevOps competencies with levels.',
      icon: Wrench,
      path: '/admin/skills',
      badge: `${skills.length} Categories`,
      color: '#06b6d4',
    },
    {
      title: 'Career Timeline',
      desc: 'Curate work experiences, leadership roles, education, and achievements.',
      icon: Clock,
      path: '/admin/timeline',
      badge: `${timeline.length} Milestones`,
      color: '#f59e0b',
    },
    {
      title: 'Technical Blog',
      desc: 'Author in-depth software engineering articles, CRDT deep dives, and tutorials.',
      icon: BookOpen,
      path: '/admin/blog',
      badge: `${blog.length} Posts`,
      color: '#ec4899',
    },
    {
      title: 'Client Testimonials',
      desc: 'Client quotes, avatar initials, roles, ratings, and recommendations.',
      icon: MessageSquare,
      path: '/admin/testimonials',
      badge: `${testimonials.length} Quotes`,
      color: '#a855f7',
    },
    {
      title: 'Frequently Asked Questions',
      desc: 'Update project timeline FAQs, rate structures, and IP ownership answers.',
      icon: HelpCircle,
      path: '/admin/faq',
      badge: `${faqs.length} FAQs`,
      color: '#6366f1',
    },
    {
      title: 'Now & Uses',
      desc: 'Manage personal live focus (/now) and hardware/software setup (/uses).',
      icon: Compass,
      path: '/admin/now-uses',
      badge: 'Live Pulse',
      color: '#14b8a6',
    },
    {
      title: 'Bio & Profile Info',
      desc: 'Update headline, about me text, resume link, contact email, and social profiles.',
      icon: User,
      path: '/admin/bio',
      badge: 'Public Profile',
      color: '#f43f5e',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            padding: '0.85rem 1.25rem',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 style={{ width: 18, height: 18, color: '#10b981' }} />
          {toast}
        </div>
      )}

      {/* ── Welcome & Command Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '0.2rem 0.65rem',
                borderRadius: 20,
              }}
            >
              Control Center
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Last synced: {lastChecked || 'just now'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {greeting}, Vaishnav
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem', margin: 0 }}>
            Real-time telemetry, CMS content management, and dynamic site customizer.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAllData}
            disabled={loading}
            title="Refresh statistics"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>

          <button
            onClick={handleManualSync}
            disabled={syncingDb}
            title="Force Supabase & Cache sync"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Database style={{ width: 14, height: 14, color: '#10b981' }} />
            {syncingDb ? 'Syncing...' : 'Sync DB'}
          </button>

          <Link
            to="/admin/customizer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders style={{ width: 14, height: 14, color: 'var(--accent-primary)' }} />
            Customizer
          </Link>

          <Link
            to="/admin/projects"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.15rem',
              borderRadius: 10,
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            New Project
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 10,
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Eye style={{ width: 14, height: 14 }} />
            Preview Site
          </a>
        </div>
      </div>

      {/* ── Metric KPI Cards Matrix ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.15rem',
          marginBottom: '2rem',
        }}
      >
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '1.25rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'var(--card-shadow)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: item.bgLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ width: 20, height: 20, color: item.color }} />
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {item.detail}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Feature Toggles Strip ── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Live Section Visibility Toggles
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Turn sections ON/OFF on the public site instantly)
            </span>
          </div>

          <Link
            to="/admin/customizer"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Full Customizer & Themes <ArrowRight style={{ width: 13, height: 13 }} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {toggleFeatures.map(({ key, label }) => {
            const isEnabled = config?.components?.[key] !== false;
            const isToggling = togglingKey === key;
            return (
              <button
                key={key}
                onClick={() => handleToggleComponent(key)}
                disabled={isToggling}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 10,
                  background: isEnabled ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-main)',
                  border: `1px solid ${isEnabled ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 6,
                    background: isEnabled ? '#10b981' : 'var(--border-color)',
                    color: isEnabled ? '#fff' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {isEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two Column Work Area: Featured Projects & Recent Inquiries ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Left Column: Projects Showcase Preview */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Featured Projects
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Top projects currently showcasing in your portfolio
              </span>
            </div>

            <Link
              to="/admin/projects"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Manage <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 12,
                        background: 'rgba(139, 92, 246, 0.12)',
                        color: 'var(--accent-primary)',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      {p.category}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {Array.isArray(p.stack) ? p.stack.slice(0, 4).join(' · ') : p.desc}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#10b981',
                      fontWeight: 600,
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 6,
                    }}
                  >
                    {p.status || 'Active'}
                  </span>
                  <Link
                    to="/admin/projects"
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 6,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/admin/projects"
              style={{
                fontSize: '0.82rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View all {projects.length} projects in portfolio →
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Contact Messages */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Recent Inquiries
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Messages submitted via the contact form
              </span>
            </div>

            <Link
              to="/admin/messages"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Inbox ({messages.length}) <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {messages.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  background: 'var(--bg-main)',
                  borderRadius: 12,
                  border: '1px dashed var(--border-color)',
                }}
              >
                <Mail style={{ width: 28, height: 28, color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Inbox is clear
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Inquiries submitted via the portfolio contact form will appear here.
                </div>
              </div>
            ) : (
              messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 12,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {msg.name}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>
                    {msg.email} {msg.role ? `· ${msg.role}` : ''}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/admin/messages"
              style={{
                fontSize: '0.82rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Open Inquiries Inbox →
            </Link>
          </div>
        </div>
      </div>

      {/* ── All 10 CMS Management Modules Directory ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            CMS Module Directory
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Quick access to all portfolio content managers and configurations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {cmsModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                to={m.path}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: '1.25rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease',
                  boxShadow: 'var(--card-shadow)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = m.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${m.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon style={{ width: 18, height: 18, color: m.color }} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 6,
                        background: `${m.color}12`,
                        color: m.color,
                      }}
                    >
                      {m.badge}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {m.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: m.color,
                    marginTop: '1rem',
                  }}
                >
                  Manage <ArrowRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── System Architecture & Diagnostics Telemetry ── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck style={{ width: 20, height: 20, color: '#10b981' }} />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                System Architecture & Reliability
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Dual-layer synchronization: Supabase Cloud PostgreSQL + Dexie.js Client Queue
              </span>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncingDb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: syncingDb ? 'spin 1s linear infinite' : 'none' }} />
            {syncingDb ? 'Syncing...' : 'Force Sync All Tables'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-main)',
            padding: '1rem',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Primary Database
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Supabase PostgreSQL
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Offline Sync Engine
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              Dexie.js IndexedDB ({pendingSync} queued)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              API Ping Latency
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {health?.latencyMs ? `${health.latencyMs} ms` : 'Active'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Session Gate
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Admin Authenticated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

