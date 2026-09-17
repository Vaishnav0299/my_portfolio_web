import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { User, FolderGit2, Cpu, Terminal as TermIcon, Mail, ArrowRight } from 'lucide-react';

export function Home() {
  const portalCards = [
    {
      title: 'About Me',
      desc: 'Explore my academic timeline, engineering background, and current research focus.',
      link: '/about',
      icon: User,
      colorClass: 'accent-primary',
    },
    {
      title: 'Projects Showcase',
      desc: 'Explore enterprise full-stack web applications, ML models, and automated data pipelines.',
      link: '/projects',
      icon: FolderGit2,
      colorClass: 'accent-secondary',
    },

    {
      title: 'Technical Skills',
      desc: 'Deep-dive into my frontend, backend, database, and AI technical stacks.',
      link: '/skills',
      icon: Cpu,
      colorClass: 'accent-emerald',
    },
    {
      title: 'Interactive CLI',
      desc: 'Interact with a developer command-line terminal simulation simulating system states.',
      link: '/terminal',
      icon: TermIcon,
      colorClass: 'accent-amber',
    }
  ];

  return (
    <div className="home-page-container">
      <Hero />
      
      {/* Portal Directory Section */}
      <section className="portal-section" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 className="section-title">Directory Portal</h2>
          <p className="section-subtitle">Explore different areas of my portfolio through these interactive modules.</p>
        </div>

        <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {portalCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="portfolio-card portal-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="portal-card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className={`portal-icon-wrap ${card.colorClass}`} style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <Icon style={{ width: 24, height: 24 }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{card.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '1.5rem' }}>
                  {card.desc}
                </p>
                <Link to={card.link} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'auto' }}>
                  <span>Open Section</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
