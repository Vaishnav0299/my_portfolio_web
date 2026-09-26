# ⚡ Full-Stack Developer Portfolio & Admin CMS Monorepo

> A modern, production-ready, interactive developer portfolio platform and full-featured Admin CMS. Built as a high-performance monorepo with **React 18**, **Vite 5**, **Hono API**, **Supabase (PostgreSQL)**, **Drizzle ORM**, **Three.js WebGL graphics**, and **Dexie.js Offline Sync**.

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Hono](https://img.shields.io/badge/Hono-4.4-e36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-c5f74f?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

## 🏗️ System Architecture

The project is architected as a clean, decoupled monorepo sharing unified type contracts across frontend and backend:

```
                              ┌──────────────────────────────────────────────┐
                              │            Public Visitors / Recruiters      │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                       ┌─────────────▼─────────────┐
                                       │   portfolio-frontend      │
                                       │   (React 18 + Vite 5 SPA) │
                                       └─────────────┬─────────────┘
                                                     │ API Requests
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            portfolio-backend                 │
                              │      (Hono API + TypeScript Server)          │
                              └──────────────┬────────────────┬──────────────┘
                                             │                │
                        ┌────────────────────▼────┐      ┌────▼─────────────────────────┐
                        │   Drizzle ORM & Migrator│      │  Local In-Memory Store       │
                        │  (autoMigrateSchema)    │      │  (Zero-Crash Dev Fallback)   │
                        └────────────┬────────────┘      └──────────────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │   Supabase PostgreSQL   │
                        │ (Cloud Database & Auth) │
                        └─────────────────────────┘
```

---

## ✨ Core Engineering Features

### 1. 🎛️ Dynamic Admin CMS & Site Customizer
- **Visual Site Customizer**: Toggle individual sections on/off, customize accent palettes (`violet`, `cyan`, `emerald`, `amber`, `rose`), and tweak hero typography in real time.
- **Full Content Management**: Dedicated management modules for Projects, Skills, Timeline, Services, Testimonials, FAQs, Blog posts, and Live Focus (`/now` & `/uses`).
- **Telemetry & GitHub Automation**: Integrated Python automation script syncing GitHub commit velocity and repository star counts.

### 2. 📑 Unified Document & Resume Management Studio
- **Dual-Mode Uploads**:
  - **Local File Upload**: Drag-and-drop support for PDF, DOC, DOCX, and images (saved with unique sanitized hashing).
  - **Google Drive Integration**: Automatic parsing of shareable Google Drive links into direct export download streams and in-browser preview embeds.
- **1-Click Active Resume Sync**: Marking any document as the primary resume immediately updates the entire site (Navbar, Hero CTA, Command Palette, and Bio record).
- **Public Credentials Showcase**: Visitors and recruiters can preview and download certificates, transcripts, and whitepapers via an interactive viewer modal.

### 3. ⚡ Automatic Supabase Schema Synchronization
- **Startup Auto-Migrator (`autoMigrate.ts`)**: Automatically checks Supabase on boot and executes `CREATE TABLE IF NOT EXISTS` with column diff verification.
- **Direct CLI Push**: Run `pnpm db:push` to sync TypeScript Drizzle schema definitions with Supabase in one command.
- **Admin One-Click Sync**: Verify and auto-migrate tables directly from the Admin Dashboard.

### 4. 🛡️ Offline-First Resilience & Sync Queue
- **Dexie.js Client Queue**: All admin writes are queued in IndexedDB when offline.
- **Auto-Flush Reconnect**: Automatically syncs queued operations with idempotency tracking (`sync_log`) upon reconnection.
- **Zero-Crash Local Fallback**: When `DATABASE_URL` is unconfigured, the backend smoothly falls back to an in-memory store without breaking frontend previews.

### 5. 🎨 Rich Visuals & Interactive UX
- **Custom Glassmorphism Design System**: Built with modular Vanilla CSS tokens for ultra-fast render performance.
- **Interactive Command Palette (⌘K / Ctrl+K)**: Instant keyboard navigation, section jumps, and document downloads.
- **3D Spatial Tilt Effects**: Dynamic perspective tilting on project cards.
- **Theme Engine**: Smooth dark/light mode switching with persistent `localStorage` and `data-theme` synchronization.

---

## 📁 Monorepo Workspace Structure

```text
Portfolio/
├── api/
│   └── index.ts                 # Vercel serverless function entrypoint (Hono Web Fetch handler)
├── portfolio-backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── autoMigrate.ts   # Automatic Supabase schema synchronization engine
│   │   │   ├── client.ts        # Postgres client connection pool & keepalive warmup
│   │   │   ├── localStore.ts    # In-memory local fallback store & seed data
│   │   │   └── schema.ts        # Drizzle ORM database schema definitions
│   │   ├── routes/              # Modular Hono API endpoints (auth, bio, docs, projects, sync, etc.)
│   │   ├── shared/              # Shared TypeScript types & Zod validation schemas
│   │   ├── index.ts             # Hono app configuration & middleware
│   │   └── server.ts            # Local development server (port 3002)
│   ├── drizzle.config.ts        # Drizzle Kit configuration
│   └── package.json
├── portfolio-frontend/
│   ├── public/
│   │   ├── uploads/             # Public uploaded documents & assets
│   │   └── resume.pdf           # Default resume fallback
│   ├── src/
│   │   ├── admin/               # Admin CMS views (Dashboard, Documents, Customizer, Projects, etc.)
│   │   ├── components/          # Reusable UI components (Navbar, Hero, About, CommandPalette, Modals)
│   │   ├── context/             # Config & theme state providers
│   │   ├── lib/                 # API client wrapper & IndexedDB sync manager
│   │   ├── pages/               # Public portfolio pages
│   │   ├── App.jsx              # Application router & layout tree
│   │   └── index.css            # Glassmorphism design system & variables
│   └── vite.config.js           # Vite configuration & dev proxy
├── scripts/
│   └── sync_github.py           # GitHub telemetry synchronization script
├── package.json                 # Root monorepo workspace configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
└── vercel.json                  # Production deployment routing configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **pnpm**: `v9.x` or later (`npm install -g pnpm`)
- **Python**: `3.x` (optional, for GitHub telemetry sync)

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/Vaishnav0299/my_portfolio_web.git
cd my_portfolio_web
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# Supabase PostgreSQL Connection String (Transaction Pooler URI)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT Secret for Admin Session Tokens
JWT_SECRET=your_super_secret_jwt_key_here

# Admin Credentials
ADMIN_EMAIL=admin@portfolio.dev
ADMIN_PASSWORD_HASH=$2a$10$YourBcryptPasswordHashHere

# Frontend API URL (Relative '/api' for production, or http://localhost:3002/api for local)
VITE_API_URL=/api

# Web3Forms API Key (Optional for contact form email forwarding)
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key_here
```

### 3. Development Server
Start both backend API and frontend client concurrently:
```bash
pnpm dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3002/api`
- **Admin Login**: `http://localhost:5173/admin/login`

---

## 🛠️ Monorepo Scripts Reference

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts frontend (`5173`) and backend (`3002`) in parallel |
| `pnpm build` | Builds backend TypeScript and frontend Vite production bundle |
| `pnpm db:push` | Pushes schema changes directly to Supabase using Drizzle Kit |
| `pnpm db:studio` | Launches Drizzle Studio GUI for database inspection |
| `pnpm seed` | Seeds database with initial projects, skills, timeline, and bio records |
| `pnpm sync` | Executes Python script to fetch latest GitHub repository telemetry |
| `pnpm lint` | Runs TypeScript type checking across all workspace packages |

---

## 🌐 Production Deployment

This monorepo is configured for one-click deployment on **Vercel**:

- **Frontend**: Static SPA built via Vite to `/dist`.
- **Backend**: Serverless Hono Web Fetch handler exported from `/api/index.ts`.
- **Route Rewrites**: All `/api/*` routes map to the serverless function, while static assets and client routes are served automatically.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
