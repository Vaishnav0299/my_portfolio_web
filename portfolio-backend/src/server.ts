import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './index.js';
import { initDbSync, stopDbSync } from './db/dbSync.js';

const port = Number(process.env.PORT) || 3002;

// Sync localStore from database before accepting requests
await initDbSync();

console.log(`🚀 Hono API dev server listening at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '127.0.0.1',
});

// Graceful shutdown
process.on('SIGTERM', () => { stopDbSync(); process.exit(0); });
process.on('SIGINT', () => { stopDbSync(); process.exit(0); });

