/**
 * useHealthCheck — Polls /api/health with exponential backoff
 * ─────────────────────────────────────────────────────────────
 * Returns { isOnline, latencyMs } and fires onServerReconnect()
 * when the server comes back up after being unreachable.
 *
 * Design notes:
 * - Normal interval: 15s (avoids hammering the DB on every render)
 * - On failure: doubles interval up to 120s (circuit-breaker-like behaviour)
 * - On reconnect: resets to 15s and triggers sync queue flush
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api';
import { onServerReconnect } from './syncManager';

const NORMAL_INTERVAL_MS  = 60_000;  // 60s normal poll
const MAX_INTERVAL_MS     = 120_000; // 2min max backoff

export function useHealthCheck() {
  const [isOnline,   setIsOnline]   = useState(true);
  const [latencyMs,  setLatencyMs]  = useState(null);

  const intervalRef  = useRef(NORMAL_INTERVAL_MS);
  const timerRef     = useRef(null);
  const wasOnlineRef = useRef(true);

  const checkHealth = useCallback(async () => {
    try {
      const result = await api.health();
      setIsOnline(true);
      setLatencyMs(result.latencyMs ?? null);

      // Was previously offline → trigger sync queue flush
      if (!wasOnlineRef.current) {
        wasOnlineRef.current = true;
        onServerReconnect(); // non-blocking
      }

      // Reset to normal polling interval
      intervalRef.current = NORMAL_INTERVAL_MS;
    } catch {
      setIsOnline(false);
      setLatencyMs(null);
      wasOnlineRef.current = false;

      // Exponential backoff
      intervalRef.current = Math.min(intervalRef.current * 2, MAX_INTERVAL_MS);
    }

    // Schedule next poll
    timerRef.current = setTimeout(checkHealth, intervalRef.current);
  }, []);

  useEffect(() => {
    // Initial check immediately on mount
    checkHealth();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [checkHealth]);

  return { isOnline, latencyMs };
}
