import React, { useState, useEffect } from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    quote: 'Vaishnav took our fragmented MVP and turned it into a product investors actually understood. His architecture decisions paid off within months — our API latency dropped by 80% after the refactor he led.',
    name: 'Sarah Mitchell',
    title: 'CTO',
    company: 'Stackline Labs',
    avatarInitials: 'SM',
    rating: 5,
  },
  {
    id: 2,
    quote: 'We hired Vaishnav for a 6-week sprint and ended up extending for the full quarter. He ships fast, communicates clearly, and genuinely cares about the business outcome — not just the code.',
    name: 'David Okonkwo',
    title: 'Founder & CEO',
    company: 'Northwave Digital',
    avatarInitials: 'DO',
    rating: 5,
  },
  {
    id: 3,
    quote: 'Our old dashboard was a liability. Vaishnav modernized the entire frontend in three weeks, lifted our Lighthouse score from 52 to 98, and the conversion bump was immediate. Worth every rupee.',
    name: 'Priya Nair',
    title: 'Product Lead',
    company: 'Ledger Inc.',
    avatarInitials: 'PN',
    rating: 5,
  },
  {
    id: 4,
    quote: 'Rare combination: senior-level engineering depth with a designer\'s eye. The real-time collaboration feature he built just works — our users stopped emailing us about sync bugs entirely.',
    name: 'Marcus Feld',
    title: 'VP Engineering',
    company: 'Pulse',
    avatarInitials: 'MF',
    rating: 5,
  },
  {
    id: 5,
    quote: 'As a non-technical founder, I needed someone who could translate vague ideas into shippable software. Vaishnav did exactly that — and the documentation he left behind let my team take over confidently.',
    name: 'Aisha Rahman',
    title: 'Founder',
    company: 'Orbit AI',
    avatarInitials: 'AR',
    rating: 5,
  },
];

function TestimonialCard({ item, showStars, showAvatars }) {
  const authorName = item.name || item.author;
  const authorRole = item.title || item.role;
  const initials = item.avatarInitials || (authorName || 'A').slice(0, 2).toUpperCase();

  return (
    <div className="testimonial-card glass-card">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {showStars ? (
            <div style={{ display: 'flex', gap: '3px' }}>
              {[...Array(item.rating || 5)].map((_, i) => (
                <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
          ) : <div />}
          <MessageSquareQuote size={22} style={{ color: 'var(--accent-primary)', opacity: 0.4 }} />
        </div>
        <p className="testimonial-quote">
          &ldquo;{item.quote}&rdquo;
        </p>
      </div>

      <div className="testimonial-author">
        {showAvatars && (
          <div className="testimonial-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.avatar && (item.avatar.startsWith('http') || item.avatar.startsWith('/')) ? (
              <img
                src={item.avatar}
                alt={authorName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              initials
            )}
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {authorName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {authorRole} &middot; {item.company}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { config } = useConfig();
  const [items, setItems] = useState(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    let isMounted = true;
    api.getTestimonials()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setItems(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const useMarquee = isEnabled(config, 'testimonials', 'testimonialsMarquee') && config?.effects?.marquee !== false;
  const showStars = isEnabled(config, 'testimonials', 'testimonialsStars');
  const showAvatars = isEnabled(config, 'testimonials', 'testimonialsAvatars');

  // Ensure enough items in each track to span wide monitors seamlessly
  const marqueeItems = items.length > 0
    ? (items.length < 6 ? [...items, ...items, ...items].slice(0, Math.max(6, items.length * 2)) : items)
    : [];

  return (
    <section id="testimonials" className="section" style={{ padding: '5rem 0', background: 'var(--bg-main)' }}>
      <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
          SOCIAL PROOF
        </span>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
          What Teams &amp; Clients Say
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
          Feedback from startup founders, engineering leads, and cross-functional collaborators.
        </p>
      </div>

      {useMarquee ? (
        <div
          key={`marquee-${items.map((i) => `${i.id}-${i.name || i.author}`).join('_')}`}
          className="marquee-container"
          style={{ padding: '1.25rem 0', width: '100%' }}
        >
          <div className="marquee-track">
            {marqueeItems.map((item, index) => (
              <TestimonialCard
                key={`tm1-${item.id || index}-${index}`}
                item={item}
                showStars={showStars}
                showAvatars={showAvatars}
              />
            ))}
          </div>

          <div className="marquee-track" aria-hidden="true">
            {marqueeItems.map((item, index) => (
              <TestimonialCard
                key={`tm2-${item.id || index}-${index}`}
                item={item}
                showStars={showStars}
                showAvatars={showAvatars}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem' }}>
          {items.map((item, index) => (
            <TestimonialCard
              key={item.id || index}
              item={item}
              showStars={showStars}
              showAvatars={showAvatars}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Testimonials;
