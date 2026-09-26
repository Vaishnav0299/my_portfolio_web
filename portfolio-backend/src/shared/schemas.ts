import { z } from 'zod';

// ─── Zod Validation Schemas ──────────────────────────────────────────────────
// Single source of truth for all request validation.
// Used on: API routes (server-side) + admin forms (client-side).

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  role:    z.string().optional(),
});

export const projectSchema = z.object({
  name:         z.string().min(1, 'Project name is required'),
  category:     z.string().default('fullstack'),
  categoryName: z.string().default('Full-Stack Systems'),
  type:         z.string().default('Full Stack Platform'),
  badgeClass:   z.string().default('fullstack'),
  desc:         z.string().nullable().optional().transform((v) => (v ?? '').trim()),
  longDesc:     z.string().nullable().optional().transform((v) => (v ?? '').trim()),
  features:     z.array(z.string()).optional().default([]),
  architecture: z.string().nullable().optional().transform((v) => (v ?? '').trim()),
  stack:        z.array(z.string()).optional().default([]),
  github:       z.string().nullable().optional().transform((v) => (v ?? '').trim()),
  live:         z.string().nullable().optional().transform((v) => (v ?? '').trim()),
  stars:        z.number().int().min(0).default(0),
  status:       z.string().default('Production Ready'),
  sortOrder:    z.number().int().default(0),
  tagline:      z.string().optional(),
  problem:      z.string().optional(),
  solution:     z.string().optional(),
  metrics:      z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  mockup:       z.enum(['dashboard', 'chat', 'editor', 'ledger']).optional(),
  role:         z.string().optional(),
  period:       z.string().optional(),
  highlights:   z.array(z.string()).optional(),
  challenges:   z.string().optional(),
  accent:       z.enum(['violet', 'emerald', 'amber']).optional(),
  emoji:        z.string().optional(),
});

export const skillItemSchema = z.object({
  name:  z.string().min(1),
  val:   z.string(),
  level: z.number().optional(),
});

export const skillSchema = z.object({
  category:  z.string().min(1),
  icon:      z.string().min(1),
  items:     z.array(skillItemSchema).min(1),
  sortOrder: z.number().int().default(0),
});

export const timelineSchema = z.object({
  time:         z.string().min(1),
  title:        z.string().min(1),
  inst:         z.string().min(1),
  desc:         z.string().min(10),
  type:         z.enum(['work', 'education']).optional(),
  location:     z.string().optional(),
  achievements: z.array(z.string()).optional(),
  stack:        z.array(z.string()).optional(),
  sortOrder:    z.number().int().default(0),
});

export const serviceSchema = z.object({
  title:       z.string().min(1),
  description: z.string().min(1),
  bullets:     z.array(z.string()).min(1),
  accent:      z.enum(['violet', 'emerald', 'amber']).default('violet'),
  icon:        z.string().default('Code2'),
  sortOrder:   z.number().int().default(0),
});

export const testimonialSchema = z.object({
  quote:          z.string().min(1),
  name:           z.string().optional(),
  author:         z.string().optional(),
  title:          z.string().optional(),
  role:           z.string().optional(),
  company:        z.string().default(''),
  avatarInitials: z.string().optional(),
  avatar:         z.string().optional(),
  accent:         z.enum(['violet', 'emerald', 'amber']).default('violet'),
  rating:         z.number().int().min(1).max(5).default(5),
  sortOrder:      z.number().int().default(0),
});

export const blogSchema = z.object({
  slug:      z.string().min(1),
  title:     z.string().min(1),
  excerpt:   z.string().min(1),
  category:  z.string().min(1),
  readTime:  z.string().min(1),
  date:      z.string().min(1),
  accent:    z.enum(['violet', 'emerald', 'amber']).default('violet'),
  body:      z.array(z.any()).min(1),
  sortOrder: z.number().int().default(0),
});

export const bioSchema = z.object({
  name:         z.string().min(1),
  title:        z.string().min(1),
  education:    z.string().min(1),
  location:     z.string().min(1),
  email:        z.string().email(),
  github:       z.string().min(1),
  linkedin:     z.string().min(1),
  twitter:      z.string().optional(),
  website:      z.string().optional(),
  resumeUrl:    z.string().min(1),
  avatarUrl:    z.string().min(1),
  bio:          z.string().min(20),
  interests:    z.array(z.string()).min(1),
  currentFocus: z.string().min(10),
  // Hero customization fields
  headlinePrefix:    z.string().optional(),
  heroDescription:   z.string().optional(),
  typewriterPhrases: z.array(z.string()).optional(),
  // Footer description override
  footerTagline:     z.string().optional(),
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

export const siteConfigSchema = z.object({
  components:    z.record(z.string(), z.boolean()).default({}),
  subcomponents: z.record(z.string(), z.boolean()).optional().default({}),
  effects:       z.record(z.string(), z.boolean()).default({}),
  theme:         z.record(z.string(), z.any()).default({}),
});

export const faqSchema = z.object({
  question:  z.string().min(1, 'Question is required'),
  answer:    z.string().min(1, 'Answer is required'),
  sortOrder: z.number().int().default(0),
});

export const documentCategoryEnum = z.enum(['resume', 'certificate', 'transcript', 'whitepaper', 'recommendation', 'other']);
export const documentSourceTypeEnum = z.enum(['local_upload', 'gdrive_link', 'external_url']);

export const documentDriveSchema = z.object({
  title:           z.string().min(1, 'Title is required'),
  category:        documentCategoryEnum.default('resume'),
  description:     z.string().optional().default(''),
  driveUrl:        z.string().url('A valid Google Drive or external URL is required'),
  isPrimaryResume: z.boolean().optional().default(false),
  sortOrder:       z.number().int().default(0),
});

export const documentUpdateSchema = z.object({
  title:           z.string().min(1, 'Title is required'),
  category:        documentCategoryEnum,
  description:     z.string().optional().default(''),
  fileUrl:         z.string().optional(),
  driveUrl:        z.string().optional(),
  downloadUrl:     z.string().optional(),
  previewUrl:      z.string().optional(),
  fileName:        z.string().optional(),
  isPrimaryResume: z.boolean().optional(),
  sortOrder:       z.number().int().optional(),
});

// Inferred TypeScript types from schemas
export type ContactInput        = z.infer<typeof contactSchema>;
export type ProjectInput        = z.infer<typeof projectSchema>;
export type SkillInput          = z.infer<typeof skillSchema>;
export type TimelineInput       = z.infer<typeof timelineSchema>;
export type ServiceInput        = z.infer<typeof serviceSchema>;
export type TestimonialInput    = z.infer<typeof testimonialSchema>;
export type BlogInput           = z.infer<typeof blogSchema>;
export type BioInput            = z.infer<typeof bioSchema>;
export type LoginInput          = z.infer<typeof loginSchema>;
export type SyncBatchInput      = z.infer<typeof syncBatchSchema>;
export type SiteConfigInput     = z.infer<typeof siteConfigSchema>;
export type FaqInput            = z.infer<typeof faqSchema>;
export type DocumentDriveInput  = z.infer<typeof documentDriveSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;



