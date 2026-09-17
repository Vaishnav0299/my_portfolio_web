import { Hono } from 'hono';
import { syncBatchSchema } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkIdempotency, recordOperation } from '../lib/idempotency.js';
import { db } from '../db/client.js';
import { projects, skills, timeline, bio, syncLog } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { isDbConfigured, localStore } from '../db/localStore.js';

const sync = new Hono();

/**
 * GET /api/sync/logs
 * Fetches recent sync_log audit entries.
 */
sync.get('/logs', authMiddleware, async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db
        .select()
        .from(syncLog)
        .orderBy(desc(syncLog.appliedAt))
        .limit(50);
      return c.json({ success: true, data: rows });
    } catch (err) {
      console.warn('[Sync] Failed to query sync_log from DB, falling back to local memory:', (err as Error).message);
    }
  }

  const inMem = Array.from(localStore.syncLog).map((opId, idx) => ({
    operationId: opId,
    appliedAt: new Date(Date.now() - idx * 1000).toISOString(),
    url: 'local-store',
    method: 'SYNC',
  }));
  return c.json({ success: true, data: inMem });
});

/**
 * POST /api/sync
 * Batch endpoint for flushing the offline sync queue.
 * Each operation is checked for idempotency before processing.
 * Safe to call multiple times — duplicate operation_ids are skipped.
 */
sync.post('/', authMiddleware, async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parseResult = syncBatchSchema.safeParse(raw);
  if (!parseResult.success) {
    return c.json({ success: false, error: 'Validation failed', details: parseResult.error.format() }, 400);
  }
  const { operations } = parseResult.data;
  const results: Array<{ operationId: string; status: 'applied' | 'skipped' | 'error'; error?: string }> = [];

  for (const op of operations) {
    // Check idempotency: skip if already applied
    const alreadyApplied = await checkIdempotency(op.operationId);
    if (alreadyApplied) {
      console.log(`[Sync] Skipped already applied operation ${op.operationId}`);
      results.push({ operationId: op.operationId, status: 'skipped' });
      continue;
    }

    try {
      await applyOperation(op.method, op.url, op.body);
      await recordOperation(op.operationId, op.url, op.method);
      console.log(`[Sync] Successfully applied & recorded ${op.method} ${op.url} (opId: ${op.operationId})`);
      results.push({ operationId: op.operationId, status: 'applied' });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Sync] Operation ${op.operationId} failed:`, errMsg);
      results.push({ operationId: op.operationId, status: 'error', error: errMsg });
    }
  }

  const applied = results.filter(r => r.status === 'applied').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  return c.json({
    success: true,
    summary: { total: operations.length, applied, skipped, errors },
    results,
  });
});

/**
 * Applies a queued write operation by dispatching on URL pattern + HTTP method.
 * Dual-mode: writes to Supabase database or local in-memory store.
 */
async function applyOperation(method: string, url: string, body: unknown) {
  const urlObj = new URL(`http://localhost${url.startsWith('/') ? url : '/' + url}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '');

  // /api/projects/admin[/:id] or /projects/admin[/:id] or /api/admin/projects[/:id] or /admin/projects[/:id]
  const projectMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/projects|projects\/admin)(?:\/([^/?#]+))?$/);
  if (projectMatch) {
    const id = projectMatch[1] ? parseInt(projectMatch[1], 10) : null;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(projects).values(body as any); }
        if (method === 'PUT' && id) { await db.update(projects).set(body as any).where(eq(projects.id, id)); }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting project id=${id} from Supabase database`);
          await db.delete(projects).where(eq(projects.id, id));
        }
      } catch (err) {
        console.warn('[Sync] Database write failed, updating local store:', (err as Error).message);
      }
    }

    // Keep local fallback in sync
    if (method === 'POST') {
      const p = body as any;
      localStore.projects.push({ ...p, id: ++localStore.nextProjectId });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.projects.findIndex(p => p.id === id);
      if (idx !== -1) localStore.projects[idx] = { ...localStore.projects[idx], ...(body as any) };
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.projects = localStore.projects.filter(p => p.id !== id);
      return;
    }
  }

  // /api/skills/admin[/:id] or /skills/admin[/:id] or /api/admin/skills[/:id] or /admin/skills[/:id]
  const skillMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/skills|skills\/admin)(?:\/([^/?#]+))?$/);
  if (skillMatch) {
    const id = skillMatch[1] ? parseInt(skillMatch[1], 10) : null;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(skills).values(body as any); }
        if (method === 'PUT' && id) { await db.update(skills).set(body as any).where(eq(skills.id, id)); }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting skill id=${id} from Supabase database`);
          await db.delete(skills).where(eq(skills.id, id));
        }
      } catch (err) {
        console.warn('[Sync] Database write failed, updating local store:', (err as Error).message);
      }
    }

    if (method === 'POST') {
      const s = body as any;
      localStore.skills.push({ ...s, id: ++localStore.nextSkillId });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.skills.findIndex(s => s.id === id);
      if (idx !== -1) localStore.skills[idx] = { ...localStore.skills[idx], ...(body as any) };
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.skills = localStore.skills.filter(p => p.id !== id);
      return;
    }
  }

  // /api/timeline/admin[/:id] or /timeline/admin[/:id] or /api/admin/timeline[/:id] or /admin/timeline[/:id]
  const timelineMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/timeline|timeline\/admin)(?:\/([^/?#]+))?$/);
  if (timelineMatch) {
    const id = timelineMatch[1] ? parseInt(timelineMatch[1], 10) : null;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(timeline).values(body as any); }
        if (method === 'PUT' && id) { await db.update(timeline).set(body as any).where(eq(timeline.id, id)); }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting timeline id=${id} from Supabase database`);
          await db.delete(timeline).where(eq(timeline.id, id));
        }
      } catch (err) {
        console.warn('[Sync] Database write failed, updating local store:', (err as Error).message);
      }
    }

    if (method === 'POST') {
      const t = body as any;
      localStore.timeline.push({ ...t, id: ++localStore.nextTimelineId });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.timeline.findIndex(t => t.id === id);
      if (idx !== -1) localStore.timeline[idx] = { ...localStore.timeline[idx], ...(body as any) };
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.timeline = localStore.timeline.filter(t => t.id !== id);
      return;
    }
  }

  // /api/bio/admin or /bio/admin or /api/admin/bio or /admin/bio
  const bioMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/bio|bio\/admin)\/?$/);
  if (bioMatch && method === 'PUT') {
    if (isDbConfigured) {
      try {
        await db.update(bio).set(body as any);
      } catch (err) {
        console.warn('[Sync] Database bio write failed:', (err as Error).message);
      }
    }
    localStore.bio = { ...localStore.bio, ...(body as any) };
    return;
  }

  throw new Error(`Unsupported sync operation: ${method} ${pathname}`);
}

export default sync;
