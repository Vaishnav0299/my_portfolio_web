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

const client = postgres(connectionString, {
  max: 1,                  // Vercel serverless: single connection per invocation
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,          // Required for Supabase PgBouncer in transaction mode
  ssl: 'require',          // Explicit SSL mode for Supabase pooled cloud connection
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
