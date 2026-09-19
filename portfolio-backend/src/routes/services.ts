import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { services } from '../db/schema.js';
import { serviceSchema, type ServiceInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalService } from '../db/localStore.js';

const servicesRouter = new Hono();

// ── PUBLIC: GET /api/services ────────────────────────────────────────────────
servicesRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(services).orderBy(services.sortOrder);
      if (rows && rows.length > 0) {
        localStore.services = rows.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          bullets: (r.bullets as string[]) || [],
          accent: (r.accent as any) || 'violet',
          icon: r.icon,
          sortOrder: r.sortOrder ?? 0,
        }));
        return c.json({ success: true, data: localStore.services });
      }
    } catch (err) {
      console.warn('[API/services] DB query failed, serving local store:', (err as Error).message);
    }
  }
  return c.json({ success: true, data: localStore.services });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
servicesRouter.use('/admin', authMiddleware);
servicesRouter.use('/admin/*', authMiddleware);

// ── ADMIN: POST /api/services/admin ──────────────────────────────────────────
servicesRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = serviceSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: ServiceInput = result.data;

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(services).values(body as any).returning();
      if (created) {
        localStore.services.push(created as any);
        return c.json({ success: true, data: created }, 201);
      }
    } catch (err) {
      console.warn('[API/services] Database insert failed, using local store:', (err as Error).message);
    }
  }

  const newService: LocalService = {
    id: ++localStore.nextServiceId,
    title: body.title,
    description: body.description,
    bullets: body.bullets,
    accent: body.accent,
    icon: body.icon,
    sortOrder: body.sortOrder ?? localStore.services.length + 1,
  };

  localStore.services.push(newService);
  return c.json({ success: true, data: newService }, 201);
});

// ── ADMIN: PUT /api/services/admin/:id ───────────────────────────────────────
servicesRouter.put('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = serviceSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body = result.data;

  if (isDbConfigured) {
    try {
      const [updated] = await db.update(services).set({ ...body as any, updatedAt: new Date() }).where(eq(services.id, id)).returning();
      if (updated) {
        const idx = localStore.services.findIndex((s) => s.id === id);
        if (idx !== -1) localStore.services[idx] = updated as any;
        else localStore.services.push(updated as any);
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/services] Database update failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.services.findIndex((s) => s.id === id);
  if (idx === -1) return c.json({ success: false, error: 'Service not found' }, 404);

  localStore.services[idx] = { ...localStore.services[idx], ...body };
  return c.json({ success: true, data: localStore.services[idx] });
});

// ── ADMIN: DELETE /api/services/admin/:id ────────────────────────────────────
servicesRouter.delete('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  if (isDbConfigured) {
    try {
      await db.delete(services).where(eq(services.id, id));
    } catch (err) {
      console.warn('[API/services] Database delete failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.services.findIndex((s) => s.id === id);
  if (idx !== -1) {
    localStore.services.splice(idx, 1);
  }
  return c.json({ success: true, message: 'Deleted' });
});

export default servicesRouter;
