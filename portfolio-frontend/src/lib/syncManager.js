/**
 * Sync Manager — Offline Queue Processor
 * ─────────────────────────────────────────
 * Handles the full write lifecycle for admin operations:
 *
 * ONLINE path:  write → try server immediately → success → done
 * OFFLINE path: write → queue locally (IndexedDB) → on reconnect → flush all queued ops via /api/sync
 *
 * Key features:
 * - Exponential backoff: 1s → 2s → 4s → 8s → 16s → max 60s
 * - Idempotent: every op carries a UUID (operation_id) — server deduplicates on retry
 * - Event-based: dispatches 'sync-queue-change' CustomEvent on queue mutations
 * - Non-blocking: all retries happen in background without blocking UI
 */

import { api } from './api';
import {
  enqueueOperation,
  getPendingOperations,
  removeOperations,
  getPendingCount,
} from './db';

// Retry state
let retryTimer = null;
let retryDelay = 1000; // ms — starts at 1s
const MAX_RETRY_DELAY = 60_000; // 60s ceiling

/**
 * Notify UI that the sync queue has changed (SyncQueueBadge listens for this).
 */
function notifyQueueChange() {
  window.dispatchEvent(new CustomEvent('sync-queue-change'));
}

/**
 * Perform a write operation with offline support.
 * @param {{ method: string, url: string, body?: unknown }} op
 * @returns {{ success: boolean, data?: unknown, queued?: boolean }}
 */
export async function writeWithSync(op) {
  try {
    // 1. Enqueue locally first (ensures durability even if browser closes)
    const operationId = await enqueueOperation(op);
    notifyQueueChange();

    // 2. Try immediate server write
    const result = await api.syncBatch([{
      operationId,
      method: op.method,
      url: op.url,
      body: op.body,
      timestamp: Date.now(),
    }]);

    // 3. On success: remove from local queue
    const pending = await getPendingOperations();
    const applied = pending.filter(p => p.operationId === operationId);
    if (applied.length > 0) {
      await removeOperations(applied.map(p => p.id));
      notifyQueueChange();
    }

    return { success: true, data: result };
  } catch (err) {
    // Server unreachable — operation stays in local queue
    console.warn('[SyncManager] Server write failed, queued locally:', err.message);
    scheduleRetry();
    return { success: false, queued: true, error: err.message };
  }
}

/**
 * Flush all pending operations from IndexedDB to the server.
 * Called when health check detects server is back online.
 */
export async function flushQueue() {
  const pending = await getPendingOperations();
  if (pending.length === 0) return;

  console.log(`[SyncManager] Flushing ${pending.length} queued operations...`);

  try {
    const batch = pending.map(op => ({
      operationId: op.operationId,
      method: op.method,
      url: op.url,
      body: op.body,
      timestamp: op.timestamp,
    }));

    const result = await api.syncBatch(batch);

    // Remove all operations that were applied or skipped (not errored)
    const appliedIds = pending
      .filter((_, i) => result.results[i]?.status !== 'error')
      .map(op => op.id);

    if (appliedIds.length > 0) {
      await removeOperations(appliedIds);
      notifyQueueChange();
    }

    // Reset backoff on successful flush
    retryDelay = 1000;
    console.log(`[SyncManager] Flush complete:`, result.summary);
  } catch (err) {
    console.warn('[SyncManager] Flush failed, will retry:', err.message);
    scheduleRetry();
  }
}

/**
 * Schedule a retry with exponential backoff.
 */
function scheduleRetry() {
  if (retryTimer) clearTimeout(retryTimer);

  retryTimer = setTimeout(async () => {
    retryTimer = null;
    const count = await getPendingCount();
    if (count > 0) {
      await flushQueue();
    }
  }, retryDelay);

  // Exponential backoff with ceiling
  retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
}

/**
 * Called by useHealthCheck when server comes back online.
 * Resets backoff and flushes immediately.
 */
export async function onServerReconnect() {
  retryDelay = 1000;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  await flushQueue();
}

export { getPendingCount };
