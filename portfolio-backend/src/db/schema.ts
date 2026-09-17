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
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── skills ─────────────────────────────────────────────────────────────────
export const skills = pgTable('skills', {
  id:        serial('id').primaryKey(),
  category:  text('category').notNull(),
  icon:      text('icon').notNull(),
  items:     jsonb('items').notNull().$type<Array<{ name: string; val: string }>>(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── timeline ───────────────────────────────────────────────────────────────
export const timeline = pgTable('timeline', {
  id:        serial('id').primaryKey(),
  time:      text('time').notNull(),          // e.g. "2026"
  title:     text('title').notNull(),
  inst:      text('inst').notNull(),
  desc:      text('desc').notNull(),
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
  resumeUrl:    text('resume_url').notNull(),
  avatarUrl:    text('avatar_url').notNull(),
  bio:          text('bio').notNull(),
  interests:    jsonb('interests').notNull().$type<string[]>(),
  currentFocus: text('current_focus').notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── messages (contact form submissions) ───────────────────────────────────
export const messages = pgTable('messages', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  message:   text('message').notNull(),
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
