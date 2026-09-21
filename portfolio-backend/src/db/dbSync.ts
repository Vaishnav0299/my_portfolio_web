/**
 * Database Sync Service
 * ─────────────────────
 * Keeps the in-memory localStore synchronized with the Supabase database.
 *
 * Behavior:
 *   1. On server startup → fetch all data from DB into localStore
 *   2. Every midnight (00:00) → re-sync localStore from DB
 *   3. If DB is unreachable → localStore keeps its current data as-is
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './client.js';
import { sql } from 'drizzle-orm';
import { projects, skills, timeline, bio, services, testimonials, blog, faqs, siteConfig, syncLog } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  isDbConfigured,
  localStore,
  LocalProject,
  LocalSkill,
  LocalTimeline,
  LocalService,
  LocalTestimonial,
  LocalBlogPost,
  LocalFaq,
  SiteConfig,
} from './localStore.js';

/**
 * Sync all tables from Supabase into the in-memory localStore.
 * If any individual table fetch fails, that table is skipped (keeps existing data).
 */
export async function syncFromDatabase(options: { persistToFile?: boolean } = {}): Promise<{ success: boolean; tables: string[]; errors: string[]; fileUpdated?: boolean }> {
  if (!isDbConfigured) {
    console.log('[DbSync] Database not configured, using initial seed data');
    return { success: false, tables: [], errors: ['DATABASE_URL not configured'] };
  }

  // Connection check with a 12-second timeout to allow for Supabase pooling cold start
  try {
    const pingPromise = (db as any).execute(sql`SELECT 1`);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection timeout (12s)')), 12000));
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
    if (rows.length > 0) {
      localStore.projects = rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        categoryName: r.categoryName,
        type: r.type,
        badgeClass: r.badgeClass,
        desc: r.desc,
        longDesc: r.longDesc,
        features: (r.features as string[]) || [],
        architecture: r.architecture,
        stack: (r.stack as string[]) || [],
        github: r.github,
        live: r.live ?? '',
        stars: r.stars,
        status: r.status,
        sortOrder: r.sortOrder,
        tagline: r.tagline ?? undefined,
        problem: r.problem ?? undefined,
        solution: r.solution ?? undefined,
        metrics: (r.metrics as any) ?? undefined,
        mockup: (r.mockup as any) ?? undefined,
        role: r.role ?? undefined,
        period: r.period ?? undefined,
        highlights: (r.highlights as any) ?? undefined,
        challenges: r.challenges ?? undefined,
        accent: (r.accent as any) ?? undefined,
        emoji: r.emoji ?? undefined,
        createdAt: r.createdAt?.toISOString(),
        updatedAt: r.updatedAt?.toISOString(),
      }));
      const maxProjectId = localStore.projects.reduce((max, p) => Math.max(max, p.id), 0);
      localStore.nextProjectId = maxProjectId + 1;
      synced.push(`projects (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`projects: ${(err as Error).message}`);
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(skills).orderBy(skills.sortOrder);
    if (rows.length > 0) {
      localStore.skills = rows.map(r => ({
        id: r.id,
        category: r.category,
        icon: r.icon,
        items: (r.items as Array<{ name: string; val: string; level?: number }>) || [],
        sortOrder: r.sortOrder ?? 0,
        updatedAt: r.updatedAt?.toISOString(),
      }));
      const maxSkillId = localStore.skills.reduce((max, s) => Math.max(max, s.id), 0);
      localStore.nextSkillId = maxSkillId + 1;
      synced.push(`skills (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`skills: ${(err as Error).message}`);
  }

  // ── Timeline ──────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(timeline).orderBy(timeline.sortOrder);
    if (rows.length > 0) {
      localStore.timeline = rows.map(r => ({
        id: r.id,
        time: r.time,
        title: r.title,
        inst: r.inst,
        desc: r.desc,
        type: (r.type as any) ?? 'work',
        location: r.location ?? undefined,
        achievements: (r.achievements as any) ?? undefined,
        stack: (r.stack as any) ?? undefined,
        sortOrder: r.sortOrder ?? 0,
        updatedAt: r.updatedAt?.toISOString(),
      }));
      const maxTimelineId = localStore.timeline.reduce((max, t) => Math.max(max, t.id), 0);
      localStore.nextTimelineId = maxTimelineId + 1;
      synced.push(`timeline (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`timeline: ${(err as Error).message}`);
  }

  // ── Services ──────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(services).orderBy(services.sortOrder);
    if (rows.length > 0) {
      localStore.services = rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        bullets: (r.bullets as string[]) || [],
        accent: (r.accent as any) || 'violet',
        icon: r.icon,
        sortOrder: r.sortOrder ?? 0,
      }));
      synced.push(`services (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`services: ${(err as Error).message}`);
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(testimonials).orderBy(testimonials.sortOrder);
    if (rows.length > 0) {
      localStore.testimonials = rows.map(r => ({
        id: r.id,
        quote: r.quote,
        name: r.name,
        title: r.title,
        company: r.company,
        avatarInitials: r.avatarInitials,
        accent: (r.accent as any) || 'violet',
        rating: r.rating,
        sortOrder: r.sortOrder ?? 0,
      }));
      synced.push(`testimonials (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`testimonials: ${(err as Error).message}`);
  }

  // ── Blog ──────────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(blog).orderBy(blog.sortOrder);
    if (rows.length > 0) {
      localStore.blog = rows.map(r => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        category: r.category,
        readTime: r.readTime,
        date: r.date,
        accent: (r.accent as any) || 'violet',
        body: (r.body as any) || [],
        sortOrder: r.sortOrder ?? 0,
      }));
      synced.push(`blog (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`blog: ${(err as Error).message}`);
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────
  try {
    const rows = await db.select().from(faqs).orderBy(faqs.sortOrder);
    if (rows.length > 0) {
      localStore.faqs = rows.map(r => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        sortOrder: r.sortOrder ?? 0,
      }));
      synced.push(`faqs (${rows.length} rows)`);
    }
  } catch (err) {
    errors.push(`faqs: ${(err as Error).message}`);
  }

  // ── Site Config ───────────────────────────────────────────────────────────
  try {
    const [row] = await db.select().from(siteConfig).limit(1);
    if (row) {
      localStore.siteConfig = {
        components: (row.components as any) || localStore.siteConfig.components,
        effects: (row.effects as any) || localStore.siteConfig.effects,
        theme: (row.theme as any) || localStore.siteConfig.theme,
        updatedAt: row.updatedAt?.toISOString(),
      };
      synced.push('site_config (1 row)');
    }
  } catch (err) {
    errors.push(`site_config: ${(err as Error).message}`);
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
        twitter: row.twitter ?? '',
        website: (row as any).website ?? localStore.bio.website ?? '',
        resumeUrl: row.resumeUrl,
        avatarUrl: row.avatarUrl,
        bio: row.bio,
        interests: (row.interests as string[]) || [],
        currentFocus: row.currentFocus,
        headlinePrefix: (row as any).headlinePrefix ?? localStore.bio.headlinePrefix ?? '',
        heroDescription: (row as any).heroDescription ?? localStore.bio.heroDescription ?? '',
        typewriterPhrases: (row as any).typewriterPhrases ?? localStore.bio.typewriterPhrases ?? [],
        footerTagline: (row as any).footerTagline ?? localStore.bio.footerTagline ?? '',
        updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
      };
      synced.push('bio (1 row)');
    }
  } catch (err) {
    errors.push(`bio: ${(err as Error).message}`);
  }

  // ── Sync Log ──────────────────────────────────────────────────────────────
  try {
    const rows = await db.select({ operationId: syncLog.operationId }).from(syncLog);
    localStore.syncLog = new Set(rows.map(r => r.operationId));
    synced.push(`sync_log (${rows.length} operation IDs)`);
  } catch (err) {
    errors.push(`sync_log: ${(err as Error).message}`);
  }

  let fileUpdated = false;
  if (synced.length > 0 && options.persistToFile) {
    fileUpdated = writeBackToLocalStoreFile();
  }

  const success = errors.length === 0;
  return { success, tables: synced, errors, fileUpdated };
}

