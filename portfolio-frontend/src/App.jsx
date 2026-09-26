import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ScrollProgress';
import { CursorSpotlight } from './components/CursorSpotlight';
import { QuickComponentSwitcher } from './components/QuickComponentSwitcher.jsx';
import { ConfigProvider, useConfig } from './context/ConfigContext.jsx';

// Public Pages
import { Home } from './pages/Home';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ContactPage } from './pages/ContactPage';

// Admin Panel
import { AdminLogin }        from './admin/AdminLogin';
import { AdminLayout }       from './admin/AdminLayout';
import { AdminDashboard }    from './admin/AdminDashboard';
import { AdminCustomizer }   from './admin/AdminCustomizer';
import { AdminProjects }     from './admin/AdminProjects';
import { AdminServices }     from './admin/AdminServices';
import { AdminSkills }       from './admin/AdminSkills';
import { AdminTimeline }     from './admin/AdminTimeline';
import { AdminBlog }         from './admin/AdminBlog';
import { AdminTestimonials } from './admin/AdminTestimonials';
import { AdminFaq }          from './admin/AdminFaq';
import { AdminNowUses }      from './admin/AdminNowUses';
import { AdminMessages }     from './admin/AdminMessages';
import { AdminBio }          from './admin/AdminBio';
import { AdminDocuments }    from './admin/AdminDocuments';

const ACCENT_MAP = {
  violet:  { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' },
  cyan:    { primary: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  emerald: { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  amber:   { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  rose:    { primary: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' },
};

function PortfolioApp() {
  const { config } = useConfig();
  const effects = config?.effects || {};
  const themeConfig = config?.theme || {};

  const [theme, setTheme] = useState(() => localStorage.getItem('os-theme') || themeConfig.defaultTheme || 'dark');
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('os-theme', theme);
  }, [theme]);

  // Apply custom accent color dynamically
  useEffect(() => {
    const accent = themeConfig.accentColor || 'violet';
    const mapped = ACCENT_MAP[accent] || ACCENT_MAP.violet;
    document.documentElement.style.setProperty('--accent-primary', mapped.primary);
    document.documentElement.style.setProperty('--accent-gradient', mapped.gradient);
  }, [themeConfig.accentColor]);

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
        {/* ── Admin Panel (isolated layout with full CMS) ────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="documents"    element={<AdminDocuments />} />
          <Route path="customizer"   element={<AdminCustomizer />} />
          <Route path="projects"     element={<AdminProjects />} />
          <Route path="services"     element={<AdminServices />} />
          <Route path="skills"       element={<AdminSkills />} />
          <Route path="timeline"     element={<AdminTimeline />} />
          <Route path="blog"         element={<AdminBlog />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="faq"          element={<AdminFaq />} />
          <Route path="now-uses"     element={<AdminNowUses />} />
          <Route path="messages"     element={<AdminMessages />} />
          <Route path="bio"          element={<AdminBio />} />
        </Route>

        {/* ── Public Site (main layout) ─────────────────────────────────── */}
        <Route path="*" element={
          <div className="app-root">
            {effects.scrollProgress !== false && <ScrollProgress />}
            {effects.cursorSpotlight !== false && <CursorSpotlight />}
            <Toast toast={toast} />

            <Navbar
              onOpenCmd={() => setIsCmdOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            <main className="main-content">
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/about"    element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/skills"   element={<SkillsPage />} />
                <Route path="/contact"  element={<ContactPage onShowToast={showToast} />} />
              </Routes>
            </main>

            <CommandPalette
              isOpen={isCmdOpen}
              onClose={() => setIsCmdOpen(false)}
            />

            <QuickComponentSwitcher />

            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ConfigProvider>
      <PortfolioApp />
    </ConfigProvider>
  );
}

export default App;
