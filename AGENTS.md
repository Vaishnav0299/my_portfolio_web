Goal

Recreate the public portfolio + admin CMS from `https://github.com/Vaishnav0299/portfolio-v1.0.git` as a single TanStack Start app backed by Supabase. The first preview will use the seed data from the repo; your existing live data will be imported afterward.

## Decisions 

- **Admin login:** keep the original single admin password (not Lovable Cloud accounts).
- **Offline sync queue:** keep the Dexie.js IndexedDB queue + batch flush behavior for admin writes.
- **Existing data:** you have live records to migrate; we will import them after the preview is working.

## What the source repo contains

- Frontend: React + Vite + React Router DOM, 3D Vanta globe background, dark/light theme, custom CSS.
- Backend: Hono API with Drizzle ORM over Postgres/Supabase.
- Tables: `projects`, `skills`, `timeline`, `bio`, `messages`, `sync_log`.
- Public routes: `/`, `/about`, `/projects`, `/skills`, `/contact`, `/terminal`.
- Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/projects`, `/admin/skills`, `/admin/timeline`, `/admin/bio`.
- Contact form saves to DB and forwards to Web3Forms.

## Migration approach

Move the backend into TanStack Start `createServerFn` handlers and server routes. Keep the visual design and interactions as-is, ported to file-based TanStack Router routes.

## Phase 1: Cloud + schema + secrets

1. Enable Lovable Cloud for this project.
2. Write `.lovable/migrate-external-project/ledger.json` tracking: code, schema, records, auth, storage, external providers, public endpoints.
3. Create a single Supabase migration that:
   - Creates `projects`, `skills`, `timeline`, `bio`, `messages`, `sync_log` with the same columns/types.
   - Adds `GRANT` statements for `anon`/`authenticated`/`service_role`.
   - Enables RLS.
   - Adds public `anon` SELECT policies on `projects`, `skills`, `timeline`, `bio`.
   - Seeds `projects`, `skills`, `timeline`, `bio` from the repo's `seed.ts` so the first preview is populated.
4. Generate and store `SESSION_SECRET` (random 32+ char cookie secret).
5. Collect two secrets via Lovable's secure secret form:
   - `ADMIN_PASSWORD_HASH` — the bcrypt hash from your original `.env` (or a new hash you generate).
   - `WEB3FORMS_ACCESS_KEY` — from https://web3forms.com, only if you want email forwarding.

## Phase 2: Backend server functions

Create `src/lib/portfolio.functions.ts` and related modules:

- Public reads: `getProjects`, `getProject(id)`, `getSkills`, `getTimeline`, `getBio`.
- Contact: `submitContact` — inserts into `messages` and forwards to Web3Forms when the key is set.
- Admin auth: `adminLogin` (bcrypt compare against `ADMIN_PASSWORD_HASH`, set encrypted session), `adminLogout`, `requireAdmin` gate.
- Admin writes: `createProject`, `updateProject`, `deleteProject`, `createSkill`, `updateSkill`, `deleteSkill`, `createTimeline`, `updateTimeline`, `deleteTimeline`, `updateBio`.
- Sync: `syncBatch` — idempotent batch endpoint used by the offline queue, writes to `sync_log`.
- Health: `healthCheck` — simple DB ping used by the admin status indicator.

All admin writes run through `supabaseAdmin` (service role) after the `requireAdmin` gate. Public reads use a server-local publishable Supabase client with the narrow anon policies.

## Phase 3: Frontend port

Replace the placeholder `src/routes/index.tsx` and add the full route tree:

```text
src/routes/
  __root.tsx                 (global layout, fonts, Vanta scripts, theme provider)
  _public/route.tsx          (navbar, footer, globe bg, command palette, toast)
    index.tsx                (home / hero)
    about.tsx                (about + timeline)
    projects.tsx             (projects grid)
    skills.tsx               (skills matrix)
    contact.tsx              (contact form)
    terminal.tsx             (interactive CLI)
  admin.login.tsx            (single-password login)
  _admin/route.tsx           (sidebar + status bar)
    admin/dashboard.tsx
    admin/projects.tsx
    admin/skills.tsx
    admin/timeline.tsx
    admin/bio.tsx
```

Tasks:

- Port all JSX components to `.tsx`, preserving class names and custom properties.
- Replace `react-router-dom` `Link`/`NavLink`/`useNavigate` with `@tanstack/react-router` equivalents.
- Wrap `ThreeBackground` (Vanta globe) in `<ClientOnly>` so it never runs during SSR.
- Keep the existing `index.css` visual system by moving it into a dedicated `src/portfolio.css` imported from `__root.tsx`.
- Keep dark mode as the default; theme toggle writes `data-theme` and `localStorage`.
- Preserve the card-tilt mouse effect, command palette, toast, and terminal.
- Refactor `Projects`, `Skills`, `Timeline`, and `Bio` to read from TanStack loaders/`useSuspenseQuery` instead of client `useEffect` fetches.
- Keep the admin Dexie sync queue in `src/lib/syncManager.ts` and the `writeWithSync` helper; it will call the `syncBatch` server function.
- Keep `useHealthCheck` polling the new `healthCheck` server function.

## Phase 4: SEO / head metadata

- Update `__root.tsx` meta: title "Vaishnav Gaware | Full-Stack & AI Developer", description from the original repo.
- Add per-route `head()` for `/`, `/about`, `/projects`, `/skills`, `/contact`, `/terminal` with unique titles, descriptions, `og:title`, `og:description`, `og:type`, `twitter:card`.
- Set `og:image` and `twitter:image` on the home route to the GitHub avatar URL.

## Phase 5: Verify

1. Build/typecheck passes.
2. Public pages render with seeded projects, skills, timeline, and bio.
3. Contact form submits and records a message.
4. Admin login works with the stored password hash.
5. Admin CRUD for projects, skills, timeline, and bio works.
6. Offline sync queue: simulate a failed network request, queue an operation, then flush on reconnect.
7. Theme toggle and command palette work.

## Phase 6: Handoff for your existing data

After the preview is live:

- Export CSV or JSON from your current database for `projects`, `skills`, `timeline`, `bio`, and `messages`.
- I will import them in dependency order, preserving IDs where possible.
- Reply "Skip for now" if you want to keep the seeded repo data.

## Risks / notes

- The original app uses a CDN-loaded Vanta/Three.js globe. We will load those scripts in `__root.tsx` and only initialize the effect on the client.
- The Hono API and separate `apps/api` package are replaced by TanStack server functions; no separate backend service remains.
- Because admin auth is a shared password gate, there is no per-user identity or revocation. If you later need multiple admin users or role-based access, we should switch to Lovable Cloud auth.
