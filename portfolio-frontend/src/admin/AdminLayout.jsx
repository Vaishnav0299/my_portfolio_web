import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Sliders,
  Package,
  Briefcase,
  Wrench,
  Clock,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Compass,
  Mail,
  User,
  LogOut,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { StatusIndicator, SyncQueueBadge, ManualSyncButton } from './StatusIndicator';
import { api } from '../lib/api';

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/customizer',   icon: Sliders,          label: 'Site Customizer' },
  { to: '/admin/projects',     icon: Package,          label: 'Projects' },
  { to: '/admin/services',     icon: Briefcase,        label: 'Services' },
  { to: '/admin/skills',       icon: Wrench,           label: 'Skills' },
  { to: '/admin/timeline',     icon: Clock,            label: 'Timeline' },
  { to: '/admin/blog',         icon: BookOpen,         label: 'Blog' },
  { to: '/admin/testimonials', icon: MessageSquare,    label: 'Testimonials' },
  { to: '/admin/faq',          icon: HelpCircle,       label: 'FAQs' },
  { to: '/admin/now-uses',     icon: Compass,          label: 'Now & Uses' },
  { to: '/admin/messages',     icon: Mail,             label: 'Messages' },
  { to: '/admin/bio',          icon: User,             label: 'Bio' },
];

export function AdminLayout() {
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token');
    if (!token) navigate('/admin/login', { replace: true });
  }, [navigate]);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('portfolio_admin_token');
    navigate('/admin/login', { replace: true });
  };

  const sidebarStyle = {
    width: 250, minHeight: '100vh', flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex', flexDirection: 'column',
    padding: '1.25rem 0.85rem',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  };

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.55rem 0.75rem', borderRadius: 8,
    textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500,
    transition: 'all 0.15s ease',
    background: isActive ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))' : 'transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    border: isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
    marginBottom: '0.2rem',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap style={{ width: 17, height: 17, color: 'var(--accent-primary)' }} /> Admin Control
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Portfolio CMS & Customizer</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => navLinkStyle(isActive)}>
              <Icon style={{ width: 16, height: 16 }} /> {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{ ...navLinkStyle(false), fontSize: '0.82rem' }}
          >
            <ExternalLink style={{ width: 15, height: 15 }} /> View Live Site
          </a>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            style={{
              ...navLinkStyle(false), border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left',
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)', display: 'flex',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 1.5rem', gap: '0.75rem', flexShrink: 0,
        }}>
          <SyncQueueBadge />
          <ManualSyncButton />
          <StatusIndicator />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
