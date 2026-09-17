import { z } from 'zod';

// ─── Zod Validation Schemas ──────────────────────────────────────────────────
// Single source of truth for all request validation.
// Used on: API routes (server-side) + admin forms (client-side).

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const projectSchema = z.object({
  name:         z.string().min(1, 'Project name is required'),
  category:     z.string().min(1),
  categoryName: z.string().min(1),
  type:         z.string().min(1),
  badgeClass:   z.string().min(1),
  desc:         z.string().min(10),
  longDesc:     z.string().min(10),
  features:     z.array(z.string()).min(1),
  architecture: z.string().min(1),
  stack:        z.array(z.string()).min(1),
  github:       z.string().url('Must be a valid URL'),
  live:         z.string().url('Must be a valid URL'),
  stars:        z.number().int().min(0).default(0),
  status:       z.string().min(1),
  sortOrder:    z.number().int().default(0),
});

export const skillItemSchema = z.object({
  name: z.string().min(1),
  val:  z.string().regex(/^\d+%$/, 'Must be a percentage like "95%"'),
});

export const skillSchema = z.object({
  category:  z.string().min(1),
  icon:      z.string().min(1),
  items:     z.array(skillItemSchema).min(1),
  sortOrder: z.number().int().default(0),
});

export const timelineSchema = z.object({
  time:      z.string().min(1),
  title:     z.string().min(1),
  inst:      z.string().min(1),
  desc:      z.string().min(10),
  sortOrder: z.number().int().default(0),
});

export const bioSchema = z.object({
  name:         z.string().min(1),
  title:        z.string().min(1),
  education:    z.string().min(1),
  location:     z.string().min(1),
  email:        z.string().email(),
  github:       z.string().url(),
  linkedin:     z.string().url(),
  resumeUrl:    z.string().url(),
  avatarUrl:    z.string().url(),
  bio:          z.string().min(20),
  interests:    z.array(z.string()).min(1),
  currentFocus: z.string().min(10),
});

export const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required'),
});

export const syncOperationSchema = z.object({
  operationId: z.string().uuid(),
  method:      z.enum(['POST', 'PUT', 'DELETE']),
  url:         z.string().min(1),
  body:        z.unknown().optional(),
  timestamp:   z.number(),
});

export const syncBatchSchema = z.object({
  operations: z.array(syncOperationSchema).min(1).max(50),
});

// Inferred TypeScript types from schemas
export type ContactInput    = z.infer<typeof contactSchema>;
export type ProjectInput    = z.infer<typeof projectSchema>;
export type SkillInput      = z.infer<typeof skillSchema>;
export type TimelineInput   = z.infer<typeof timelineSchema>;
export type BioInput        = z.infer<typeof bioSchema>;
export type LoginInput      = z.infer<typeof loginSchema>;
export type SyncBatchInput  = z.infer<typeof syncBatchSchema>;
