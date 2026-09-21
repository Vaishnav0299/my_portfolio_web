import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_NOW = [
  { text: 'Architecting multi-tenant SaaS dashboards handling 4.2M events/day.', tag: 'shipping' },
  { text: 'Going deep on RAG systems — pgvector, re-rankers, and grounded citations.', tag: 'learning' },
  { text: 'Revisiting "Designing Data-Intensive Applications" for distributed patterns.', tag: 'reading' },
  { text: 'Open for Senior Full-Stack roles (remote-first or Pune-based).', tag: 'available' },
  { text: 'Writing technical teardowns on CRDTs, RAG reliability, and PostgreSQL RLS.', tag: 'writing' },
];

export function Now() {
  const [items, setItems] = useState(DEFAULT_NOW);

  useEffect(() => {
    let isMounted = true;
    api.getNow()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setItems(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="now" className="section" style={{ padding: '5rem 0', background: 'var(--bg-main)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            CURRENT FOCUS
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            What I&apos;m Doing Now
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            A snapshot of active pursuits, projects, and learning goals.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: idx < items.length - 1 ? '1.25rem' : 0,
                  borderBottom: idx < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 10px var(--accent-primary)',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>
                  {item.text}
                </span>
                {item.tag && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Now;
