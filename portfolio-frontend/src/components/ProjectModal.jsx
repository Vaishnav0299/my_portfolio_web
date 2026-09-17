import React, { useEffect } from 'react';
import { X, Github, ExternalLink, Star, Layers, Cpu, CheckCircle2 } from 'lucide-react';

export function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content project-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`proj-badge ${project.badgeClass || ''}`}>{project.type}</span>
            <span className="status-pill" style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 600
            }}>
              {project.status || 'Active'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Modal Title */}
        <h2 className="modal-title" style={{ fontSize: '1.75rem', marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          {project.name}
        </h2>
        
        <p className="modal-desc" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {project.longDesc || project.desc}
        </p>

        {/* Features List */}
        {project.features && project.features.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 style={{ width: 16, height: 16 }} /> Key Capabilities & Features
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {project.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <span style={{ color: 'var(--accent-secondary)', marginTop: '0.1rem' }}>▹</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture & Tech Stack Overview */}
        {project.architecture && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers style={{ width: 15, height: 15 }} /> Architectural Notes
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              {project.architecture}
            </p>
          </div>
        )}

        {/* Tech Stack Tags */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu style={{ width: 14, height: 14 }} /> Technologies Used
          </h4>
          <div className="tech-tag-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.stack.map((tech, idx) => (
              <span key={idx} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Github style={{ width: 16, height: 16 }} /> View GitHub Repository
            </a>
          )}
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ExternalLink style={{ width: 16, height: 16 }} /> Live Demo / Documentation
            </a>
          )}
          {project.stars && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
              <Star style={{ width: 15, height: 15, color: '#eab308', fill: '#eab308' }} /> {project.stars} Stars
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
