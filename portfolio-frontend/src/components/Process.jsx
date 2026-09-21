import React from 'react';
import { Search, PencilRuler, Hammer, Rocket } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    description: 'We map the problem before touching code. I dig into goals, technical constraints, and what success actually looks like.',
    deliverables: ['Scope doc', 'Tech audit', 'Success metrics'],
    icon: Search,
    accent: '#8b5cf6',
  },
  {
    num: '02',
    title: 'Design',
    description: 'Architecture, data model, and UI direction — aligned with you before any expensive building happens.',
    deliverables: ['System diagram', 'API contract', 'Wireframes'],
    icon: PencilRuler,
    accent: '#10b981',
  },
  {
    num: '03',
    title: 'Build',
    description: 'Tight feedback loops. You see working software weekly — not a black box for two months.',
    deliverables: ['Weekly demos', 'Source access', 'Test coverage'],
    icon: Hammer,
    accent: '#f59e0b',
  },
  {
    num: '04',
    title: 'Ship',
    description: 'Production deploy, monitoring, and a handover doc so your team can take over with confidence.',
    deliverables: ['Production deploy', 'Monitoring', 'Handover doc'],
    icon: Rocket,
    accent: '#8b5cf6',
  },
];

export function Process() {
  return (
    <section id="process" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            HOW I WORK
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            From Idea to Production in 4 Phases
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            A predictable, transparent engineering process — so you always know what is happening, why, and what comes next.
          </p>
        </div>

        <div className="process-grid">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="process-card glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="process-step-num">{step.num}</div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      color: step.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {step.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Key Deliverables
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {step.deliverables.map((d, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Process;
