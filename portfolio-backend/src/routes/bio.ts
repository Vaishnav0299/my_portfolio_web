import { Hono } from 'hono';
import { db } from '../db/client.js';
import { bio } from '../db/schema.js';
import { bioSchema, type BioInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { sql } from 'drizzle-orm';
import { isDbConfigured, localStore } from '../db/localStore.js';

const bioRouter = new Hono();

// -- PUBLIC: GET /api/bio -----------------------------------------------------
bioRouter.get('/', async (c) => {
  if (isDbConfigured) {
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
        return c.json({ success: true, data: localStore.bio });
      }
    } catch (err) {
      console.warn('[API/bio] DB query failed, serving local store:', (err as Error).message);
    }
  }
  return c.json({ success: true, data: localStore.bio });
});

// -- ADMIN: Require authentication --------------------------------------------
bioRouter.use('/admin', authMiddleware);
bioRouter.use('/admin/*', authMiddleware);

// -- ADMIN: PUT /api/admin/bio -------------------------------------------------
bioRouter.put('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = bioSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: BioInput = result.data;

  if (isDbConfigured) {
    try {
      await db.execute(sql`TRUNCATE TABLE bio RESTART IDENTITY`);
      const [updated] = await db.insert(bio).values(body as any).returning();
      if (updated) {
        localStore.bio = {
          ...localStore.bio,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/bio] Database update failed, updating local store:', (err as Error).message);
    }
  }

  localStore.bio = {
    ...localStore.bio,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return c.json({ success: true, data: localStore.bio });
});

export default bioRouter;
