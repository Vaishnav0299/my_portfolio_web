import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Sun, Moon, FileText, Menu, X } from 'lucide-react';

export function Navbar({ onOpenCmd, theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar glass" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
          <span>VG<span style={{ color: 'var(--accent-primary)' }}>.dev</span></span>
        </Link>

        {/* Desktop Links */}
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="/#about" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>About</a>
          <a href="/#experience" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Experience</a>
          <a href="/#projects" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Projects</a>
          <a href="/#services" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Services</a>
          <a href="/#skills" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Skills</a>
          <a href="/#writing" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Writing</a>
          <a href="/#testimonials" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Reviews</a>
          <a href="/#contact" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Contact</a>
        </nav>

        {/* Actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="cmd-k-btn"
            onClick={onOpenCmd}
            title="Search command palette (Ctrl+K)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <Search size={14} />
            <span style={{ display: 'none', smDisplay: 'inline' }}>Search</span>
            <kbd style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>⌘K</kbd>
          </button>

          <a
            href="/resume.pdf"
            download="Vaishnav_Gaware_Resume.pdf"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <FileText size={14} />
            <span>Resume</span>
          </a>

          <button
            id="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '1rem 1.5rem 1.5rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <a href="/#about" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>About</a>
          <a href="/#experience" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Experience</a>
          <a href="/#projects" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Projects</a>
          <a href="/#services" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Services</a>
          <a href="/#skills" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Skills</a>
          <a href="/#writing" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Writing</a>
          <a href="/#testimonials" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Reviews</a>
          <a href="/#contact" onClick={closeMobile} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Contact</a>
        </div>
      )}
    </header>
  );
}

export default Navbar;
