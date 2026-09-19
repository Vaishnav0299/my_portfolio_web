import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Search, Sparkles, Layers, Info, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { ProjectMockup } from './ProjectMockup';
import { ProjectModal } from './ProjectModal';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && trimmed !== '#' && trimmed !== 'undefined';
}

function hasRealLiveUrl(live, github) {
  if (!isValidUrl(live)) return false;
  const trimmedLive = live.trim().toLowerCase();
  const trimmedGit = (github || '').trim().toLowerCase();
  if (trimmedGit && trimmedLive === trimmedGit) return false;
  if (trimmedLive.includes('github.com/') && !trimmedLive.includes('.github.io')) return false;
  return true;
}


export function Projects() {
  const { config } = useConfig();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getProjects()
      .then((res) => {
        if (isMounted && res?.data) {
          setProjects(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filteredProjects = projects.filter((proj) => {
    const matchesCategory = activeFilter === 'all' || proj.category === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      proj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.stack?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            ENGINEERING WORK
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Production Systems &amp; Case Studies
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            SaaS platforms, real-time collaboration engines, multi-tenant databases, and intelligent AI assistants.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        {isEnabled(config, 'projects', 'projectsFilters') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, tech stack, or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Work ({projects.length})
            </button>
            <button
              className={`filter-btn ${activeFilter === 'fullstack' ? 'active' : ''}`}
              onClick={() => setActiveFilter('fullstack')}
            >
              Full-Stack ({projects.filter((p) => p.category === 'fullstack').length})
            </button>
            {projects.some((p) => p.category === 'realtime') && (
              <button
                className={`filter-btn ${activeFilter === 'realtime' ? 'active' : ''}`}
                onClick={() => setActiveFilter('realtime')}
              >
                Real-Time ({projects.filter((p) => p.category === 'realtime').length})
              </button>
            )}
            <button
              className={`filter-btn ${activeFilter === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ai')}
            >
              AI &amp; Automation ({projects.filter((p) => p.category === 'ai').length})
            </button>
            <button
              className={`filter-btn ${activeFilter === 'data-analytics' ? 'active' : ''}`}
              onClick={() => setActiveFilter('data-analytics')}
            >
              Data Analytics ({projects.filter((p) => p.category === 'data-analytics').length})
            </button>
          </div>
        </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="projects-responsive-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card" style={{ height: 380, opacity: 0.5, borderRadius: 14 }} />
            ))}
          </div>
        )}

        {/* Projects Responsive Grid */}
        <div className="projects-responsive-grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.25s ease, border-color 0.25s ease',
              }}
            >
              <div className="project-card-body" style={{ padding: '1.75rem 1.75rem 1.25rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header: Type Badge & Status (No Stars) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge badge-${project.badgeClass || 'fullstack'}`}>
                    {project.type || 'Production Platform'}
                  </span>
                  {project.status && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: hasRealLiveUrl(project.live, project.github) ? '#10b981' : '#6366f1',
                          display: 'inline-block',
                          boxShadow: hasRealLiveUrl(project.live, project.github) ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                        }}
                      />
                      <span>{project.status}</span>
                    </span>
                  )}
                </div>

                {/* Project Title */}
                <h3 className="project-card-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {project.name}
                </h3>

                {/* Tagline / Problem */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {project.tagline || project.desc}
                </p>

                {/* Metric Chips if available */}
                {isEnabled(config, 'projects', 'projectsMetrics') && project.metrics && project.metrics.length > 0 && (
                  <div className="metric-chips-grid">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="metric-chip-item">
                        <div className="metric-chip-val">{m.value}</div>
                        <div className="metric-chip-label">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Badges */}
                {isEnabled(config, 'projects', 'projectsStack') && project.stack && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '1rem' }}>
                    {project.stack.slice(0, 5).map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {project.stack.length > 5 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        +{project.stack.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="project-card-footer">
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="project-arch-btn"
                  title="View system architecture and technical details"
                >
                  <Layers size={14} />
                  <span>Architecture</span>
                  <ChevronRight size={13} className="arch-arrow" />
                </button>

                {isEnabled(config, 'projects', 'projectsLinks') && (isValidUrl(project.github) || hasRealLiveUrl(project.live, project.github)) && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isValidUrl(project.github) && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-btn"
                        title="View Source on GitHub"
                      >
                        <Github size={15} />
                      </a>
                    )}
                    {hasRealLiveUrl(project.live, project.github) && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-btn"
                        title="Open Live Deployment"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}

export default Projects;
