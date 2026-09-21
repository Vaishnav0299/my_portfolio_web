import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, Mail, ArrowUp } from 'lucide-react';
import { api } from '../lib/api';

export function Footer() {
  const [bio, setBio] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getBio()
      .then((res) => { if (isMounted && res?.data) setBio(res.data); })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const name = bio?.name || 'Vaishnav Gaware';
  const title = bio?.title || 'Full-Stack Developer & Systems Engineer';
  const location = bio?.location || 'Pune, India';
  const githubUrl = bio?.github || 'https://github.com/Vaishnav0299';
  const linkedinUrl = bio?.linkedin || 'https://www.linkedin.com/in/vaishnav-gaware';
  const twitterUrl = bio?.twitter || 'https://twitter.com/vaishnav0299';
  const emailAddr = bio?.email || 'vaishnavgaware1@gmail.com';
  const footerDesc = bio?.footerTagline || `Crafted by ${name}. ${title} based in ${location}.`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)', padding: '3.5rem 1.5rem 2.5rem' }}>
      <div className="footer-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top footer row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
              <span>VG<span style={{ color: 'var(--accent-primary)' }}>.dev</span></span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.6 }}>
              {footerDesc}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All services &amp; APIs operational</span>
            </div>
          </div>

          {/* Quick links columns */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <a href="/#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Me</a>
                <a href="/#experience" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Experience</a>
                <a href="/#projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Projects</a>
                <a href="/#services" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Services</a>
                <a href="/#skills" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Skills</a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Explore
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <a href="/#writing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Writing</a>
                <a href="/#testimonials" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Reviews</a>
                <a href="/#now" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Now</a>
                <a href="/#uses" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Uses &amp; Setup</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a href={githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
              <Github size={15} /> GitHub
            </a>
            <a href={linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
              <Linkedin size={15} /> LinkedIn
            </a>
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                <Twitter size={15} /> Twitter
              </a>
            )}
            <a href={`mailto:${emailAddr}`} style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
              <Mail size={15} /> Email
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: '0.85rem',
            }}
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
