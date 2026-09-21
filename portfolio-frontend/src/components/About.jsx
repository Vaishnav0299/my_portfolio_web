import React, { useState, useEffect } from 'react';
import { GraduationCap, MapPin, Mail, Github, Linkedin, Twitter, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

export function About() {
  const { config } = useConfig();
  const [bioData, setBioData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getBio()
      .then((res) => {
        if (isMounted && res?.data) {
          setBioData(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const name = bioData?.name || 'Vaishnav Gaware';
  const title = bioData?.title || 'Full-Stack Developer & AI Systems Engineer';
  const education = bioData?.education || 'B.E. in Computer Engineering — Savitribai Phule Pune University';
  const location = bioData?.location || 'Pune, India (Open to Remote Worldwide)';
  const bio = bioData?.bio || 'Senior Full-Stack Developer specializing in high-performance web applications, distributed real-time systems, and pragmatic AI workflows.';
  const currentFocus = bioData?.currentFocus || 'Architecting ultra-resilient multi-tenant platforms, optimizing P95 query performance, and building delightful developer experiences.';
  const interests = bioData?.interests || [
    'Full-Stack Web Architecture — Next.js, React, Node.js, TypeScript',
    'Real-Time Systems, WebSockets & CRDT Collaboration (Yjs)',
    'PostgreSQL, Prisma, Drizzle ORM & Database Performance Tuning',
    'Pragmatic AI & RAG Pipelines (pgvector, Embeddings, Grounded Citations)',
  ];

  return (
    <section id="about" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            IDENTITY &amp; PHILOSOPHY
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            About {name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            A software engineer who cares deeply about architecture, velocity, and business outcomes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
          {/* Identity Card */}
          {isEnabled(config, 'about', 'aboutBioCard') && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  VG
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {title}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>{location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <GraduationCap size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>{education}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Mail size={16} style={{ color: '#f59e0b' }} />
                  <a href={`mailto:${bioData?.email || 'vaishnavgaware1@gmail.com'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {bioData?.email || 'vaishnavgaware1@gmail.com'}
                  </a>
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {bio}
              </p>
            </div>

            {/* Social links bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <a
                href={bioData?.github || 'https://github.com/Vaishnav0299'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Github size={15} />
                <span>GitHub</span>
              </a>
              <a
                href={bioData?.linkedin || 'https://www.linkedin.com/in/vaishnav-gaware'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Linkedin size={15} />
                <span>LinkedIn</span>
              </a>
              {(bioData?.twitter) && (
              <a
                href={bioData.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Twitter size={15} />
                <span>Twitter</span>
              </a>
              )}
            </div>
          </div>
          )}

          {/* Focus & Interests Column */}
          {isEnabled(config, 'about', 'aboutPhilosophyCard') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Core Technical Focus
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {interests.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Current Engineering Objective
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {currentFocus}
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default About;
