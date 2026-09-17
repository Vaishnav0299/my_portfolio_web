import React, { useState, useEffect, useRef } from 'react';
import { Layout, Server, Database, Cpu } from 'lucide-react';
import { api } from '../lib/api';
import { skillsData } from '../data/portfolioData'; // fallback

const iconMap = { Layout, Server, Database, Cpu };

export function Skills() {
  const gridRef = useRef(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    api.getSkills()
      .then(res => setSkills(res.data))
      .catch(() => setSkills(skillsData)); // static fallback
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
    <section id="skills" className="skills-section">
      <div className="section-header">
        <h2 className="section-title">Technical Expertise</h2>
        <p className="section-subtitle">Technologies, frameworks, and core competencies I work with daily.</p>
      </div>
      <div className="skills-grid" ref={gridRef} id="skills-matrix-grid">
        {skills.map((cat, idx) => (
          <div key={cat.id ?? idx} className="skill-category-card">
            <h3>{cat.category}</h3>
            {cat.items.map((s, sIdx) => (
              <div key={sIdx} className="skill-bar-container">
                <div className="skill-info">
                  <span>{s.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.val}</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" data-percentage={s.val}></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
