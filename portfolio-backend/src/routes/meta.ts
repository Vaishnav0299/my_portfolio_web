import { Hono } from 'hono';
import { localStore } from '../db/localStore.js';
import { authMiddleware } from '../middleware/auth.js';

const metaRouter = new Hono();

// ── GET /api/meta/now ────────────────────────────────────────────────────────
metaRouter.get('/now', (c) => {
  const sanitized = (localStore.now || []).map(({ emoji, ...rest }: any) => rest);
  return c.json({ success: true, data: sanitized });
});

// ── GET /api/meta/uses ───────────────────────────────────────────────────────
metaRouter.get('/uses', (c) => {
  return c.json({ success: true, data: localStore.uses });
});

import path from 'node:path';
import fs from 'node:fs';

// ── GET /api/meta/github ─────────────────────────────────────────────────────
metaRouter.get('/github', async (c) => {
  let stats = localStore.githubStats;

  try {
    const candidates = [
      path.resolve(process.cwd(), '../portfolio-frontend/public/data/telemetry.json'),
      path.resolve(process.cwd(), 'portfolio-frontend/public/data/telemetry.json'),
      path.resolve(process.cwd(), 'public/data/telemetry.json'),
    ];
    const target = candidates.find((p) => fs.existsSync(p));
    if (target) {
      const raw = JSON.parse(fs.readFileSync(target, 'utf-8'));
      const repoCount = raw?.summary?.public_repos ?? raw?.profile?.public_repos;
      const contribCount = raw?.summary?.contributions;
      if (repoCount !== undefined && contribCount !== undefined) {
        stats = [
          { label: 'Public Repos', value: String(repoCount), icon: 'FolderGit2' },
          { label: 'Contributions', value: String(contribCount), icon: 'GitCommit' },
        ];
      }
    }
  } catch (err) {
    // Keep localStore.githubStats on error
  }

  return c.json({
    success: true,
    data: {
      stats,
      username: 'Vaishnav0299',
      profileUrl: 'https://github.com/Vaishnav0299',
    },
  });
});

// ── ADMIN: Require authentication ──────────────────────────────────────────
metaRouter.use('/admin/*', authMiddleware);

// ── ADMIN: PUT /api/meta/admin/now (replace all now items) ──────────────────
metaRouter.put('/admin/now', async (c) => {
  try {
    const body = await c.req.json();
    if (!Array.isArray(body)) {
      return c.json({ success: false, error: 'Expected an array of now items' }, 400);
    }
    localStore.now = body.map(({ emoji, ...rest }: any) => rest);
    return c.json({ success: true, data: localStore.now });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// ── ADMIN: POST /api/meta/admin/now (add single now item) ───────────────────
metaRouter.post('/admin/now', async (c) => {
  try {
    const body = await c.req.json();
    const item = {
      text: body.text || '',
      tag: body.tag || 'shipping',
    };
    localStore.now.push(item);
    localStore.now = localStore.now.map(({ emoji, ...rest }: any) => rest);
    return c.json({ success: true, data: localStore.now }, 201);
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// ── ADMIN: DELETE /api/meta/admin/now/:index ────────────────────────────────
metaRouter.delete('/admin/now/:index', async (c) => {
  const index = parseInt(c.req.param('index'), 10);
  if (isNaN(index) || index < 0 || index >= localStore.now.length) {
    return c.json({ success: false, error: 'Invalid index' }, 400);
  }
  localStore.now.splice(index, 1);
  localStore.now = localStore.now.map(({ emoji, ...rest }: any) => rest);
  return c.json({ success: true, data: localStore.now });
});

// ── ADMIN: PUT /api/meta/admin/uses (replace all uses items) ────────────────
metaRouter.put('/admin/uses', async (c) => {
  try {
    const body = await c.req.json();
    if (!Array.isArray(body)) {
      return c.json({ success: false, error: 'Expected an array of uses categories' }, 400);
    }
    localStore.uses = body;
    return c.json({ success: true, data: localStore.uses });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

export default metaRouter;
