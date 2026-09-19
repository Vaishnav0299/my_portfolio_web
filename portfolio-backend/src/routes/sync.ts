import { Hono } from 'hono';
import { syncBatchSchema } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkIdempotency, recordOperation } from '../lib/idempotency.js';
import { db } from '../db/client.js';
import { projects, skills, timeline, bio, syncLog, services, testimonials, faqs, blog, siteConfig } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { isDbConfigured, localStore } from '../db/localStore.js';
import { syncFromDatabase, pushToDatabase, writeBackToLocalStoreFile } from '../db/dbSync.js';

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

import { exec } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Executes the Python GitHub telemetry synchronization automation script.
 */
export function runPythonGithubSync(): Promise<{ success: boolean; output?: string; error?: string }> {
  return new Promise((resolve) => {
    const candidates = [
      path.resolve(process.cwd(), 'scripts/sync_github.py'),
      path.resolve(process.cwd(), '../scripts/sync_github.py'),
    ];
    const scriptPath = candidates.find((p) => fs.existsSync(p));
    if (!scriptPath) {
      console.warn('[Sync] Python sync script not found in search paths.');
      return resolve({ success: false, error: 'scripts/sync_github.py not found' });
    }

    console.log('[Sync] Launching Python GitHub sync automation:', scriptPath);
    exec(`python "${scriptPath}" --fetch`, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.warn('[Sync] Python GitHub sync error:', error.message);
        resolve({ success: false, error: error.message });
      } else {
        console.log('[Sync] Python GitHub telemetry automation completed successfully.');
        resolve({ success: true, output: stdout.trim() });
      }
    });
  });
}

/**
 * POST /api/sync/db
 * Trigger an immediate manual re-sync from Supabase into server memory AND execute Python GitHub telemetry sync.
 */
