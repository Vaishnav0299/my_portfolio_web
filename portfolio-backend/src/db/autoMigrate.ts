import { client, isDatabaseConfigured } from './client.js';

/**
 * Auto-Migrator: Automatically creates missing tables and adds missing columns
 * in Supabase PostgreSQL whenever the backend starts or receives a sync trigger.
 */
export async function autoMigrateSchema(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!isDatabaseConfigured) {
    return {
      success: true,
      message: 'Database is in local fallback mode (DATABASE_URL not configured). In-memory schema active.',
    };
  }

  try {
    const start = Date.now();
    console.log('[DB Auto-Sync] Checking and verifying Supabase database schema...');

    // 1. Projects Table
    await client`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        category_name TEXT NOT NULL,
        type TEXT NOT NULL,
        badge_class TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        long_desc TEXT NOT NULL,
        features JSONB NOT NULL DEFAULT '[]'::jsonb,
        architecture TEXT NOT NULL,
        stack JSONB NOT NULL DEFAULT '[]'::jsonb,
        github TEXT NOT NULL,
        live TEXT NOT NULL,
        stars INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        tagline TEXT,
        problem TEXT,
        solution TEXT,
        metrics JSONB,
        mockup TEXT,
        role TEXT,
        period TEXT,
        highlights JSONB,
        challenges TEXT,
        accent TEXT,
        emoji TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Skills Table
    await client`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        icon TEXT NOT NULL,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Timeline Table
    await client`
      CREATE TABLE IF NOT EXISTS timeline (
        id SERIAL PRIMARY KEY,
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        inst TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        type TEXT DEFAULT 'work',
        location TEXT,
        achievements JSONB,
        stack JSONB,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 4. Services Table
    await client`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
        accent TEXT NOT NULL DEFAULT 'violet',
        icon TEXT NOT NULL DEFAULT 'Code2',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 5. Testimonials Table
    await client`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        quote TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        avatar_initials TEXT NOT NULL,
        accent TEXT NOT NULL DEFAULT 'violet',
        rating INTEGER NOT NULL DEFAULT 5,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 6. Blog Table
    await client`
      CREATE TABLE IF NOT EXISTS blog (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT NOT NULL,
        date TEXT NOT NULL,
        accent TEXT NOT NULL DEFAULT 'violet',
        body JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 7. Bio Table
    await client`
      CREATE TABLE IF NOT EXISTS bio (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        education TEXT NOT NULL,
        location TEXT NOT NULL,
        email TEXT NOT NULL,
        github TEXT NOT NULL,
        linkedin TEXT NOT NULL,
        twitter TEXT,
        website TEXT,
        resume_url TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        bio TEXT NOT NULL,
        interests JSONB NOT NULL DEFAULT '[]'::jsonb,
        current_focus TEXT NOT NULL,
        headline_prefix TEXT,
        hero_description TEXT,
        typewriter_phrases JSONB DEFAULT '[]'::jsonb,
        footer_tagline TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 8. Messages Table
    await client`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        role TEXT,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 9. Sync Log Table
    await client`
      CREATE TABLE IF NOT EXISTS sync_log (
        operation_id UUID PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        url TEXT NOT NULL,
        method TEXT NOT NULL
      );
    `;

    // 10. Site Config Table
    await client`
      CREATE TABLE IF NOT EXISTS site_config (
        id SERIAL PRIMARY KEY,
        components JSONB NOT NULL DEFAULT '{}'::jsonb,
        effects JSONB NOT NULL DEFAULT '{}'::jsonb,
        theme JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 11. FAQs Table
    await client`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 12. Documents Table (Resume, Certificates, Transcripts, Drive Links)
    await client`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'resume',
        description TEXT,
        source_type TEXT NOT NULL DEFAULT 'local_upload',
        file_url TEXT NOT NULL,
        drive_url TEXT,
        download_url TEXT NOT NULL,
        preview_url TEXT,
        file_name TEXT NOT NULL,
        file_size TEXT,
        mime_type TEXT,
        is_primary_resume BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 13. Column Diff Check: Ensure newly added columns exist in existing tables
    const columnAdditions = [
      client`ALTER TABLE bio ADD COLUMN IF NOT EXISTS headline_prefix TEXT;`,
      client`ALTER TABLE bio ADD COLUMN IF NOT EXISTS hero_description TEXT;`,
      client`ALTER TABLE bio ADD COLUMN IF NOT EXISTS typewriter_phrases JSONB DEFAULT '[]'::jsonb;`,
      client`ALTER TABLE bio ADD COLUMN IF NOT EXISTS footer_tagline TEXT;`,
      client`ALTER TABLE bio ADD COLUMN IF NOT EXISTS website TEXT;`,
      client`ALTER TABLE documents ADD COLUMN IF NOT EXISTS drive_url TEXT;`,
      client`ALTER TABLE documents ADD COLUMN IF NOT EXISTS preview_url TEXT;`,
      client`ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_url TEXT;`,
      client`ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_primary_resume BOOLEAN DEFAULT FALSE;`,
    ];

    await Promise.allSettled(columnAdditions);

    console.log(`[DB Auto-Sync] ✅ Supabase schema verified and synchronized in ${Date.now() - start}ms`);
    return {
      success: true,
      message: `Supabase schema automatically synchronized in ${Date.now() - start}ms`,
    };
  } catch (err) {
    console.warn('[DB Auto-Sync] ⚠️ Schema auto-sync notice:', (err as Error).message);
    return {
      success: false,
      message: (err as Error).message,
    };
  }
}
