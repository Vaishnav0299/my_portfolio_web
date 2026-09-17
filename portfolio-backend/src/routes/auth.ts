import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { loginSchema, type LoginInput } from '../shared/schemas.js';

const auth = new Hono();

auth.post('/login', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const { email, password } = result.data as LoginInput;

  const adminEmail   = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret    = process.env.JWT_SECRET;

  if (!adminEmail || !passwordHash || !jwtSecret) {
    return c.json({ success: false, error: 'Server configuration error: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, or JWT_SECRET not configured' }, 500);
  }

  const isEmailValid = email ? (email.trim().toLowerCase() === adminEmail) : false;
  const compareFn = (bcrypt as any).compare || (bcrypt as any).default?.compare;
  const isPasswordValid = await compareFn(password, passwordHash);

  if (!isEmailValid || !isPasswordValid) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  const expiresIn = 60 * 60 * 8; // 8 hours
  const signFn = (jwt as any).sign || (jwt as any).default?.sign;
  const token = signFn({ email: adminEmail, role: 'admin' }, jwtSecret, { expiresIn });

  return c.json({
    success: true,
    data: { token, expiresIn, email: adminEmail },
  });
});

auth.post('/logout', (c) => {
  // JWT is stateless — client drops the token
  // Server-side: could add to a blocklist here if needed
  return c.json({ success: true, message: 'Logged out successfully' });
});

export default auth;
