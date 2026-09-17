import { db } from '../db/client.js';
import { syncLog } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { isDbConfigured, localStore } from '../db/localStore.js';

/**
 * Checks if an operation has already been applied.
 * Dual-mode: checks Supabase database or local memory set.
 */
export async function checkIdempotency(operationId: string): Promise<boolean> {
  if (localStore.syncLog.has(operationId)) {
    return true;
  }

  if (isDbConfigured) {
    try {
      const [existing] = await db
        .select({ operationId: syncLog.operationId })
        .from(syncLog)
        .where(eq(syncLog.operationId, operationId))
        .limit(1);

      if (existing) {
        localStore.syncLog.add(operationId);
        return true;
      }
    } catch (err) {
      console.warn('[Idempotency] DB check failed, using local tracking:', (err as Error).message);
    }
  }

  return false;
}

/**
 * Records a successfully applied operation to prevent future duplicates.
 */
export async function recordOperation(
  operationId: string,
  url: string,
  method: string
): Promise<void> {
  localStore.syncLog.add(operationId);

  if (isDbConfigured) {
    try {
      await db.insert(syncLog).values({ operationId, url, method });
    } catch (err) {
      console.warn('[Idempotency] DB record failed, preserved in local memory:', (err as Error).message);
    }
  }
}
