import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import * as crypto from 'node:crypto';
import { db } from '../db/client.js';
import { projects } from '../db/schema.js';
import { projectSchema, type ProjectInput } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConfigured, localStore, LocalProject } from '../db/localStore.js';
import { recordOperation } from '../lib/idempotency.js';

const projectsRouter = new Hono();

// -- PUBLIC: GET /api/projects ------------------------------------------------
projectsRouter.get('/', async (c) => {
  if (isDbConfigured) {
    try {
      const rows = await db
        .select()
        .from(projects)
        .orderBy(projects.sortOrder);
      if (rows.length > 0) return c.json({ success: true, data: rows });
    } catch (err) {
      console.warn('[API/projects] Database error, falling back to local store:', (err as Error).message);
    }
  }

  return c.json({ success: true, data: localStore.projects });
});

// -- PUBLIC: GET /api/projects/:id --------------------------------------------
projectsRouter.get('/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  if (isDbConfigured) {
    try {
      const [row] = await db.select().from(projects).where(eq(projects.id, id));
      if (row) return c.json({ success: true, data: row });
    } catch (err) {
      console.warn('[API/projects/:id] Database query failed, checking local store:', (err as Error).message);
    }
  }

  const project = localStore.projects.find(p => p.id === id);
  if (!project) return c.json({ success: false, error: 'Project not found' }, 404);

  return c.json({ success: true, data: project });
});

// -- ADMIN: Require authentication --------------------------------------------
projectsRouter.use('/admin', authMiddleware);
projectsRouter.use('/admin/*', authMiddleware);

// -- ADMIN: POST /api/admin/projects ------------------------------------------
projectsRouter.post('/admin', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: ProjectInput = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [created] = await db.insert(projects).values(body as any).returning();
      await recordOperation(opId, '/api/projects/admin', 'POST');
      console.log(`[Admin/Projects] Created project "${body.name}" (opId: ${opId})`);
      if (created) return c.json({ success: true, data: created }, 201);
    } catch (err) {
      console.warn('[API/projects] Database insert failed, saving to local store:', (err as Error).message);
    }
  }

  const newProject: LocalProject = {
    id: ++localStore.nextProjectId,
    name: body.name,
    category: body.category,
    categoryName: body.categoryName,
    type: body.type,
    badgeClass: body.badgeClass,
    desc: body.desc,
    longDesc: body.longDesc,
    features: body.features,
    architecture: body.architecture,
    stack: body.stack,
    github: body.github,
    live: body.live,
    stars: body.stars ?? 0,
    status: body.status,
    sortOrder: body.sortOrder ?? localStore.projects.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localStore.projects.push(newProject);
  await recordOperation(opId, '/api/projects/admin', 'POST');
  console.log(`[Admin/Projects] Created local project "${body.name}" (opId: ${opId})`);
  return c.json({ success: true, data: newProject }, 201);
});

// -- ADMIN: PUT /api/admin/projects/:id ---------------------------------------
projectsRouter.put('/admin/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const raw = await c.req.json().catch(() => null);
  const result = projectSchema.partial().safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const body: Partial<ProjectInput> = result.data;
  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      const [updated] = await db
        .update(projects)
        .set({ ...body, updatedAt: new Date() } as any)
        .where(eq(projects.id, id))
        .returning();
      await recordOperation(opId, `/api/projects/admin/${id}`, 'PUT');
      console.log(`[Admin/Projects] Updated project id=${id} (opId: ${opId})`);
      if (updated) return c.json({ success: true, data: updated });
    } catch (err) {
      console.warn('[API/projects] Database update failed, updating local store:', (err as Error).message);
    }
  }

  const index = localStore.projects.findIndex(p => p.id === id);
  if (index === -1) return c.json({ success: false, error: 'Project not found' }, 404);

  localStore.projects[index] = {
    ...localStore.projects[index],
    ...body,
    updatedAt: new Date().toISOString(),
  } as LocalProject;

  await recordOperation(opId, `/api/projects/admin/${id}`, 'PUT');
  console.log(`[Admin/Projects] Updated local project id=${id} (opId: ${opId})`);
  return c.json({ success: true, data: localStore.projects[index] });
});

// -- ADMIN: DELETE /api/admin/projects/:id ------------------------------------
projectsRouter.delete('/admin/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam || '', 10);
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400);

  const opId = crypto.randomUUID();

  if (isDbConfigured) {
    try {
      await db.delete(projects).where(eq(projects.id, id));
      console.log(`[Admin/Projects] Deleted project id=${id} from Supabase`);
    } catch (err) {
      console.warn('[API/projects] Database delete failed, using local store:', (err as Error).message);
    }
  }

  localStore.projects = localStore.projects.filter(p => p.id !== id);
  await recordOperation(opId, `/api/projects/admin/${id}`, 'DELETE');
  console.log(`[Admin/Projects] Recorded DELETE /api/projects/admin/${id} to syncLog (opId: ${opId})`);

  return c.json({ success: true, message: `Project ${id} deleted` });
});

export default projectsRouter;
