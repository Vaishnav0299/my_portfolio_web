import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { testimonials } from '../db/schema.js';
import { testimonialSchema, type TestimonialInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalTestimonial } from '../db/localStore.js';

const testimonialsRouter = new Hono();

// ── PUBLIC: GET /api/testimonials ───────────────────────────────────────────
testimonialsRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(testimonials).orderBy(testimonials.sortOrder);
      if (rows && rows.length > 0) {
        localStore.testimonials = rows.map(r => ({
          id: r.id,
          quote: r.quote,
          name: r.name,
          author: r.name,
          title: r.title,
          role: r.title,
          company: r.company,
          avatarInitials: r.avatarInitials,
          avatar: (r as any).avatar || '',
          accent: (r.accent as any) || 'violet',
          rating: r.rating,
          sortOrder: r.sortOrder ?? 0,
        }));
        return c.json({ success: true, data: localStore.testimonials });
      }
    } catch (err) {
      console.warn('[API/testimonials] DB query failed, serving local store:', (err as Error).message);
    }
  }

  const data = localStore.testimonials.map((t) => {
    const nameVal = t.name || t.author || '';
    const titleVal = t.title || t.role || '';
    const avatarInitialsVal = t.avatarInitials || (nameVal ? nameVal.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AN');
    return {
      ...t,
      name: nameVal,
      author: nameVal,
      title: titleVal,
      role: titleVal,
      avatarInitials: avatarInitialsVal,
      avatar: t.avatar || '',
    };
  });
  return c.json({ success: true, data });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
testimonialsRouter.use('/admin', authMiddleware);
testimonialsRouter.use('/admin/*', authMiddleware);

// ── ADMIN: POST /api/testimonials/admin ─────────────────────────────────────
testimonialsRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = testimonialSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: TestimonialInput = result.data;
  const nameVal = body.name || body.author || 'Anonymous';
  const titleVal = body.title || body.role || '';
  const avatarInitialsVal = body.avatarInitials || (nameVal ? nameVal.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AN');
  const avatarVal = body.avatar || '';

  const dbPayload = {
    quote: body.quote,
    name: nameVal,
    title: titleVal,
    company: body.company || '',
    avatarInitials: avatarInitialsVal,
    accent: body.accent || 'violet',
    rating: body.rating ?? 5,
    sortOrder: body.sortOrder ?? (localStore.testimonials.length + 1),
  };

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(testimonials).values(dbPayload as any).returning();
      if (created) {
        const full = { ...created, author: nameVal, role: titleVal, avatar: avatarVal };
        localStore.testimonials.push(full as any);
        return c.json({ success: true, data: full }, 201);
      }
    } catch (err) {
      console.warn('[API/testimonials] Database insert failed, using local store:', (err as Error).message);
    }
  }

  const newTestimonial: LocalTestimonial = {
    id: ++localStore.nextTestimonialId,
    ...dbPayload,
    author: nameVal,
    role: titleVal,
    avatar: avatarVal,
  };

  localStore.testimonials.push(newTestimonial);
  return c.json({ success: true, data: newTestimonial }, 201);
});

// ── ADMIN: PUT /api/testimonials/admin/:id ──────────────────────────────────
testimonialsRouter.put('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = testimonialSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body = result.data;
  const nameVal = body.name || body.author;
  const titleVal = body.title || body.role;
  const avatarVal = body.avatar;

  const dbUpdatePayload: any = {};
  if (body.quote !== undefined) dbUpdatePayload.quote = body.quote;
  if (nameVal !== undefined) {
    dbUpdatePayload.name = nameVal;
    if (!body.avatarInitials) {
      dbUpdatePayload.avatarInitials = nameVal.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
  }
  if (titleVal !== undefined) dbUpdatePayload.title = titleVal;
  if (body.company !== undefined) dbUpdatePayload.company = body.company;
  if (body.avatarInitials !== undefined) dbUpdatePayload.avatarInitials = body.avatarInitials;
  if (body.accent !== undefined) dbUpdatePayload.accent = body.accent;
  if (body.rating !== undefined) dbUpdatePayload.rating = body.rating;
  if (body.sortOrder !== undefined) dbUpdatePayload.sortOrder = body.sortOrder;

  if (isDbConfigured) {
    try {
      const [updated] = await db.update(testimonials)
        .set({ ...dbUpdatePayload, updatedAt: new Date() })
        .where(eq(testimonials.id, id))
        .returning();
      if (updated) {
        const full = {
          ...updated,
          author: updated.name,
          role: updated.title,
          avatar: avatarVal !== undefined ? avatarVal : (localStore.testimonials.find(t => t.id === id)?.avatar || ''),
        };
        const idx = localStore.testimonials.findIndex((t) => t.id === id);
        if (idx !== -1) localStore.testimonials[idx] = full as any;
        else localStore.testimonials.push(full as any);
        return c.json({ success: true, data: full });
      }
    } catch (err) {
      console.warn('[API/testimonials] Database update failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.testimonials.findIndex((t) => t.id === id);
  if (idx === -1) return c.json({ success: false, error: 'Testimonial not found' }, 404);

  const existing = localStore.testimonials[idx];
  const finalName = nameVal !== undefined ? nameVal : existing.name;
  const finalTitle = titleVal !== undefined ? titleVal : existing.title;
  const finalAvatar = avatarVal !== undefined ? avatarVal : existing.avatar;
  const finalInitials = dbUpdatePayload.avatarInitials || existing.avatarInitials || (finalName ? finalName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AN');

  localStore.testimonials[idx] = {
    ...existing,
    ...dbUpdatePayload,
    name: finalName,
    author: finalName,
    title: finalTitle,
    role: finalTitle,
    avatar: finalAvatar,
    avatarInitials: finalInitials,
  };
  return c.json({ success: true, data: localStore.testimonials[idx] });
});

// ── ADMIN: DELETE /api/testimonials/admin/:id ───────────────────────────────
testimonialsRouter.delete('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  if (isDbConfigured) {
    try {
      await db.delete(testimonials).where(eq(testimonials.id, id));
    } catch (err) {
      console.warn('[API/testimonials] Database delete failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.testimonials.findIndex((t) => t.id === id);
  if (idx !== -1) {
    localStore.testimonials.splice(idx, 1);
  }
  return c.json({ success: true, message: 'Deleted' });
});

export default testimonialsRouter;
