import React, { useEffect } from 'react';
import { X, Calendar, Clock, BookOpen } from 'lucide-react';

export function BlogModal({ post, isOpen, onClose }) {
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

  if (!isOpen || !post) return null;

  return (
    <div className="blog-modal-backdrop" onClick={onClose}>
      <div
        className="blog-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="project-modal-close"
          onClick={onClose}
          aria-label="Close article"
        >
          <X size={20} />
        </button>

        {/* Article Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', pb: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.05em',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.12)',
                color: 'var(--accent-primary)',
              }}
            >
              {post.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>{post.readTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} />
              <span>{post.date}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.75rem' }}>
            {post.title}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {post.excerpt}
          </p>
        </div>

        {/* Article Body */}
        <div className="blog-content">
          {post.body && post.body.map((block, idx) => {
            if (block.type === 'p') {
              return <p key={idx}>{block.text}</p>;
            }
            if (block.type === 'h') {
              return <h3 key={idx}>{block.text}</h3>;
            }
            if (block.type === 'callout') {
              return (
                <div key={idx} className="blog-callout">
                  {block.text}
                </div>
              );
            }
            if (block.type === 'code') {
              return (
                <pre key={idx} className="blog-code-block">
                  <code>{block.text}</code>
                </pre>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={idx} style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                  {block.items.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem', fontSize: '1rem', lineHeight: 1.6 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote
                  key={idx}
                  style={{
                    borderLeft: '4px solid var(--accent-primary)',
                    paddingLeft: '1rem',
                    margin: '1.5rem 0',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p style={{ margin: 0 }}>{block.text}</p>
                  {block.cite && <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--text-muted)' }}>{block.cite}</small>}
                </blockquote>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default BlogModal;
