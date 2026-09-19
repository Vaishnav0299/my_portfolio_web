import { pgTable, serial, text, integer, jsonb, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// ─── projects ───────────────────────────────────────────────────────────────
export const projects = pgTable('projects', {
  id:           serial('id').primaryKey(),
  name:         text('name').notNull(),
  category:     text('category').notNull(),       // 'data-analytics' | 'fullstack' | 'ai'
  categoryName: text('category_name').notNull(),
  type:         text('type').notNull(),
  badgeClass:   text('badge_class').notNull(),
  desc:         text('desc').notNull(),
  longDesc:     text('long_desc').notNull(),
  features:     jsonb('features').notNull().$type<string[]>(),
  architecture: text('architecture').notNull(),
  stack:        jsonb('stack').notNull().$type<string[]>(),
  github:       text('github').notNull(),
  live:         text('live').notNull(),
  stars:        integer('stars').notNull().default(0),
  status:       text('status').notNull(),
  sortOrder:    integer('sort_order').notNull().default(0),
  // Rich extensions from New portfolio
  tagline:      text('tagline'),
  problem:      text('problem'),
  solution:     text('solution'),
  metrics:      jsonb('metrics').$type<Array<{ label: string; value: string }>>(),
  mockup:       text('mockup'),                   // 'dashboard' | 'chat' | 'editor' | 'ledger'
  role:         text('role'),
  period:       text('period'),
  highlights:   jsonb('highlights').$type<string[]>(),
  challenges:   text('challenges'),
  accent:       text('accent'),                   // 'violet' | 'emerald' | 'amber'
  emoji:        text('emoji'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── skills ─────────────────────────────────────────────────────────────────
export const skills = pgTable('skills', {
  id:        serial('id').primaryKey(),
  category:  text('category').notNull(),
  icon:      text('icon').notNull(),
  items:     jsonb('items').notNull().$type<Array<{ name: string; val: string; level?: number }>>(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── timeline ───────────────────────────────────────────────────────────────
export const timeline = pgTable('timeline', {
  id:           serial('id').primaryKey(),
  time:         text('time').notNull(),          // e.g. "2023 — Present"
  title:        text('title').notNull(),
  inst:         text('inst').notNull(),
  desc:         text('desc').notNull(),
  type:         text('type').default('work'),    // 'work' | 'education'
  location:     text('location'),
  achievements: jsonb('achievements').$type<string[]>(),
  stack:        jsonb('stack').$type<string[]>(),
  sortOrder:    integer('sort_order').notNull().default(0),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── services ───────────────────────────────────────────────────────────────
export const services = pgTable('services', {
  id:          serial('id').primaryKey(),
  title:       text('title').notNull(),
  description: text('description').notNull(),
  bullets:     jsonb('bullets').notNull().$type<string[]>(),
  accent:      text('accent').notNull().default('violet'),
  icon:        text('icon').notNull().default('Code2'),
  sortOrder:   integer('sort_order').notNull().default(0),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── testimonials ───────────────────────────────────────────────────────────
export const testimonials = pgTable('testimonials', {
  id:             serial('id').primaryKey(),
  quote:          text('quote').notNull(),
  name:           text('name').notNull(),
  title:          text('title').notNull(),
  company:        text('company').notNull(),
  avatarInitials: text('avatar_initials').notNull(),
  accent:         text('accent').notNull().default('violet'),
  rating:         integer('rating').notNull().default(5),
  sortOrder:      integer('sort_order').notNull().default(0),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── blog ───────────────────────────────────────────────────────────────────
export const blog = pgTable('blog', {
  id:        serial('id').primaryKey(),
  slug:      text('slug').notNull().unique(),
  title:     text('title').notNull(),
  excerpt:   text('excerpt').notNull(),
  category:  text('category').notNull(),
  readTime:  text('read_time').notNull(),
  date:      text('date').notNull(),
  accent:    text('accent').notNull().default('violet'),
  body:      jsonb('body').notNull().$type<any[]>(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── bio (single row) ───────────────────────────────────────────────────────
export const bio = pgTable('bio', {
  id:           serial('id').primaryKey(),
  name:         text('name').notNull(),
  title:        text('title').notNull(),
  education:    text('education').notNull(),
  location:     text('location').notNull(),
  email:        text('email').notNull(),
  github:       text('github').notNull(),
  linkedin:     text('linkedin').notNull(),
  twitter:      text('twitter'),
  resumeUrl:    text('resume_url').notNull(),
  avatarUrl:    text('avatar_url').notNull(),
  bio:          text('bio').notNull(),
  interests:    jsonb('interests').notNull().$type<string[]>(),
  currentFocus: text('current_focus').notNull(),
  stats:        jsonb('stats').$type<Array<{ label: string; value: string }>>(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── messages (contact form submissions) ───────────────────────────────────
export const messages = pgTable('messages', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  message:   text('message').notNull(),
  role:      text('role'),
  read:      boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── sync_log (idempotency for offline sync) ────────────────────────────────
export const syncLog = pgTable('sync_log', {
  operationId: uuid('operation_id').primaryKey(),  // UUID from client
  appliedAt:   timestamp('applied_at', { withTimezone: true }).defaultNow(),
  url:         text('url').notNull(),
  method:      text('method').notNull(),
});

// ─── site_config (dynamic component toggles, effects & appearance) ─────────
export const siteConfig = pgTable('site_config', {
  id:         serial('id').primaryKey(),
  components: jsonb('components').notNull().$type<Record<string, boolean>>(),
  effects:    jsonb('effects').notNull().$type<Record<string, boolean>>(),
  theme:      jsonb('theme').notNull().$type<Record<string, any>>(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── faqs ───────────────────────────────────────────────────────────────────
export const faqs = pgTable('faqs', {
  id:        serial('id').primaryKey(),
  question:  text('question').notNull(),
  answer:    text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});


