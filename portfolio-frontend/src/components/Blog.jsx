import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Clock, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { BlogModal } from './BlogModal';

const DEFAULT_POSTS = [
  {
    id: 1,
    slug: 'crdts-for-ot-veterans',
    title: 'CRDTs for OT Veterans',
    excerpt: 'If you have shipped operational transform-based collaboration, CRDTs feel alien. Here is the mental model that finally clicked — and why you would reach for them next time.',
    category: 'Engineering',
    readTime: '8 min',
    date: '2026-08-21',
    accent: 'violet',
    body: [
      { type: 'p', text: 'Operational transforms (OT) are the model most of us inherited from Google Docs. You send ops, the server sequences them, and a transform function resolves concurrent edits. It works — until it doesn\'t.' },
      { type: 'p', text: 'The first time two people edit the same paragraph on a flaky network, you learn about the unfixable divergence: your transform function has a bug, the server ordered ops differently than the client predicted, and now the documents are silently out of sync.' },
      { type: 'h', text: 'The CRDT promise' },
      { type: 'p', text: 'Conflict-free Replicated Data Types (CRDTs) flip the contract: every concurrent edit is, by construction, commutative. Merge order doesn\'t matter. You cannot get divergence because the math forbids it.' },
      { type: 'code', text: '// Yjs handles merge order commutatively\nconst ydoc = new Y.Doc();\nconst ytext = ydoc.getText("content");\nytext.insert(0, "Hello World");' },
      { type: 'callout', text: 'Rule of thumb: if your concurrent-edit count per document is under ~20 and you do not need offline, stay with OT. Past that line — or the moment offline-first becomes a requirement — CRDTs buy peace of mind.' },
    ],
  },
  {
    id: 2,
    slug: 'rag-that-doesnt-hallucinate',
    title: 'RAG That Doesn\'t Hallucinate',
    excerpt: 'Naive retrieval-augmented generation gives confident-but-wrong answers. Here is the confidence scoring, citation spans, and human fallback we shipped to hit 94% accuracy.',
    category: 'AI',
    readTime: '11 min',
    date: '2026-07-14',
    accent: 'emerald',
    body: [
      { type: 'p', text: 'The first version of Orbit was a textbook RAG pipeline: chunk the docs, embed them, retrieve top-K by cosine similarity, and feed into the LLM as context. It failed quietly in production with confident wrongness.' },
      { type: 'h', text: 'Step 1: Make retrieval honest' },
      { type: 'code', text: 'const confidence = (sim * 0.6) + (freshness * 0.25) + (authority * 0.15);\nif (confidence < 0.62) return escalateToHuman(context);' },
      { type: 'h', text: 'Step 2: Mandatory citations' },
      { type: 'p', text: 'Every sentence in the answer must be backed by a citation span pointing to a specific chunk. No citation, no sentence. This single rule eliminated ~70% of confident-wrong answers.' },
      { type: 'callout', text: 'The single highest-leverage change was mandatory citation spans. Not a fancier embedding model, not a re-ranker — just forcing every answer sentence to cite a specific source chunk.' },
    ],
  },
  {
    id: 3,
    slug: 'multi-tenant-rls-patterns',
    title: 'Multi-tenant RLS Patterns That Survive Audits',
    excerpt: 'A subtle RLS bug in a multi-tenant finance app isn\'t a bug — it\'s a breach. Here\'s the defense-in-depth approach that passed a third-party pen-test with zero criticals.',
    category: 'Architecture',
    readTime: '9 min',
    date: '2026-06-03',
    accent: 'amber',
    body: [
      { type: 'p', text: 'Multi-tenant finance is the domain where a missed WHERE clause stops being a bug and becomes a breach. Data isolation cannot rely solely on developers remembering to filter by tenant_id.' },
      { type: 'h', text: 'Defense in depth: two independent layers' },
      { type: 'code', text: 'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_isolation ON transactions\n  USING (tenant_id = current_setting(\'app.current_tenant\')::uuid);' },
      { type: 'p', text: 'Every connection sets app.current_tenant at transaction start. If a query forgets the tenant_id filter, RLS silently scopes the result set to the tenant bound to the connection.' },
    ],
  },
];

export function Blog() {
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getBlogPosts()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setPosts(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="writing" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            THOUGHTS &amp; ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Technical Writing &amp; Notes
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            Hard-learned lessons from real production systems — CRDTs, RAG reliability, and PostgreSQL security.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card"
              style={{
                padding: '2rem',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedPost(post)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {post.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {post.excerpt}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {post.date}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <span>Read Article</span>
                  <ArrowRight size={15} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BlogModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
      />
    </section>
  );
}

export default Blog;
