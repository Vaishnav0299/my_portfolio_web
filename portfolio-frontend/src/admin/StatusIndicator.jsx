import React from 'react';
import { useHealthCheck } from '../lib/useHealthCheck';
import { getPendingCount } from '../lib/syncManager';
import { useState, useEffect } from 'react';

export function StatusIndicator() {
  const { isOnline, latencyMs } = useHealthCheck();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.35rem 0.75rem', borderRadius: 20,
      background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      fontSize: '0.8rem', fontWeight: 600,
      color: isOnline ? '#10b981' : '#ef4444',
      transition: 'all 0.3s ease',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isOnline ? '#10b981' : '#ef4444',
        boxShadow: isOnline ? '0 0 6px #10b981' : '0 0 6px #ef4444',
        animation: isOnline ? 'pulse 2s infinite' : 'none',
      }} />
      {isOnline
        ? `Connected${latencyMs != null ? ` · ${latencyMs}ms` : ''}`
        : 'DB Offline'}
    </div>
  );
}

export function SyncQueueBadge() {
  const [count, setCount] = useState(0);

  const updateCount = async () => {
    const n = await getPendingCount();
    setCount(n);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('sync-queue-change', updateCount);
    return () => window.removeEventListener('sync-queue-change', updateCount);
  }, []);

  if (count === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.35rem 0.75rem', borderRadius: 20,
      background: 'rgba(234,179,8,0.1)',
      border: '1px solid rgba(234,179,8,0.3)',
      color: '#eab308', fontSize: '0.8rem', fontWeight: 600,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
      {count} change{count !== 1 ? 's' : ''} pending
    </div>
  );
}
