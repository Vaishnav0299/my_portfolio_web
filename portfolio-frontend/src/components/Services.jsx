import React, { useState, useEffect } from 'react';
import { Code2, Server, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

const DEFAULT_SERVICES = [
  {
    id: 1,
    title: 'Custom Web Application Development',
    description: 'End-to-end full-stack development using modern web architecture — from auth and data modeling to deployment.',
    bullets: [
      'Next.js / React + TypeScript architecture',
      'REST & WebSocket APIs',
      'CI/CD pipelines & automated testing',
      'Vercel / Docker deployment',
    ],
    accent: 'violet',
    icon: Code2,
  },
  {
    id: 2,
    title: 'Performance & API Integrations',
    description: 'Speed optimization, SEO auditing, payment gateway setup, and third-party API wiring that just works.',
    bullets: [
      'Core Web Vitals & Lighthouse 95+',
      'Stripe / Razorpay payment flows',
      'Third-party API integration',
      'Caching & query optimization',
    ],
    accent: 'emerald',
    icon: Server,
  },
  {
    id: 3,
    title: 'UI/UX Modernization',
    description: 'Converting outdated codebases or Figma designs into lightning-fast, responsive, accessible web apps.',
    bullets: [
      'Legacy codebase refactors',
      'Figma → production React',
      'Design system setup',
      'WCAG AA accessibility',
    ],
    accent: 'amber',
    icon: Wrench,
  },
];

const iconMap = {
  Code2,
  Server,
  Wrench,
};

export function Services() {
  const { config } = useConfig();
  const [services, setServices] = useState(DEFAULT_SERVICES);

  useEffect(() => {
    let isMounted = true;
    api.getServices()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          const mapped = res.data.map((s, idx) => ({
            id: s.id || idx + 1,
            title: s.title,
            description: s.description,
            bullets: s.bullets || [],
            accent: s.accent || 'violet',
            icon: iconMap[s.icon] || Code2,
          }));
          setServices(mapped);
        }
      })
      .catch(() => {
        // Fallback to default services
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="services" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            WHAT I DELIVER
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Engineering Services &amp; Capabilities
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            From high-throughput backends and real-time sockets to responsive, polished user interfaces.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => {
            const IconComponent = service.icon || Code2;
            return (
              <div key={service.id} className="service-card glass-card">
                <div className="service-icon-box">
                  <IconComponent size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {service.description}
                </p>

                {isEnabled(config, 'services', 'servicesBullets') && service.bullets && service.bullets.length > 0 && (
                  <ul className="service-bullets">
                    {service.bullets.map((b, idx) => (
                      <li key={idx} className="service-bullet-item">
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Conversion Banner */}
        {isEnabled(config, 'services', 'servicesCta') && (
          <div
            style={{
              marginTop: '3.5rem',
              padding: '2.5rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Have an upcoming product sprint or project?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Available for full-stack contracts, architecture consulting, or technical advisory.
              </p>
            </div>
            <a
              href="#contact"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <span>Let&apos;s Build Together</span>
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default Services;
