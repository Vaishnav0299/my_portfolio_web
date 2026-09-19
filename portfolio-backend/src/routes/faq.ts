import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { faqs } from '../db/schema.js';
import { faqSchema, type FaqInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalFaq } from '../db/localStore.js';

const faqRouter = new Hono();

// ── PUBLIC: GET /api/faq ─────────────────────────────────────────────────────
faqRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(faqs).orderBy(faqs.sortOrder);
      if (rows && rows.length > 0) {
        localStore.faqs = rows.map(r => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          sortOrder: r.sortOrder ?? 0,
        }));
        return c.json({ success: true, data: localStore.faqs });
      }
    } catch (err) {
      console.warn('[API/faq] DB query failed, serving local store:', (err as Error).message);
    }
  }
  return c.json({ success: true, data: localStore.faqs });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
faqRouter.use('/admin', authMiddleware);
faqRouter.use('/admin/*', authMiddleware);

// ── ADMIN: POST /api/faq/admin ───────────────────────────────────────────────
faqRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = faqSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: FaqInput = result.data;

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(faqs).values(body as any).returning();
      if (created) {
        localStore.faqs.push(created as any);
        return c.json({ success: true, data: created }, 201);
      }
    } catch (err) {
      console.warn('[API/faq] DB insert failed, using local store:', (err as Error).message);
    }
  }

  const newFaq: LocalFaq = {
    id: ++localStore.nextFaqId,
    question: body.question,
    answer: body.answer,
    sortOrder: body.sortOrder ?? localStore.faqs.length + 1,
  };

  localStore.faqs.push(newFaq);
  return c.json({ success: true, data: newFaq }, 201);
});

// ── ADMIN: PUT /api/faq/admin/:id ────────────────────────────────────────────
faqRouter.put('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = faqSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body = result.data;

  if (isDbConfigured) {
    try {
      const [updated] = await db.update(faqs).set({ ...body as any, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
      if (updated) {
        const idx = localStore.faqs.findIndex((f) => f.id === id);
        if (idx !== -1) localStore.faqs[idx] = updated as any;
        else localStore.faqs.push(updated as any);
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/faq] DB update failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.faqs.findIndex((f) => f.id === id);
  if (idx === -1) return c.json({ success: false, error: 'FAQ not found' }, 404);

  localStore.faqs[idx] = { ...localStore.faqs[idx], ...body };
  return c.json({ success: true, data: localStore.faqs[idx] });
});

// ── ADMIN: DELETE /api/faq/admin/:id ─────────────────────────────────────────
faqRouter.delete('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  if (isDbConfigured) {
    try {
      await db.delete(faqs).where(eq(faqs.id, id));
    } catch (err) {
      console.warn('[API/faq] DB delete failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.faqs.findIndex((f) => f.id === id);
  if (idx !== -1) {
    localStore.faqs.splice(idx, 1);
  }
  return c.json({ success: true, message: 'Deleted' });
});

export default faqRouter;
