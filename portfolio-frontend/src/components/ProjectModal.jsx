import React, { useEffect } from 'react';
import { X, ExternalLink, Github, User, Calendar, Layers, Sparkles, AlertTriangle } from 'lucide-react';

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


export function ProjectModal({ project, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const accent = project.accent || 'violet';
  const name = project.name || project.title;

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div
        className="project-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="project-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.12)',
                color: 'var(--accent-primary)',
              }}
            >
              {project.categoryName || project.type}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {project.tagline || project.desc}
          </p>
        </div>

        {/* Role & Period */}
        {(project.role || project.period) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {project.role && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <User size={13} /> ROLE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {project.role}
                </div>
              </div>
            )}
            {project.period && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} /> PERIOD
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {project.period}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Problem & Solution */}
        {(project.problem || project.solution) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {project.problem && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#ef4444', marginBottom: '0.35rem' }}>
                  The Challenge
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {project.problem}
                </p>
              </div>
            )}
            {project.solution && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#10b981', marginBottom: '0.35rem' }}>
                  The Solution
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {project.solution}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Metric Chips */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="metric-chips-grid">
            {project.metrics.map((m, idx) => (
              <div key={idx} className="metric-chip-item">
                <div className="metric-chip-val">{m.value}</div>
                <div className="metric-chip-label">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Architecture & Highlights */}
        {(project.highlights || project.features) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              <Layers size={16} style={{ color: 'var(--accent-primary)' }} /> Architecture Highlights
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(project.highlights || project.features).map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Engineering Challenges */}
        {project.challenges && (
          <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.35rem' }}>
              <AlertTriangle size={15} /> Key Engineering Hurdle
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {project.challenges}
            </p>
          </div>
        )}

        {/* Tech Stack Badges */}
        {project.stack && project.stack.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Tech Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {project.stack.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(() => {
          const hasGithub = isValidUrl(project.github);
          const hasLive = hasRealLiveUrl(project.live, project.github);
          if (!hasGithub && !hasLive) return null;

          return (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              {hasGithub && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Github size={16} /> View Code
                </a>
              )}
              {hasLive && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <ExternalLink size={16} /> Live Demo
                </a>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default ProjectModal;
