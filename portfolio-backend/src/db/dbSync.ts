/**
 * Database Sync Service
 * ─────────────────────
 * Keeps the in-memory localStore synchronized with the Supabase database.
 *
 * Behavior:
 *   1. On server startup → fetch all data from DB into localStore
 *   2. Every midnight (00:00) → re-sync localStore from DB
 *   3. If DB is unreachable → localStore keeps its current data as-is
 *
 * This ensures:
 *   - After a server restart, the frontend always sees the latest DB state
 *   - Data stays fresh via nightly refresh
 *   - If the server crashes or DB goes offline, the last known data is served
 */
import { db } from './client.js';
import { sql } from 'drizzle-orm';
import { projects, skills, timeline, bio, syncLog } from './schema.js';
import { isDbConfigured, localStore, LocalProject, LocalSkill, LocalTimeline } from './localStore.js';

/**
 * Sync all tables from Supabase into the in-memory localStore.
 * If any individual table fetch fails, that table is skipped (keeps existing data).
 */
export async function syncFromDatabase(): Promise<{ success: boolean; tables: string[]; errors: string[] }> {
  if (!isDbConfigured) {
    console.log('[DbSync] Database not configured, using initial seed data');
    return { success: false, tables: [], errors: ['DATABASE_URL not configured'] };
  }

  // Fast connection check with a 3-second timeout so server startup is never blocked
  try {
    const pingPromise = db.execute(sql`SELECT 1`);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection timeout (3s)')), 3000));
    await Promise.race([pingPromise, timeoutPromise]);
  } catch (err) {
    console.warn('[DbSync] Database unreachable or timed out, serving fast local fallback data:', (err as Error).message);
    return { success: false, tables: [], errors: [(err as Error).message] };
  }

  const synced: string[] = [];
  const errors: string[] = [];

  // ── Projects ──────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(projects).orderBy(projects.sortOrder);
    localStore.projects = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      categoryName: r.categoryName,
      type: r.type,
      badgeClass: r.badgeClass,
      desc: r.desc,
      longDesc: r.longDesc,
      features: r.features as string[],
      architecture: r.architecture,
      stack: r.stack as string[],
      github: r.github,
      live: r.live ?? '',
      stars: r.stars ?? 0,
      status: r.status ?? 'Active',
      sortOrder: r.sortOrder ?? 0,
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
    }));
    // Set nextProjectId to max existing + 1
    const maxProjectId = localStore.projects.reduce((max, p) => Math.max(max, p.id), 0);
    localStore.nextProjectId = maxProjectId + 1;
    synced.push(`projects (${rows.length} rows)`);
  } catch (err) {
    errors.push(`projects: ${(err as Error).message}`);
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(skills).orderBy(skills.sortOrder);
    localStore.skills = rows.map(r => ({
      id: r.id,
      category: r.category,
      icon: r.icon,
      items: r.items as Array<{ name: string; val: string }>,
      sortOrder: r.sortOrder ?? 0,
      updatedAt: r.updatedAt?.toISOString(),
    }));
    const maxSkillId = localStore.skills.reduce((max, s) => Math.max(max, s.id), 0);
    localStore.nextSkillId = maxSkillId + 1;
    synced.push(`skills (${rows.length} rows)`);
  } catch (err) {
    errors.push(`skills: ${(err as Error).message}`);
  }

  // ── Timeline ──────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(timeline).orderBy(timeline.sortOrder);
    localStore.timeline = rows.map(r => ({
      id: r.id,
      time: r.time,
      title: r.title,
      inst: r.inst,
      desc: r.desc,
      sortOrder: r.sortOrder ?? 0,
      updatedAt: r.updatedAt?.toISOString(),
    }));
    const maxTimelineId = localStore.timeline.reduce((max, t) => Math.max(max, t.id), 0);
    localStore.nextTimelineId = maxTimelineId + 1;
    synced.push(`timeline (${rows.length} rows)`);
  } catch (err) {
    errors.push(`timeline: ${(err as Error).message}`);
  }

  // ── Bio ───────────────────────────────────────────────────────────────────
  try {
    const [row] = await db.select().from(bio).limit(1);
    if (row) {
      localStore.bio = {
        id: row.id,
        name: row.name,
        title: row.title,
        education: row.education,
        location: row.location,
        email: row.email,
        github: row.github,
        linkedin: row.linkedin,
        resumeUrl: row.resumeUrl,
        avatarUrl: row.avatarUrl,
        bio: row.bio,
        interests: row.interests as string[],
        currentFocus: row.currentFocus,
        updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
      };
      synced.push('bio (1 row)');
    }
  } catch (err) {
    errors.push(`bio: ${(err as Error).message}`);
  }

  // ── Sync Log (load operation IDs into memory for idempotency) ─────────────
  try {
    const rows = await db.select({ operationId: syncLog.operationId }).from(syncLog);
    localStore.syncLog = new Set(rows.map(r => r.operationId));
    synced.push(`sync_log (${rows.length} operation IDs)`);
  } catch (err) {
    errors.push(`sync_log: ${(err as Error).message}`);
  }

  const success = errors.length === 0;
  return { success, tables: synced, errors };
}

/**
 * Calculate milliseconds until next midnight (00:00 local time).
 */
function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // next midnight
  return midnight.getTime() - now.getTime();
}

let midnightTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule a daily sync at midnight. Uses recursive setTimeout
 * to avoid drift issues with setInterval over long periods.
 */
function scheduleMidnightSync() {
  const ms = msUntilMidnight();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  console.log(`[DbSync] Next midnight sync scheduled in ${hours}h ${minutes}m`);

  midnightTimer = setTimeout(async () => {
    console.log('[DbSync] ⏰ Midnight sync triggered');
    const result = await syncFromDatabase();
    if (result.success) {
      console.log('[DbSync] ✅ Midnight sync complete:', result.tables.join(', '));
    } else {
      console.warn('[DbSync] ⚠️ Midnight sync had errors:', result.errors.join(', '));
      if (result.tables.length > 0) {
        console.log('[DbSync] Partially synced:', result.tables.join(', '));
      }
    }
    // Schedule the next midnight
    scheduleMidnightSync();
  }, ms);
}

/**
 * Initialize the sync service:
 *   1. Immediately sync from DB (populates localStore with real data)
 *   2. Schedule daily midnight re-sync
 *
 * Call this once from server.ts on startup.
 */
export async function initDbSync() {
  console.log('[DbSync] Initializing database sync...');

  // 1. Startup sync
  const result = await syncFromDatabase();
  if (result.success) {
    console.log('[DbSync] ✅ Startup sync complete:', result.tables.join(', '));
  } else if (result.tables.length > 0) {
    console.warn('[DbSync] ⚠️ Startup sync partial — synced:', result.tables.join(', '));
    console.warn('[DbSync] ⚠️ Failed tables:', result.errors.join(', '));
  } else {
    console.warn('[DbSync] ⚠️ Startup sync failed entirely, using fallback data');
    if (result.errors.length > 0) {
      console.warn('[DbSync]   Errors:', result.errors.join(', '));
    }
  }

  // 2. Schedule daily midnight refresh
  scheduleMidnightSync();
}

/**
 * Stop the midnight sync timer (for graceful shutdown).
 */
export function stopDbSync() {
  if (midnightTimer) {
    clearTimeout(midnightTimer);
    midnightTimer = null;
    console.log('[DbSync] Midnight sync timer stopped');
  }
}
