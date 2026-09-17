import { Hono } from 'hono';
import { db } from '../db/client.js';
import { sql } from 'drizzle-orm';
import { isDbConfigured } from '../db/localStore.js';

const health = new Hono();

health.get('/', async (c) => {
  const start = Date.now();

  if (!isDbConfigured) {
    return c.json({
      success: true,
      ok: true,
      mode: 'local',
      latencyMs: 1,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await db.execute(sql`SELECT 1`);
    const latencyMs = Date.now() - start;
    return c.json({
      success: true,
      ok: true,
      mode: 'supabase',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const latencyMs = Date.now() - start;
    return c.json({
      success: false,
      ok: false,
      latencyMs,
      timestamp: new Date().toISOString(),
      error: 'Database unreachable',
    }, 503);
  }
});

export default health;
