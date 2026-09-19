import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Database, AlertCircle } from 'lucide-react';
import { useHealthCheck } from '../lib/useHealthCheck';
import { getPendingCount, flushQueue } from '../lib/syncManager';
import { api } from '../lib/api';

export function StatusIndicator() {
  const { isOnline, latencyMs } = useHealthCheck();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 20,
        background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        fontSize: '0.8rem',
        fontWeight: 600,
        color: isOnline ? '#10b981' : '#ef4444',
        transition: 'all 0.3s ease',
      }}
      title={isOnline ? `Connected to Supabase PostgreSQL (${latencyMs ?? 0}ms)` : 'Database offline or unreachable'}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isOnline ? '#10b981' : '#ef4444',
          boxShadow: isOnline ? '0 0 6px #10b981' : '0 0 6px #ef4444',
          animation: isOnline ? 'pulse 2s infinite' : 'none',
        }}
      />
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 20,
        background: 'rgba(234,179,8,0.1)',
        border: '1px solid rgba(234,179,8,0.3)',
        color: '#eab308',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
      {count} change{count !== 1 ? 's' : ''} pending
    </div>
  );
}

export function ManualSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [justSynced, setJustSynced] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setErrorMsg(null);

    try {
      // 1. Flush any pending offline changes from IndexedDB to server/DB
      await flushQueue().catch(() => {});

      // 2. Trigger fresh pull and reload from Supabase database
      const res = await api.syncDb();

      // 3. Update sync state
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSynced(timeStr);
      setJustSynced(true);

      // 4. Dispatch global event so all active admin screens re-render fresh data immediately
      window.dispatchEvent(new CustomEvent('db-synced', { detail: res }));

      setTimeout(() => setJustSynced(false), 3500);
    } catch (err) {
      console.error('[ManualSync] Failed to sync database:', err);
      setErrorMsg(err.message || 'Sync failed');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <button
        type="button"
        onClick={handleManualSync}
        disabled={isSyncing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 20,
          background: justSynced
            ? 'rgba(16,185,129,0.15)'
            : errorMsg
            ? 'rgba(239,68,68,0.15)'
            : 'var(--bg-primary)',
          border: `1px solid ${
            justSynced
              ? 'rgba(16,185,129,0.4)'
              : errorMsg
              ? 'rgba(239,68,68,0.4)'
              : 'var(--border-color)'
          }`,
          color: justSynced
            ? '#10b981'
            : errorMsg
            ? '#ef4444'
            : 'var(--text-primary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSyncing ? '0 0 10px rgba(139,92,246,0.3)' : 'none',
        }}
        title="Click to manually push all edits to Supabase DB and pull the latest fresh data"
      >
        {isSyncing ? (
          <>
            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
            <span>Syncing DB...</span>
          </>
        ) : justSynced ? (
          <>
            <Check size={13} style={{ color: '#10b981' }} />
            <span>Synced Live!</span>
          </>
        ) : errorMsg ? (
          <>
            <AlertCircle size={13} style={{ color: '#ef4444' }} />
            <span>Sync Error</span>
          </>
        ) : (
          <>
            <RefreshCw size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Sync DB</span>
          </>
        )}
      </button>

      {lastSynced && !justSynced && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Synced {lastSynced}
        </span>
      )}
    </div>
  );
}
