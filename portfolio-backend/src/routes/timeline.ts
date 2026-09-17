import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import * as crypto from 'node:crypto';
import { db } from '../db/client.js';
import { timeline } from '../db/schema.js';
import { timelineSchema, type TimelineInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalTimeline } from '../db/localStore.js';
import { recordOperation } from '../lib/idempotency.js';

const timelineRouter = new Hono();

// -- PUBLIC: GET /api/timeline ------------------------------------------------
timelineRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(timeline).orderBy(timeline.sortOrder);
      if (rows.length > 0) return c.json({ success: true, data: rows });
    } catch (err) {
      console.warn('[API/timeline] Database error, using local timeline:', (err as Error).message);
    }
  }

  return c.json({ success: true, data: localStore.timeline });
});

// -- ADMIN: Require authentication --------------------------------------------
timelineRouter.use('/admin', authMiddleware);
timelineRouter.use('/admin/*', authMiddleware);

// -- ADMIN: POST /api/timeline/admin ------------------------------------------
timelineRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = timelineSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: TimelineInput = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(timeline).values(body as any).returning();
      await recordOperation(opId, '/api/timeline/admin', 'POST');
      console.log(`[Admin/Timeline] Created timeline "${body.title}" (opId: ${opId})`);
      if (created) return c.json({ success: true, data: created }, 201);
    } catch (err) {
      console.warn('[API/timeline] Database insert failed, using local store:', (err as Error).message);
    }
  }

  const newEntry: LocalTimeline = {
    id: ++localStore.nextTimelineId,
    time: body.time,
    title: body.title,
    inst: body.inst,
    desc: body.desc,
    sortOrder: body.sortOrder ?? localStore.timeline.length + 1,
    updatedAt: new Date().toISOString(),
  };

  localStore.timeline.push(newEntry);
  await recordOperation(opId, '/api/timeline/admin', 'POST');
  console.log(`[Admin/Timeline] Created local timeline "${body.title}" (opId: ${opId})`);
  return c.json({ success: true, data: newEntry }, 201);
});

// -- ADMIN: PUT /api/timeline/admin/:id ---------------------------------------
timelineRouter.put('/admin/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = timelineSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: Partial<TimelineInput> = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [updated] = await db
        .update(timeline)
        .set({ ...body, updatedAt: new Date() } as any)
        .where(eq(timeline.id, id))
        .returning();
      await recordOperation(opId, `/api/timeline/admin/${id}`, 'PUT');
      console.log(`[Admin/Timeline] Updated timeline id=${id} (opId: ${opId})`);
      if (updated) return c.json({ success: true, data: updated });
    } catch (err) {
      console.warn('[API/timeline] Database update failed, using local store:', (err as Error).message);
    }
  }

  const index = localStore.timeline.findIndex(t => t.id === id);
  if (index === -1) return c.json({ success: false, error: 'Timeline entry not found' }, 404);

  localStore.timeline[index] = {
    ...localStore.timeline[index],
    ...body,
    updatedAt: new Date().toISOString(),
  } as LocalTimeline;

  await recordOperation(opId, `/api/timeline/admin/${id}`, 'PUT');
  console.log(`[Admin/Timeline] Updated local timeline id=${id} (opId: ${opId})`);
  return c.json({ success: true, data: localStore.timeline[index] });
});

// -- ADMIN: DELETE /api/timeline/admin/:id ------------------------------------
timelineRouter.delete('/admin/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      await db.delete(timeline).where(eq(timeline.id, id));
      console.log(`[Admin/Timeline] Deleted timeline id=${id} from Supabase`);
    } catch (err) {
      console.warn('[API/timeline] Database delete failed, using local store:', (err as Error).message);
    }
  }

  localStore.timeline = localStore.timeline.filter(t => t.id !== id);
  await recordOperation(opId, `/api/timeline/admin/${id}`, 'DELETE');
  console.log(`[Admin/Timeline] Recorded DELETE /api/timeline/admin/${id} to syncLog (opId: ${opId})`);

  return c.json({ success: true, message: `Timeline entry ${id} deleted` });
});

export default timelineRouter;
