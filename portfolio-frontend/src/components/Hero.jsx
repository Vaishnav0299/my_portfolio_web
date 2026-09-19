import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, FileText, Sparkles, MapPin } from 'lucide-react';
import { Typewriter } from './Typewriter';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';
import { api } from '../lib/api';

const FALLBACK_SKILLS = [
  { name: 'React' },
  { name: 'Next.js' },
  { name: 'TypeScript' },
  { name: 'Tailwind CSS' },
  { name: 'Node.js' },
  { name: 'PostgreSQL' },
  { name: 'Prisma / Drizzle ORM' },
  { name: 'Docker' },
  { name: 'REST & WebSockets' },
  { name: 'Git & GitHub' },
  { name: 'Linux System Admin' },
  { name: 'Python' },
];

const DEFAULT_STATS = [
  { label: 'Years of Experience', value: '5+', color: 'var(--accent-primary)' },
  { label: 'Projects Shipped', value: '30+', color: 'var(--accent-secondary, #06b6d4)' },
  { label: 'Happy Clients', value: '20+', color: '#f59e0b' },
  { label: 'Production Uptime', value: '99.9%', color: '#ec4899' },
];

const STAT_COLORS = ['var(--accent-primary)', 'var(--accent-secondary, #06b6d4)', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

function extractSkillsList(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return [];
  const list = [];
  const seen = new Set();
  categories.forEach((cat) => {
    if (Array.isArray(cat?.items)) {
      cat.items.forEach((item) => {
        const cleanName = item?.name?.trim();
        if (cleanName && !seen.has(cleanName.toLowerCase())) {
          seen.add(cleanName.toLowerCase());
          list.push({ name: cleanName });
        }
      });
    }
  });
  return list;
}

export function Hero() {
  const { config } = useConfig();
  const theme = config?.theme || {};
  const effects = config?.effects || {};

  const [skillsList, setSkillsList] = useState(FALLBACK_SKILLS);
  const [bioData, setBioData] = useState(null);

  // Fetch bio data for dynamic hero content
  useEffect(() => {
    let isMounted = true;
    api.getBio()
      .then((res) => {
        if (isMounted && res?.data) {
          setBioData(res.data);
        }
      })
      .catch(() => {});

    const handleSync = () => {
      api.getBio()
        .then((res) => { if (isMounted && res?.data) setBioData(res.data); })
        .catch(() => {});
    };
    window.addEventListener('db-synced', handleSync);
    return () => { isMounted = false; window.removeEventListener('db-synced', handleSync); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSkills = () => {
      api.getSkills()
        .then((res) => {
          if (isMounted && res?.data) {
            const parsed = extractSkillsList(res.data);
            if (parsed.length > 0) {
              setSkillsList(parsed);
            }
          }
        })
        .catch(() => {});
    };

    fetchSkills();
    window.addEventListener('db-synced', fetchSkills);
    return () => {
      isMounted = false;
      window.removeEventListener('db-synced', fetchSkills);
    };
  }, []);

  // Dynamic hero content with fallbacks
  let rawHeadline = bioData?.headlinePrefix || 'Crafting Systems & Software';
  if (rawHeadline.endsWith(' with')) {
    rawHeadline = rawHeadline.replace(/\s+with$/, '');
  }
  const heroName = bioData?.name || 'Vaishnav Gaware';
  const heroDescription = bioData?.heroDescription || bioData?.bio || 'Senior Full-Stack Developer specializing in high-performance web applications, distributed real-time systems, and pragmatic AI workflows. Scaling systems to millions of daily events with sub-second latencies.';
  const heroLocation = bioData?.location || 'Pune, India · Remote Worldwide';
  const typewriterPhrases = bioData?.typewriterPhrases;
  const heroStats = bioData?.stats || DEFAULT_STATS;

  // Render headline with gradient accent on the accented words
  const renderHeadline = (text) => {
    const trimmed = (text || 'Crafting Systems & Software').trim();
    if (trimmed.includes(' & ')) {
      const parts = trimmed.split(' & ');
      return (
        <>
          {parts[0]} &amp; <span className="gradient-text">{parts.slice(1).join(' & ')}</span>
        </>
      );
    }
    const words = trimmed.split(/\s+/);
    if (words.length > 1) {
      const firstPart = words.slice(0, -1).join(' ');
      const lastWord = words[words.length - 1];
      return (
        <>
          {firstPart} <span className="gradient-text">{lastWord}</span>
        </>
      );
    }
    return <span className="gradient-text">{trimmed}</span>;
  };

  // Use strictly unique items in each track so no duplicates appear within a cycle
  const trackItems = skillsList.length > 0 ? skillsList : FALLBACK_SKILLS;

  return (
    <section id="home" className="hero-section" style={{ paddingTop: '5.5rem', paddingBottom: '3.5rem' }}>
      <div className="hero-container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Availability / Location Pill */}
        {isEnabled(config, 'hero', 'heroBadge') && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {theme.openToWorkStatus !== false && (
              <span className="pulse-pill">
                <span className="pulse-dot" />
                <span>{theme.openToWorkText || 'Open to Work · Full-Time & Contracts'}</span>
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
              }}
            >
              <MapPin size={13} />
              <span>{heroLocation}</span>
            </span>
          </div>
        )}

        {/* Main Hero Headline */}
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
          {renderHeadline(rawHeadline)}
        </h1>

        {/* Dynamic Typewriter */}
        {isEnabled(config, 'hero', 'heroTypewriter') && (
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Typewriter phrases={typewriterPhrases} />
          </div>
        )}

        {/* Narrative Description */}
        <p
          className="hero-description"
          style={{
            maxWidth: '680px',
            margin: '0 auto 2rem',
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {heroDescription}
        </p>

        {/* Dual CTAs */}
        {isEnabled(config, 'hero', 'heroCta') && (
          <div className="hero-cta-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <a href="#projects" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.6rem' }}>
              <span>Explore Engineering Work</span>
              <ArrowRight size={16} />
            </a>
            <a href="#contact" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.6rem' }}>
              <Mail size={16} />
              <span>Get in Touch</span>
            </a>
            <a
              href={bioData?.resumeUrl || '/resume.pdf'}
              download={`${heroName.replace(/\s+/g, '_')}_Resume.pdf`}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}
            >
              <FileText size={16} />
              <span>Resume</span>
            </a>
          </div>
        )}

        {/* Quick Hero Metrics Strip (Horizontal Row) */}
        {isEnabled(config, 'hero', 'heroStats') && (
          <div
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '1.5rem',
              width: '100%',
              maxWidth: '860px',
              margin: '0 auto 2.5rem',
              padding: '1.5rem 2rem',
              borderRadius: '16px',
            }}
          >
            {heroStats.map((stat, idx) => (
              <div key={stat.label} style={{ flex: '1 1 140px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color || STAT_COLORS[idx % STAT_COLORS.length], fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Marquee Tech Stack Strip */}
        {isEnabled(config, 'hero', 'heroMarquee') && effects.marquee !== false && (
          <div style={{ marginTop: '2.5rem', width: '100%' }}>
            {/* Centered Heading */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem', padding: '0 1.5rem', textAlign: 'center' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-color))' }} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>
                Core Technologies &amp; Tooling
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-color), transparent)' }} />
            </div>

            {/* Edge-to-edge Marquee Track */}
            <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', overflow: 'hidden' }}>
              <div className="marquee-container">
              <div className="marquee-track hero-marquee-track">
                {trackItems.map((item, idx) => (
                  <span
                    key={`t1-${idx}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.45rem 1.15rem',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="marquee-track hero-marquee-track" aria-hidden="true">
                {trackItems.map((item, idx) => (
                  <span
                    key={`t2-${idx}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.45rem 1.15rem',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default Hero;
