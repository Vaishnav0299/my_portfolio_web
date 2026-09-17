import { type Context, type Next } from 'hono';

export async function errorHandler(err: Error, c: Context) {
  console.error('[API Error]', err.message, err.stack);
  return c.json(
    { success: false, error: 'Internal server error', message: err.message },
    500
  );
}

export async function notFound(c: Context) {
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
}
