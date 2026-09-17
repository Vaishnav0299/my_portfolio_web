import React, { useState, useEffect } from 'react';
import { Package, GitFork, Clock, Mail, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { getPendingCount } from '../lib/syncManager';

export function AdminDashboard() {
  const [projectCount, setProjectCount] = useState('—');
  const [pendingSync,  setPendingSync]  = useState(0);
  const [lastChecked,  setLastChecked]  = useState(null);

  useEffect(() => {
    api.getProjects()
      .then(res => setProjectCount(res.data.length))
      .catch(() => {});

    getPendingCount().then(setPendingSync);

    setLastChecked(new Date().toLocaleTimeString());

    const unsub = () => window.addEventListener('sync-queue-change', () =>
      getPendingCount().then(setPendingSync)
    );
    unsub();
    return () => window.removeEventListener('sync-queue-change', unsub);
  }, []);

  const metrics = [
    { icon: Package,   label: 'Projects',        value: projectCount,  color: '#8b5cf6' },
    { icon: GitFork,   label: 'Pending Sync Ops', value: pendingSync,   color: '#eab308' },
    { icon: Clock,     label: 'Last Health Check', value: lastChecked ?? '—', color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Overview of your portfolio content and system status.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            style={{
              padding: '1.5rem', borderRadius: 16,
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${color}22`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '0.875rem',
            }}>
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Quick Navigation</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Use the sidebar to manage <strong>Projects</strong>, <strong>Skills</strong>, <strong>Timeline</strong>, and <strong>Bio</strong>.
          Changes made while offline are queued locally and flushed automatically when the connection is restored.
        </p>
      </div>
    </div>
  );
}
