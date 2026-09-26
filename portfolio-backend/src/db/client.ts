import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  config({ path: path.resolve(__dirname, '../../../.env') });
  config({ path: path.resolve(__dirname, '../../.env') });
  config({ path: path.resolve(__dirname, '../.env') });
} catch {
  // dotenv optional in production
}

// Fallback connection string prevents top-level module evaluation crashes during build tracing
const connectionString = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@localhost:5432/placeholder';

export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('placeholder') &&
  process.env.DATABASE_URL.trim() !== ''
);

export const client = postgres(connectionString, {
  max: process.env.VERCEL ? 1 : 10,  // 10 concurrent connections for Node server, 1 for serverless
  idle_timeout: 300,                 // 5 minutes (eliminates aggressive 30s connection teardown & 3s cold starts)
  connect_timeout: 10,               // 10s to tolerate cross-region SSL handshakes
  prepare: false,                    // Required for Supabase PgBouncer in transaction mode
  ssl: 'require',                    // Explicit SSL mode for Supabase pooled cloud connection
});

export const db = drizzle(client, { schema });
export type Database = typeof db;

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Pre-warms the database connection pool on startup and maintains a lightweight
 * 45s keep-alive heartbeat to prevent cold TLS handshake delays (~3000ms).
 */
export async function warmUpDatabase(): Promise<void> {
  if (!isDatabaseConfigured) return;

  try {
    const start = Date.now();
    await client`SELECT 1`;
    console.log(`[DB] Supabase connection pool pre-warmed in ${Date.now() - start}ms`);

    // Dynamically import and trigger auto-migration so tables are created automatically
    const { autoMigrateSchema } = await import('./autoMigrate.js');
    await autoMigrateSchema().catch((err) => {
      console.warn('[DB] Auto-migration warning:', (err as Error).message);
    });
  } catch (err) {
    console.warn('[DB] Pre-warm query failed:', (err as Error).message);
  }

  if (!keepAliveTimer && !process.env.VERCEL) {
    keepAliveTimer = setInterval(async () => {
      try {
        await client`SELECT 1`;
      } catch {
        // Heartbeat error silently handled; subsequent queries will reconnect
      }
    }, 45000);

    // Allow Node process to exit gracefully without waiting on heartbeat
    if (typeof keepAliveTimer.unref === 'function') {
      keepAliveTimer.unref();
    }
  }
}
