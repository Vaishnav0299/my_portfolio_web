import React from 'react';
import { GraduationCap, MapPin, Mail } from 'lucide-react';
import { aboutData } from '../data/portfolioData';

export function About() {
  return (
    <section id="about" className="about-section">
      <div className="section-header">
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">Background, education, core technical interests, and career objectives.</p>
      </div>

      <div className="about-cards-column">
        {/* Meta Info Row */}
        <div className="about-card bio-card">
          <div className="about-meta-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div className="about-meta-item">
              <GraduationCap style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} />
              <span>{aboutData.education}</span>
            </div>
            <div className="about-meta-item">
              <MapPin style={{ width: 18, height: 18, color: 'var(--accent-secondary)' }} />
              <span>{aboutData.location}</span>
            </div>
            <div className="about-meta-item">
              <Mail style={{ width: 18, height: 18, color: 'var(--accent-emerald)' }} />
              <a href={`mailto:${aboutData.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{aboutData.email}</a>
            </div>
          </div>
          <h3 style={{ marginTop: '1.25rem' }}>Short Bio</h3>
          <p>{aboutData.bio}</p>
        </div>

        <div className="about-two-col">
          <div className="about-card interests-card">
            <h3>Core Technical Interests</h3>
            <ul className="interests-list">
              {aboutData.interests.map((item, idx) => (
                <li key={idx}>
                  <span className="interest-bullet"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-card seeking-card">
            <h3>Current Focus</h3>
            <p>{aboutData.currentFocus}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
