import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

// Public Pages
import { Home } from './pages/Home';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ContactPage } from './pages/ContactPage';
import { TerminalPage } from './pages/TerminalPage';

// Admin Panel
import { AdminLogin }     from './admin/AdminLogin';
import { AdminLayout }    from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProjects }  from './admin/AdminProjects';
import { AdminSkills }    from './admin/AdminSkills';
import { AdminTimeline }  from './admin/AdminTimeline';
import { AdminBio }       from './admin/AdminBio';

export function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('os-theme') || 'dark');
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('os-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next} mode`);
  };

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin Panel (isolated layout) ─────────────────────────────── */}
        <Route path="/admin/login"    element={<AdminLogin />} />
        <Route path="/admin"          element={<AdminLayout />}>
          <Route index                element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="projects"      element={<AdminProjects />} />
          <Route path="skills"        element={<AdminSkills />} />
          <Route path="timeline"      element={<AdminTimeline />} />
          <Route path="bio"           element={<AdminBio />} />
        </Route>

        {/* ── Public Site (main layout) ─────────────────────────────────── */}
        <Route path="*" element={
          <div className="app-root">
            <Toast toast={toast} />

            <Navbar
              onOpenCmd={() => setIsCmdOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            <main className="main-content">
              <Routes>
                <Route path="/"        element={<Home />} />
                <Route path="/about"   element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/skills"  element={<SkillsPage />} />
                <Route path="/contact" element={<ContactPage onShowToast={showToast} />} />
                <Route path="/terminal" element={<TerminalPage />} />
              </Routes>
            </main>

            <CommandPalette
              isOpen={isCmdOpen}
              onClose={() => setIsCmdOpen(false)}
            />

            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