sync.post('/db', authMiddleware, async (c) => {
  try {
    const [result, githubResult] = await Promise.all([
      syncFromDatabase(),
      runPythonGithubSync().catch((err) => ({ success: false, error: err.message })),
    ]);

    return c.json({
      success: result.success || result.tables.length > 0,
      syncedTables: result.tables,
      fileUpdated: result.fileUpdated,
      githubSync: githubResult,
      errors: result.errors,
      counts: {
        projects: localStore.projects.length,
        skills: localStore.skills.length,
        timeline: localStore.timeline.length,
        services: localStore.services.length,
        testimonials: localStore.testimonials.length,
        faqs: localStore.faqs.length,
        blog: localStore.blog.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/sync/push
 * Push in-memory store records (projects, skills, timeline, bio) to Supabase database.
 */
sync.post('/push', authMiddleware, async (c) => {
  try {
    const result = await pushToDatabase();
    return c.json({
      success: result.success,
      pushedTables: result.tables,
      errors: result.errors,
      counts: {
        projects: localStore.projects.length,
        skills: localStore.skills.length,
        timeline: localStore.timeline.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/sync/github
 * Explicitly trigger the Python GitHub automation script.
 */
sync.post('/github', authMiddleware, async (c) => {
  try {
    const result = await runPythonGithubSync();
    return c.json(result);
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/sync/db
 * Check database sync status and run fresh pull.
 */
sync.get('/db', authMiddleware, async (c) => {
  try {
    const result = await syncFromDatabase();
    return c.json({
      success: result.success || result.tables.length > 0,
      syncedTables: result.tables,
      errors: result.errors,
      counts: {
        projects: localStore.projects.length,
        skills: localStore.skills.length,
        timeline: localStore.timeline.length,
        services: localStore.services.length,
        testimonials: localStore.testimonials.length,
        faqs: localStore.faqs.length,
        blog: localStore.blog.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
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

  if (applied > 0) {
    writeBackToLocalStoreFile();
  }

  return c.json({
    success: true,
    summary: { total: operations.length, applied, skipped, errors },
    results,
  });
});

/**
 * Applies a queued write operation by dispatching on URL pattern + HTTP method.
 */
async function applyOperation(method: string, url: string, body: unknown) {
  const urlObj = new URL(`http://localhost${url.startsWith('/') ? url : '/' + url}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '');

  // /api/projects/admin[/:id] or /projects/admin[/:id] or /api/admin/projects[/:id] or /admin/projects[/:id]
  const projectMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/projects|projects\/admin)(?:\/([^/?#]+))?$/);
  if (projectMatch) {
    const id = projectMatch[1] ? parseInt(projectMatch[1], 10) : null;
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = (body || {}) as any;
    const liveVal = cleanData.live !== undefined ? (cleanData.live ?? '').trim() : undefined;
    const githubVal = cleanData.github !== undefined ? (cleanData.github ?? '').trim() : undefined;

    if (isDbConfigured) {
      try {
        if (method === 'POST') {
          await db.insert(projects).values({
            ...cleanData,
            live: (cleanData.live ?? '').trim(),
            github: (cleanData.github ?? '').trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);
        }
        if (method === 'PUT' && id) {
          await db.update(projects).set({
            ...cleanData,
            ...(liveVal !== undefined ? { live: liveVal } : {}),
            ...(githubVal !== undefined ? { github: githubVal } : {}),
            updatedAt: new Date(),
          } as any).where(eq(projects.id, id));
        }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting project id=${id} from Supabase database`);
          await db.delete(projects).where(eq(projects.id, id));
        }
      } catch (err) {
        console.error('[Sync] Database write failed for projects:', (err as Error).message);
        throw err;
      }
    }

    // Keep local fallback in sync
    if (method === 'POST') {
      localStore.projects.push({
        ...cleanData,
        live: (cleanData.live ?? '').trim(),
        github: (cleanData.github ?? '').trim(),
        id: ++localStore.nextProjectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        localStore.projects[idx] = {
          ...localStore.projects[idx],
          ...cleanData,
          ...(liveVal !== undefined ? { live: liveVal } : {}),
          ...(githubVal !== undefined ? { github: githubVal } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
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
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = (body || {}) as any;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(skills).values({ ...cleanData, updatedAt: new Date() } as any); }
        if (method === 'PUT' && id) { await db.update(skills).set({ ...cleanData, updatedAt: new Date() } as any).where(eq(skills.id, id)); }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting skill id=${id} from Supabase database`);
          await db.delete(skills).where(eq(skills.id, id));
        }
      } catch (err) {
        console.error('[Sync] Database write failed for skills:', (err as Error).message);
        throw err;
      }
    }

    if (method === 'POST') {
      localStore.skills.push({ ...cleanData, id: ++localStore.nextSkillId, updatedAt: new Date().toISOString() });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.skills.findIndex(s => s.id === id);
      if (idx !== -1) localStore.skills[idx] = { ...localStore.skills[idx], ...cleanData, updatedAt: new Date().toISOString() };
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.skills = localStore.skills.filter(s => s.id !== id);
      return;
    }
  }

  // /api/timeline/admin[/:id] or /timeline/admin[/:id] or /api/admin/timeline[/:id] or /admin/timeline[/:id]
  const timelineMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/timeline|timeline\/admin)(?:\/([^/?#]+))?$/);
  if (timelineMatch) {
    const id = timelineMatch[1] ? parseInt(timelineMatch[1], 10) : null;
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = (body || {}) as any;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(timeline).values({ ...cleanData, updatedAt: new Date() } as any); }
        if (method === 'PUT' && id) { await db.update(timeline).set({ ...cleanData, updatedAt: new Date() } as any).where(eq(timeline.id, id)); }
        if (method === 'DELETE' && id) {
          console.log(`[Sync] Deleting timeline id=${id} from Supabase database`);
          await db.delete(timeline).where(eq(timeline.id, id));
        }
      } catch (err) {
        console.error('[Sync] Database write failed for timeline:', (err as Error).message);
        throw err;
      }
    }

    if (method === 'POST') {
      localStore.timeline.push({ ...cleanData, id: ++localStore.nextTimelineId, updatedAt: new Date().toISOString() });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.timeline.findIndex(t => t.id === id);
      if (idx !== -1) localStore.timeline[idx] = { ...localStore.timeline[idx], ...cleanData, updatedAt: new Date().toISOString() };
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
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = (body || {}) as any;
    if (isDbConfigured) {
      try {
        await db.update(bio).set({ ...cleanData, updatedAt: new Date() } as any);
      } catch (err) {
        console.error('[Sync] Database bio write failed:', (err as Error).message);
        throw err;
      }
    }
    localStore.bio = { ...localStore.bio, ...cleanData, updatedAt: new Date().toISOString() };
    return;
  }

  // /api/testimonials/admin[/:id] or /testimonials/admin[/:id] or /api/admin/testimonials[/:id] or /admin/testimonials[/:id]
  const testimonialMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/testimonials|testimonials\/admin)(?:\/([^/?#]+))?$/);
  if (testimonialMatch) {
    const id = testimonialMatch[1] ? parseInt(testimonialMatch[1], 10) : null;
    const b = body as any;
    const nameVal = b?.name || b?.author || 'Anonymous';
    const titleVal = b?.title || b?.role || '';
    const avatarInitialsVal = b?.avatarInitials || (nameVal ? nameVal.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AN');
    const avatarVal = b?.avatar || '';

    const payload = {
      quote: b?.quote,
      name: nameVal,
      title: titleVal,
      company: b?.company || '',
      avatarInitials: avatarInitialsVal,
      avatar: avatarVal,
      accent: b?.accent || 'violet',
      rating: b?.rating ?? 5,
      sortOrder: b?.sortOrder ?? 0,
    };

    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(testimonials).values(payload as any); }
        if (method === 'PUT' && id) { await db.update(testimonials).set(payload as any).where(eq(testimonials.id, id)); }
        if (method === 'DELETE' && id) { await db.delete(testimonials).where(eq(testimonials.id, id)); }
      } catch (err) {
        console.error('[Sync] Database testimonials write failed:', (err as Error).message);
        throw err;
      }
    }

    if (method === 'POST') {
      localStore.testimonials.push({ ...payload, id: ++localStore.nextTestimonialId } as any);
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.testimonials.findIndex(t => t.id === id);
      if (idx !== -1) localStore.testimonials[idx] = { ...localStore.testimonials[idx], ...payload } as any;
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.testimonials = localStore.testimonials.filter(t => t.id !== id);
      return;
    }
  }

  // /api/services/admin[/:id] or /services/admin[/:id] or /api/admin/services[/:id] or /admin/services[/:id]
  const serviceMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/services|services\/admin)(?:\/([^/?#]+))?$/);
  if (serviceMatch) {
    const id = serviceMatch[1] ? parseInt(serviceMatch[1], 10) : null;
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = (body || {}) as any;
    if (isDbConfigured) {
      try {
        if (method === 'POST') { await db.insert(services).values({ ...cleanData, updatedAt: new Date() } as any); }
        if (method === 'PUT' && id) { await db.update(services).set({ ...cleanData, updatedAt: new Date() } as any).where(eq(services.id, id)); }
        if (method === 'DELETE' && id) { await db.delete(services).where(eq(services.id, id)); }
      } catch (err) {
        console.error('[Sync] Database services write failed:', (err as Error).message);
        throw err;
      }
    }
    if (method === 'POST') {
      localStore.services.push({ ...cleanData, id: ++localStore.nextServiceId, updatedAt: new Date().toISOString() });
      return;
    }
    if (method === 'PUT' && id) {
      const idx = localStore.services.findIndex(s => s.id === id);
      if (idx !== -1) localStore.services[idx] = { ...localStore.services[idx], ...cleanData, updatedAt: new Date().toISOString() };
      return;
    }
    if (method === 'DELETE' && id) {
      localStore.services = localStore.services.filter(s => s.id !== id);
      return;
    }
  }

  // /api/config/admin or /config/admin or /api/admin/config or /admin/config or /api/config
  const configMatch = pathname.match(/^\/?(?:api\/)?(?:admin\/config|config\/admin|config)\/?$/);
  if (configMatch && (method === 'PUT' || method === 'POST')) {
    const cData = body as any;
    localStore.siteConfig = {
      components: { ...localStore.siteConfig.components, ...(cData.components || {}), ...(cData.subcomponents || {}) },
      subcomponents: { ...localStore.siteConfig.subcomponents, ...(cData.subcomponents || {}) },
      effects: { ...localStore.siteConfig.effects, ...(cData.effects || {}) },
      theme: { ...localStore.siteConfig.theme, ...(cData.theme || {}) },
      updatedAt: new Date().toISOString(),
    };
    if (isDbConfigured) {
      try {
        const [existing] = await db.select().from(siteConfig).limit(1);
        if (existing) {
          await db.update(siteConfig).set({
            components: localStore.siteConfig.components,
            effects: localStore.siteConfig.effects,
            theme: localStore.siteConfig.theme,
            updatedAt: new Date(),
          });
        } else {
          await db.insert(siteConfig).values({
            components: localStore.siteConfig.components,
            effects: localStore.siteConfig.effects,
            theme: localStore.siteConfig.theme,
          });
        }
      } catch (err) {
        console.warn('[Sync] Database config write failed:', (err as Error).message);
      }
    }
    return;
  }

  throw new Error(`Unsupported sync operation: ${method} ${pathname}`);
}

export default sync;
