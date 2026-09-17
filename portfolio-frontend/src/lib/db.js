/**
 * Dexie.js IndexedDB — Offline Sync Queue Store
 * ───────────────────────────────────────────────
 * Stores admin write operations locally when the server is unreachable.
 * The syncManager flushes this queue when connectivity is restored.
 *
 * Design notes:
 * - Each operation gets a UUID v4 as operationId (used for server-side idempotency)
 * - Operations are stored with a timestamp for ordering and TTL management
 * - The store is append-only; operations are deleted after confirmed server ACK
 */
import Dexie from 'dexie';

const db = new Dexie('PortfolioAdminDB');

db.version(1).stores({
  sync_queue: '++id, operationId, method, url, timestamp',
});

export const syncQueue = db.sync_queue;

/**
 * Generates a UUID v4 for idempotency keys.
 */
export function generateOperationId() {
  return crypto.randomUUID();
}

/**
 * Adds an operation to the local IndexedDB queue.
 */
export async function enqueueOperation({ method, url, body }) {
  const operationId = generateOperationId();
  await syncQueue.add({
    operationId,
    method,
    url,
    body: body ?? null,
    timestamp: Date.now(),
  });
  return operationId;
}

/**
 * Returns all pending operations sorted by timestamp (oldest first).
 */
export async function getPendingOperations() {
  return syncQueue.orderBy('timestamp').toArray();
}

/**
 * Removes successfully synced operations from the queue.
 */
export async function removeOperations(ids) {
  await syncQueue.bulkDelete(ids);
}

/**
 * Returns the count of pending operations (for SyncQueueBadge).
 */
export async function getPendingCount() {
  return syncQueue.count();
}

export default db;
