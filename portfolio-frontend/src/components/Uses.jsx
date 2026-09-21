import React, { useState, useEffect } from 'react';
import { Laptop, Terminal, Layers, Cpu } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_USES = [
  {
    category: 'Editor & Terminal',
    items: [
      { name: 'VS Code', note: 'Primary editor with Vim keybindings' },
      { name: 'JetBrains Mono', note: 'Font for code & terminal UI' },
      { name: 'Warp / PowerShell', note: 'Daily terminal environment' },
      { name: 'zsh + starship', note: 'Git status & node prompt' },
    ],
  },
  {
    category: 'Frontend Architecture',
    items: [
      { name: 'React / Next.js', note: 'Component architectures & SSR/edge' },
      { name: 'TypeScript', note: 'Strict typing across entire stack' },
      { name: 'Tailwind CSS', note: 'Design tokens via CSS variables' },
      { name: 'Framer Motion', note: 'Micro-interactions & transitions' },
    ],
  },
  {
    category: 'Backend & Data',
    items: [
      { name: 'Node.js + Hono / Express', note: 'REST APIs & WebSocket gateways' },
      { name: 'PostgreSQL & pgvector', note: 'Relational data & vector embeddings' },
      { name: 'Prisma / Drizzle ORM', note: 'Type-safe queries & migrations' },
      { name: 'Redis', note: 'Caching, streaming queues, rate limits' },
    ],
  },
  {
    category: 'Tools & Infrastructure',
    items: [
      { name: 'Git & GitHub', note: 'Trunk-based commits & clean PRs' },
      { name: 'GitHub Actions', note: 'CI/CD lint, test & auto-deploy' },
      { name: 'Docker', note: 'Local container parity with production' },
      { name: 'Vercel', note: 'Edge deployments & preview branches' },
    ],
  },
];

export function Uses() {
  const [categories, setCategories] = useState(DEFAULT_USES);

  useEffect(() => {
    let isMounted = true;
    api.getUses()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="uses" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            SETUP &amp; GEAR
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Tech Stack, Gear &amp; Software
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            The tools, runtime environments, and workflows I reach for every day.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {categories.map((cat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>{cat.category}</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ borderBottom: i < cat.items.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: i < cat.items.length - 1 ? '0.75rem' : 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Uses;
