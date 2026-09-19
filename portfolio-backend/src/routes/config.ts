import { Hono } from 'hono';
import { db } from '../db/client.js';
import { siteConfig } from '../db/schema.js';
import { siteConfigSchema, type SiteConfigInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, SiteConfig } from '../db/localStore.js';

const configRouter = new Hono();

// ── PUBLIC: GET /api/config ──────────────────────────────────────────────────
configRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const [row] = await db.select().from(siteConfig).limit(1);
      if (row) {
        const comp = (row.components as Record<string, boolean>) || {};
        localStore.siteConfig = {
          components: {
            ...localStore.siteConfig.components,
            ...comp,
          },
          subcomponents: {
            ...localStore.siteConfig.subcomponents,
            ...((row as any).subcomponents || comp),
          },
          effects: {
            ...localStore.siteConfig.effects,
            ...((row.effects as Record<string, boolean>) || {}),
          },
          theme: {
            ...localStore.siteConfig.theme,
            ...((row.theme as any) || {}),
          },
          updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
        };
        return c.json({ success: true, data: localStore.siteConfig });
      }
    } catch (err) {
      console.warn('[API/config] DB query failed, serving local store:', (err as Error).message);
    }
  }
  return c.json({ success: true, data: localStore.siteConfig });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
configRouter.use('/admin', authMiddleware);
configRouter.use('/admin/*', authMiddleware);

// ── ADMIN: PUT /api/config/admin ─────────────────────────────────────────────
configRouter.put('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = siteConfigSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body = result.data;

  // Merge into localStore
  localStore.siteConfig = {
    components: {
      ...localStore.siteConfig.components,
      ...(body.components || {}),
      ...(body.subcomponents || {}),
    },
    subcomponents: {
      ...(localStore.siteConfig.subcomponents || {}),
      ...(body.subcomponents || {}),
    },
    effects: {
      ...localStore.siteConfig.effects,
      ...(body.effects || {}),
    },
    theme: {
      ...localStore.siteConfig.theme,
      ...(body.theme || {}),
    },
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
      console.warn('[API/config] DB write failed, stored locally:', (err as Error).message);
    }
  }

  console.log('[Admin/Config] ✓ Site configuration updated');
  return c.json({ success: true, data: localStore.siteConfig });
});

export default configRouter;
