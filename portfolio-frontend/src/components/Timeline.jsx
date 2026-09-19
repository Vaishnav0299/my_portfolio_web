import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

export function Timeline() {
  const { config } = useConfig();
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let isMounted = true;
    api.getTimeline()
      .then((res) => {
        if (isMounted && res?.data) {
          setEntries(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const filtered = entries.filter((e) => {
    if (activeTab === 'all') return true;
    return e.type === activeTab;
  });

  return (
    <section id="experience" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            CAREER &amp; EDUCATION
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Experience &amp; Milestones
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            A track record of shipping full-stack SaaS platforms, leading refactors, and building reliable systems.
          </p>

          {/* Segmented Filter */}
          {isEnabled(config, 'experience', 'timelineFilters') && (
            <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '1.75rem' }}>
              <button
                className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                All Milestones
              </button>
              <button
                className={`filter-btn ${activeTab === 'work' ? 'active' : ''}`}
                onClick={() => setActiveTab('work')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Work Experience
              </button>
              <button
                className={`filter-btn ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Education
              </button>
            </div>
          )}
        </div>

        {/* Timeline Items */}
        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {filtered.map((item, idx) => {
            const isEducation = item.type === 'education';
            const Icon = isEducation ? GraduationCap : Briefcase;
            const accentColor = isEducation ? '#10b981' : '#8b5cf6';

            return (
              <div key={item.id ?? idx} style={{ position: 'relative' }}>
                {/* Bullet node on line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.15rem',
                    top: '0.25rem',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--bg-main)',
                    border: `2px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor,
                  }}
                >
                  <Icon size={13} />
                </div>

                {/* Content card */}
                <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: accentColor, marginTop: '0.15rem' }}>
                        {item.inst}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {item.time}
                      </span>
                      {item.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', justifyContent: 'flex-end' }}>
                          <MapPin size={12} />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.75rem 0 1rem' }}>
                    {item.desc}
                  </p>

                  {/* Achievements */}
                  {isEnabled(config, 'experience', 'timelineAchievements') && item.achievements && item.achievements.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                      {item.achievements.map((ach, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={14} style={{ color: accentColor, flexShrink: 0, marginTop: '3px' }} />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stack Badges */}
                  {isEnabled(config, 'experience', 'timelineStackTags') && item.stack && item.stack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                      {item.stack.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Timeline;
