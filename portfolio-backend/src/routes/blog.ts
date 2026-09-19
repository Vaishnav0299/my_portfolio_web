import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { blog } from '../db/schema.js';
import { blogSchema, type BlogInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalBlogPost } from '../db/localStore.js';

const blogRouter = new Hono();

// ── PUBLIC: GET /api/blog ───────────────────────────────────────────────────
blogRouter.get('/', (c) => {
  return c.json({ success: true, data: localStore.blog });
});

// ── PUBLIC: GET /api/blog/:slug ─────────────────────────────────────────────
blogRouter.get('/:slug', (c) => {
  const slug = c.req.param('slug');
  const post = localStore.blog.find((b) => b.slug === slug);
  if (!post) return c.json({ success: false, error: 'Post not found' }, 404);
  return c.json({ success: true, data: post });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
blogRouter.use('/admin', authMiddleware);
blogRouter.use('/admin/*', authMiddleware);

// ── ADMIN: POST /api/blog/admin ─────────────────────────────────────────────
blogRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = blogSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: BlogInput = result.data;

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(blog).values(body as any).returning();
      if (created) {
        localStore.blog.push({
          id: created.id,
          slug: created.slug,
          title: created.title,
          excerpt: created.excerpt,
          category: created.category,
          readTime: created.readTime,
          date: created.date,
          accent: (created.accent as any) || 'violet',
          body: (created.body as any) || [],
          sortOrder: created.sortOrder ?? 0,
        });
        return c.json({ success: true, data: created }, 201);
      }
    } catch (err) {
      console.warn('[API/blog] Database insert failed, using local store:', (err as Error).message);
    }
  }

  const newPost: LocalBlogPost = {
    id: ++localStore.nextBlogId,
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt,
    category: body.category,
    readTime: body.readTime,
    date: body.date,
    accent: body.accent,
    body: body.body,
    sortOrder: body.sortOrder ?? localStore.blog.length + 1,
  };

  localStore.blog.push(newPost);
  return c.json({ success: true, data: newPost }, 201);
});

// ── ADMIN: PUT /api/blog/admin/:id ──────────────────────────────────────────
blogRouter.put('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = blogSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body = result.data;

  if (isDbConfigured) {
    try {
      const [updated] = await db.update(blog).set({ ...body as any, updatedAt: new Date() }).where(eq(blog.id, id)).returning();
      if (updated) {
        const idx = localStore.blog.findIndex((b) => b.id === id);
        if (idx !== -1) {
          localStore.blog[idx] = { ...localStore.blog[idx], ...body, title: updated.title, slug: updated.slug };
        }
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/blog] Database update failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.blog.findIndex((b) => b.id === id);
  if (idx === -1) return c.json({ success: false, error: 'Post not found' }, 404);

  localStore.blog[idx] = { ...localStore.blog[idx], ...body };
  return c.json({ success: true, data: localStore.blog[idx] });
});

// ── ADMIN: DELETE /api/blog/admin/:id ───────────────────────────────────────
blogRouter.delete('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  if (isDbConfigured) {
    try {
      await db.delete(blog).where(eq(blog.id, id));
    } catch (err) {
      console.warn('[API/blog] Database delete failed, using local store:', (err as Error).message);
    }
  }

  const idx = localStore.blog.findIndex((b) => b.id === id);
  if (idx !== -1) {
    localStore.blog.splice(idx, 1);
  }
  return c.json({ success: true, message: 'Deleted' });
});

export default blogRouter;