/**
 * Resolves the absolute path to src/db/localStore.ts
 */
export function getLocalStoreFilePath(): string | null {
  const candidates = [
    path.resolve(__dirname, 'localStore.ts'),
    path.resolve(__dirname, '../../src/db/localStore.ts'),
    path.resolve(process.cwd(), 'src/db/localStore.ts'),
    path.resolve(process.cwd(), 'portfolio-backend/src/db/localStore.ts'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

/**
 * Updates the actual localStore.ts file on disk with the current synced records.
 * Only writes to disk when changes are detected to avoid triggering unwanted watch restarts.
 */
export function writeBackToLocalStoreFile(): boolean {
  const filePath = getLocalStoreFilePath();
  if (!filePath) {
    console.warn('[DbSync] Could not locate localStore.ts on disk to persist sync data.');
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Projects
    if (localStore.projects.length > 0) {
      content = content.replace(
        /(export const initialProjects: LocalProject\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialSkills)/,
        `$1${JSON.stringify(localStore.projects, null, 2)}$2`
      );
    }

    // 2. Skills
    if (localStore.skills.length > 0) {
      content = content.replace(
        /(export const initialSkills: LocalSkill\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialTimeline)/,
        `$1${JSON.stringify(localStore.skills, null, 2)}$2`
      );
    }

    // 3. Timeline
    if (localStore.timeline.length > 0) {
      content = content.replace(
        /(export const initialTimeline: LocalTimeline\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialServices)/,
        `$1${JSON.stringify(localStore.timeline, null, 2)}$2`
      );
    }

    // 4. Services
    if (localStore.services.length > 0) {
      content = content.replace(
        /(export const initialServices: LocalService\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialTestimonials)/,
        `$1${JSON.stringify(localStore.services, null, 2)}$2`
      );
    }

    // 5. Testimonials
    if (localStore.testimonials.length > 0) {
      content = content.replace(
        /(export const initialTestimonials: LocalTestimonial\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialBlog)/,
        `$1${JSON.stringify(localStore.testimonials, null, 2)}$2`
      );
    }

    // 6. Blog
    if (localStore.blog.length > 0) {
      content = content.replace(
        /(export const initialBlog: LocalBlogPost\[\] = )[\s\S]*?(;\r?\n\r?\nexport const initialBio)/,
        `$1${JSON.stringify(localStore.blog, null, 2)}$2`
      );
    }

    // 7. Bio
    if (localStore.bio && localStore.bio.name) {
      content = content.replace(
        /(export const initialBio = )[\s\S]*?(;\r?\n\r?\n\r?\n?export const usesData)/,
        `$1${JSON.stringify(localStore.bio, null, 2)}$2`
      );
    }

    // 8. Site Config
    if (localStore.siteConfig) {
      content = content.replace(
        /(export const initialSiteConfig: SiteConfig = )[\s\S]*?(;\r?\n\r?\nexport interface LocalFaq)/,
        `$1${JSON.stringify(localStore.siteConfig, null, 2)}$2`
      );
    }

    // 9. FAQs
    if (localStore.faqs.length > 0) {
      content = content.replace(
        /(export const initialFaqs: LocalFaq\[\] = )[\s\S]*?(;\r?\n\r?\n\/\/ In-Memory)/,
        `$1${JSON.stringify(localStore.faqs, null, 2)}$2`
      );
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('[DbSync] 💾 Successfully updated localStore.ts on disk with fresh database records.');
      return true;
    } else {
      console.log('[DbSync] ℹ️ localStore.ts on disk is already up to date.');
      return false;
    }
  } catch (err) {
    console.warn('[DbSync] Failed to write back to localStore.ts:', (err as Error).message);
    return false;
  }
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

let midnightTimer: ReturnType<typeof setTimeout> | null = null;

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
    }
    scheduleMidnightSync();
  }, ms);
}

