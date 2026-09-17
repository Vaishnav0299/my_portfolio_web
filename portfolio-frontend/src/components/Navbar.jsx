import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';

export function Navbar({ onOpenCmd, theme, onToggleTheme }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-accent">&lt;</span>VG<span className="logo-accent"> /&gt;</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>

          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>Projects</NavLink>
          <NavLink to="/skills" className={({ isActive }) => isActive ? 'active' : ''}>Skills</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
          <NavLink to="/terminal" className={({ isActive }) => isActive ? 'active' : ''}>Terminal</NavLink>
        </nav>
        <div className="nav-actions">
          <button className="cmd-k-btn" onClick={onOpenCmd} title="Search website...">
            <Search style={{ width: 15, height: 15 }} />
            <span>Search</span>
          </button>
          <button id="theme-toggle" onClick={onToggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun className="sun-icon" /> : <Moon className="moon-icon" />}
          </button>

        </div>
      </div>
    </header>
  );
}
