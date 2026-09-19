import React, { useState, useEffect, useRef } from 'react';
import { Layout, Server, Cpu, Code2, Database } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

const iconMap = { Layout, Server, Database, Cpu, Code2 };

export function Skills() {
  const { config } = useConfig();
  const gridRef = useRef(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.getSkills()
      .then((res) => {
        if (isMounted && res?.data) {
          setSkills(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const node = gridRef.current;
    if (!node || skills.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.skill-fill');
            fills.forEach((f) => {
              const pct = f.getAttribute('data-percentage');
              if (pct) f.style.width = pct;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [skills]);

  return (
    <section id="skills" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            PROFICIENCY MATRIX
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Technical Expertise &amp; Tooling
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            Core languages, frameworks, and cloud infrastructure leveraged across production environments.
          </p>
        </div>

        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {skills.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Code2;
            return (
              <div key={cat.id ?? idx} className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  {isEnabled(config, 'skills', 'skillsCategoryIcons') && (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(139, 92, 246, 0.12)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.category}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {cat.items.map((s, sIdx) => {
                    const percentageStr = typeof s.val === 'string' && s.val.includes('%') ? s.val : `${s.level || s.val}%`;
                    const showBars = isEnabled(config, 'skills', 'skillsPercentageBars');
                    return (
                      <div key={sIdx} className="skill-bar-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: showBars ? '0.35rem' : 0 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                          {showBars && (
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              {percentageStr}
                            </span>
                          )}
                        </div>
                        {showBars && (
                          <div
                            style={{
                              height: '7px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '9999px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              className="skill-fill"
                              data-percentage={percentageStr}
                              style={{
                                width: '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                                borderRadius: '9999px',
                                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Skills;
