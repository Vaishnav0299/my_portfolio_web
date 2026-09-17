// ─── Shared TypeScript Types ────────────────────────────────────────────────
// Used by both apps/web (frontend) and apps/api (backend) to guarantee
// type contract parity. Never let frontend and backend drift out of sync.

export interface Project {
  id: number;
  name: string;
  category: string;          // 'data-analytics' | 'fullstack' | 'ai'
  categoryName: string;
  type: string;
  badgeClass: string;
  desc: string;
  longDesc: string;
  features: string[];
  architecture: string;
  stack: string[];
  github: string;
  live: string;
  stars: number;
  status: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillItem {
  name: string;
  val: string; // e.g. "95%"
}

export interface Skill {
  id: number;
  category: string;
  icon: string;
  items: SkillItem[];
  sortOrder: number;
  updatedAt?: string;
}

export interface TimelineEntry {
  id: number;
  time: string;
  title: string;
  inst: string;
  desc: string;
  sortOrder: number;
  updatedAt?: string;
}

export interface Bio {
  name: string;
  title: string;
  education: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  currentFocus: string;
  updatedAt?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface SyncOperation {
  operationId: string;       // UUID v4 — used for idempotency
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;               // e.g. /api/admin/projects/1
  body?: unknown;
  timestamp: number;
}

export interface HealthResponse {
  ok: boolean;
  latencyMs: number;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}
