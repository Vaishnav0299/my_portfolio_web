import type { MiddlewareHandler } from 'hono';
import * as jwt from 'jsonwebtoken';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: Missing or malformed token' }, 401);
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET environment variable is not configured');
    return c.json({ success: false, error: 'Server configuration error' }, 500);
  }

  try {
    const verifyFn = (jwt as any).verify || (jwt as any).default?.verify;
    const payload = verifyFn(token, secret, { algorithms: ['HS256'] });
    c.set('jwtPayload' as any, payload);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, 401);
  }
};

