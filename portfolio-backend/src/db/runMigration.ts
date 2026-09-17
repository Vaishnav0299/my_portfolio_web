import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
config({ path: path.resolve(__dirname, '../../../../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is not defined in .env');
  process.exit(1);
}

console.log('Connecting to Supabase PostgreSQL database...');

const sql = postgres(connectionString, {
  max: 1,
  connect_timeout: 15,
  ssl: 'require',
});

async function run() {
  try {
    const migrationPath = path.resolve(__dirname, '../../../../supabase/migrations/0001_initial_schema.sql');
    console.log(`Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration to Supabase...');
    await sql.unsafe(sqlContent);
    console.log('✅ Migration executed successfully!');

    // Verify row counts
    const projects = await sql`SELECT count(*)::int as count FROM projects`;
    const skills = await sql`SELECT count(*)::int as count FROM skills`;
    const timeline = await sql`SELECT count(*)::int as count FROM timeline`;
    const bio = await sql`SELECT count(*)::int as count FROM bio`;

    console.log('\n📊 Database Status:');
    console.log(`  • Projects: ${projects[0].count} rows`);
    console.log(`  • Skills Categories: ${skills[0].count} rows`);
    console.log(`  • Timeline Nodes: ${timeline[0].count} rows`);
    console.log(`  • Bio Profile: ${bio[0].count} rows`);

    await sql.end();
    console.log('\n🚀 Database is fully migrated and ready!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    await sql.end();
    process.exit(1);
  }
}

run();
