import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { aboutData } from '../data/portfolioData';

export function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        
        {/* Profile Avatar Card */}
        <div className="hero-avatar-wrapper">
          <img
            src={aboutData.avatarUrl}
            alt={aboutData.name}
            className="hero-avatar-img"
          />
        </div>

        <div className="badge-container">
          <span className="status-badge">
            <span className="pulse-dot"></span> Building Something New
          </span>
        </div>
        
        <h1 className="hero-title">
          Hi, I'm <span className="text-gradient">{aboutData.name}</span>
        </h1>
        <p className="hero-subtitle">
          {aboutData.title}
        </p>

        {/* What I Do Tags */}
        <div className="what-i-do-bar" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.25)', color: 'var(--text-primary)', fontWeight: 600 }}>Full-Stack Web Development</span>
          <span className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.08)', borderColor: 'rgba(14, 165, 233, 0.25)', color: 'var(--text-primary)', fontWeight: 600 }}>AI & Machine Learning</span>
          <span className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)', color: 'var(--text-primary)', fontWeight: 600 }}>Data Science & Analytics</span>
        </div>

        <p className="hero-description">
          Building high-performance web applications, scalable architectural backends, and intelligent data science pipelines. Focused on clean code, modern engineering, and intuitive user experiences.
        </p>

        <div className="hero-cta-group">
          <Link to="/projects" className="btn btn-primary">
            <span>Explore Projects</span>
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </div>

        {/* Quick Hero Metrics Strip */}
        <div className="hero-metrics-strip" style={{
          display: 'flex',
          justify: 'center',
          gap: '2.5rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>15+</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Public Repositories</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>10+</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Frameworks & Libraries</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>B.E</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI & Data Science</div>
          </div>
        </div>


      </div>
    </section>
  );
}
