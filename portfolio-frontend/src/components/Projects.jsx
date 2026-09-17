import React, { useState, useEffect } from 'react';
import { Github, Search, Info } from 'lucide-react';
import { api } from '../lib/api';
import { projectsData } from '../data/portfolioData'; // fallback

export function Projects() {
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => {
    api.getProjects()
      .then(res => setProjects(res.data))
      .catch(() => {
        // API unreachable — fall back to static data
        setProjects(projectsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter(proj => {
    const matchesCategory = activeFilter === 'all' || proj.category === activeFilter;
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="projects-section">
      <div className="section-header">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">Production-grade web applications, AI models, and automated data pipelines.</p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="projects-control-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem', alignItems: 'center' }}>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects by name, description, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              backdropFilter: 'blur(12px)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="project-filter-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            All Projects ({projects.length})
          </button>
          <button className={`filter-btn ${activeFilter === 'data-analytics' ? 'active' : ''}`} onClick={() => setActiveFilter('data-analytics')}>
            Data Analytics & ML ({projects.filter(p => p.category === 'data-analytics').length})
          </button>
          <button className={`filter-btn ${activeFilter === 'fullstack' ? 'active' : ''}`} onClick={() => setActiveFilter('fullstack')}>
            Full-Stack ({projects.filter(p => p.category === 'fullstack').length})
          </button>
          <button className={`filter-btn ${activeFilter === 'ai' ? 'active' : ''}`} onClick={() => setActiveFilter('ai')}>
            AI & Automation ({projects.filter(p => p.category === 'ai').length})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="projects-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="portfolio-card" style={{ minHeight: 220, opacity: 0.4, animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: 20, background: 'var(--border-color)', borderRadius: 6, marginBottom: 12 }} />
              <div style={{ height: 14, background: 'var(--border-color)', borderRadius: 6, width: '80%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="projects-grid" id="portfolio-project-grid">
          {filteredProjects.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
              <Info style={{ width: 32, height: 32, marginBottom: '0.75rem', color: 'var(--accent-primary)' }} />
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No projects match your search query.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.35rem' }}>Try clearing filters or searching for different tech keywords.</p>
            </div>
          ) : (
            filteredProjects.map(proj => (
              <div
                key={proj.id}
                className="portfolio-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ marginBottom: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`proj-badge ${proj.badgeClass}`}>{proj.type}</span>
                    <span className="proj-category-tag">{proj.categoryName || proj.category}</span>
                  </div>
                  <h3>{proj.name}</h3>
                  <p>{proj.desc}</p>
                  <div className="tech-tag-wrap" style={{ marginTop: '1rem' }}>
                    {proj.stack.map((tag, idx) => (
                      <span key={idx} className="tech-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="project-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                  >
                    <Github style={{ width: 14, height: 14 }} /> GitHub
                  </a>
                  {proj.live && proj.live !== proj.github && (
                    <a
                      href={proj.live}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
