/**
 * Vercel Serverless Function Entry Point for the Hono API
 * ─────────────────────────────────────────────────────────
 * This file lives at the repo root /api/index.ts.
 * Vercel treats /api/*.ts as serverless functions automatically.
 *
 * Uses named HTTP method exports per Vercel Web Fetch handler specification.
 */
import { handle } from 'hono/vercel';
import app from '../portfolio-backend/src/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = handle(app as any);

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const DELETE  = handler;
export const PATCH   = handler;
export const OPTIONS = handler;