export async function initDbSync() {
  console.log('[DbSync] Initializing database sync...');
  const result = await syncFromDatabase();
  if (result.success) {
    console.log('[DbSync] ✅ Startup sync complete:', result.tables.join(', '));
  } else if (result.tables.length > 0) {
    console.warn('[DbSync] ⚠️ Startup sync partial — synced:', result.tables.join(', '));
    console.warn('[DbSync] ⚠️ Failed tables:', result.errors.join(', '));
  } else {
    console.warn('[DbSync] ⚠️ Startup sync failed entirely, using fallback data');
  }

  scheduleMidnightSync();
}

export function stopDbSync() {
  if (midnightTimer) {
    clearTimeout(midnightTimer);
    midnightTimer = null;
    console.log('[DbSync] Midnight sync timer stopped');
  }
}

/**
 * Pushes in-memory localStore records up to Supabase database.
 * Used when user wants to explicitly persist local changes to Supabase.
 */
export async function pushToDatabase(): Promise<{ success: boolean; tables: string[]; errors: string[] }> {
  if (!isDbConfigured) {
    return { success: false, tables: [], errors: ['DATABASE_URL not configured'] };
  }

  const pushed: string[] = [];
  const errors: string[] = [];

  // Projects
  try {
    await db.execute(sql`TRUNCATE TABLE projects RESTART IDENTITY CASCADE`);
    if (localStore.projects.length > 0) {
      await db.insert(projects).values(
        localStore.projects.map((p) => ({
          name: p.name,
          category: p.category,
          categoryName: p.categoryName,
          type: p.type,
          badgeClass: p.badgeClass,
          desc: p.desc,
          longDesc: p.longDesc,
          features: p.features,
          architecture: p.architecture,
          stack: p.stack,
          github: p.github,
          live: p.live,
          stars: p.stars,
          status: p.status,
          sortOrder: p.sortOrder,
          tagline: p.tagline,
          problem: p.problem,
          solution: p.solution,
          metrics: p.metrics as any,
          mockup: p.mockup,
          role: p.role,
          period: p.period,
          highlights: p.highlights,
          challenges: p.challenges,
          accent: p.accent,
          emoji: p.emoji,
        }))
      );
    }
    pushed.push(`projects (${localStore.projects.length} rows)`);
  } catch (err) {
    errors.push(`projects: ${(err as Error).message}`);
  }

  // Skills
  try {
    await db.execute(sql`TRUNCATE TABLE skills RESTART IDENTITY CASCADE`);
    if (localStore.skills.length > 0) {
      await db.insert(skills).values(
        localStore.skills.map((s) => ({
          category: s.category,
          icon: s.icon,
          items: s.items as any,
          sortOrder: s.sortOrder,
        }))
      );
    }
    pushed.push(`skills (${localStore.skills.length} groups)`);
  } catch (err) {
    errors.push(`skills: ${(err as Error).message}`);
  }

  // Timeline
  try {
    await db.execute(sql`TRUNCATE TABLE timeline RESTART IDENTITY CASCADE`);
    if (localStore.timeline.length > 0) {
      await db.insert(timeline).values(
        localStore.timeline.map((t) => ({
          time: t.time,
          title: t.title,
          inst: t.inst,
          desc: t.desc,
          type: t.type ?? 'work',
          location: t.location,
          achievements: t.achievements as any,
          stack: t.stack as any,
          sortOrder: t.sortOrder,
        }))
      );
    }
    pushed.push(`timeline (${localStore.timeline.length} entries)`);
  } catch (err) {
    errors.push(`timeline: ${(err as Error).message}`);
  }

  // Bio
  try {
    await db.execute(sql`TRUNCATE TABLE bio RESTART IDENTITY CASCADE`);
    await db.insert(bio).values({
      name: localStore.bio.name,
      title: localStore.bio.title,
      education: localStore.bio.education,
      location: localStore.bio.location,
      email: localStore.bio.email,
      github: localStore.bio.github,
      linkedin: localStore.bio.linkedin,
      twitter: localStore.bio.twitter,
      resumeUrl: localStore.bio.resumeUrl,
      avatarUrl: localStore.bio.avatarUrl,
      bio: localStore.bio.bio,
      interests: localStore.bio.interests as any,
      currentFocus: localStore.bio.currentFocus,
    });
    pushed.push('bio (1 row)');
  } catch (err) {
    errors.push(`bio: ${(err as Error).message}`);
  }

  return { success: errors.length === 0, tables: pushed, errors };
}

