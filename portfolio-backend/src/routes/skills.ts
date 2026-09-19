import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import * as crypto from 'node:crypto';
import { db } from '../db/client.js';
import { skills } from '../db/schema.js';
import { skillSchema, type SkillInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalSkill } from '../db/localStore.js';
import { recordOperation } from '../lib/idempotency.js';

const skillsRouter = new Hono();

// ── PUBLIC: GET /api/skills ──────────────────────────────────────────────────
skillsRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(skills).orderBy(skills.sortOrder);
      if (rows && rows.length > 0) {
        localStore.skills = rows.map(r => ({
          id: r.id,
          category: r.category,
          icon: r.icon,
          items: (r.items as any) || [],
          sortOrder: r.sortOrder ?? 0,
          updatedAt: r.updatedAt?.toISOString(),
        }));
        return c.json({ success: true, data: localStore.skills });
      }
    } catch (err) {
      console.warn('[API/skills] DB query failed, serving local store:', (err as Error).message);
    }
  }
  return c.json({ success: true, data: localStore.skills });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
skillsRouter.use('/admin', authMiddleware);
skillsRouter.use('/admin/*', authMiddleware);

// ── ADMIN: POST /api/skills/admin ────────────────────────────────────────────
skillsRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = skillSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: SkillInput = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(skills).values(body as any).returning();
      await recordOperation(opId, '/api/skills/admin', 'POST');
      if (created) {
        localStore.skills.push(created as any);
        return c.json({ success: true, data: created }, 201);
      }
    } catch (err) {
      console.warn('[API/skills] Database insert failed, using local store:', (err as Error).message);
    }
  }

  const newSkill: LocalSkill = {
    id: ++localStore.nextSkillId,
    category: body.category,
    icon: body.icon,
    items: body.items as any,
    sortOrder: body.sortOrder ?? localStore.skills.length + 1,
    updatedAt: new Date().toISOString(),
  };

  localStore.skills.push(newSkill);
  await recordOperation(opId, '/api/skills/admin', 'POST');
  return c.json({ success: true, data: newSkill }, 201);
});

// ── ADMIN: PUT /api/skills/admin/:id ─────────────────────────────────────────
skillsRouter.put('/admin/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = skillSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: Partial<SkillInput> = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [updated] = await db
        .update(skills)
        .set({ ...body, updatedAt: new Date() } as any)
        .where(eq(skills.id, id))
        .returning();
      await recordOperation(opId, `/api/skills/admin/${id}`, 'PUT');
      if (updated) {
        const idx = localStore.skills.findIndex(s => s.id === id);
        if (idx !== -1) localStore.skills[idx] = updated as any;
        else localStore.skills.push(updated as any);
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/skills] Database update failed, using local store:', (err as Error).message);
    }
  }

  const index = localStore.skills.findIndex(s => s.id === id);
  if (index === -1) return c.json({ success: false, error: 'Skill not found' }, 404);

  localStore.skills[index] = {
    ...localStore.skills[index],
    ...body,
    updatedAt: new Date().toISOString(),
  } as LocalSkill;

  await recordOperation(opId, `/api/skills/admin/${id}`, 'PUT');
  return c.json({ success: true, data: localStore.skills[index] });
});

// ── ADMIN: DELETE /api/admin/skills/:id ──────────────────────────────────────
skillsRouter.delete('/admin/:id', authMiddleware, async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      await db.delete(skills).where(eq(skills.id, id));
    } catch (err) {
      console.warn('[API/skills] Database delete failed, using local store:', (err as Error).message);
    }
  }

  localStore.skills = localStore.skills.filter(s => s.id !== id);
  await recordOperation(opId, `/api/skills/admin/${id}`, 'DELETE');

  return c.json({ success: true, message: `Skill ${id} deleted` });
});

export default skillsRouter;
