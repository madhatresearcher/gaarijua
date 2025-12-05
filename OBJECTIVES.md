# Gaarijua — Objectives & Progress

This file tracks the high-level objectives for the Gaarijua project, what we've completed so far, and what remains to be done. Update this file as tasks are completed or new tasks are added.

**Project Summary**

- Purpose: Marketplace for vehicles and parts (rentals and sales).
- Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase (Auth, Realtime, Postgres, Storage).

**How to use this file**

- Mark tasks as `Done` or `In progress` by editing this file or updating the repository TODO tracker.
- For DB or code changes, prefer PRs so changes are auditable.

**Completed**

- Seeded database and created tables: `public.cars`, `public.parts` (seeded sample rows).
- Added `lib/supabase-client.ts` and `lib/supabase-server.ts` (existing).
- Added diagnostic scripts (`scripts/list-tables.js`, `scripts/run-sql.js`, `scripts/seed-gaarijua.sql`) to create and seed tables.
- Implemented server-side fetching for initial lists on `app/cars` and `app/parts`.
- Implemented realtime client subscriptions and list components:
  - `components/CarsList.tsx` (realtime, search, filters)
  - `components/PartsList.tsx` (realtime, search)
- Replaced placeholder sample data with live DB-backed lists.
- Implemented detail pages to fetch by `slug` or `id` for `cars` and `parts`:
  - `app/cars/[id]/page.tsx`
  - `app/parts/[id]/page.tsx`
- Fixed TypeScript issues and added typings for realtime lists.
- Committed and pushed changes to `main`.

**In Progress / Immediate Next**

- Add dynamic metadata (title, description, Open Graph) on detail pages for SEO and social previews. (Not started)
- Implement pagination and server-side sorting for lists to support large datasets. (Not started)

**Pending / Backlog**

- Revert TLS relaxation changes in diagnostic scripts and ensure secure connections for production flows. (Not started)
- Add create/edit listing flows (forms + server-side validation) so users can post cars/parts. (Not started)
- Integrate Supabase Storage for image uploads and update listing images to use storage URLs. (Not started)
- Add tests and CI (linting, type checks, and integration tests for Supabase interactions). (Not started)
- Add search engine or full-text indexes for advanced search (if needed at scale). (Backlog)
- Add create/edit listing flows (forms + server-side validation) so users can post cars/parts. (Not started)
- Integrate Supabase Storage for image uploads and update listing images to use storage URLs. (Not started)
- Add tests and CI (linting, type checks, and integration tests for Supabase interactions). (Not started)
- Add search engine or full-text indexes for advanced search (if needed at scale). (Backlog)
- Implement authentication flows (sign-in / register) and protect write/admin operations. (Not started)  
  _Note: authentication flows are deferred to the end of the roadmap (DEAD LAST)._ 

**Deployment / DevOps**

- Vercel build succeeded locally after TypeScript fixes. CI should run `npm run build` and `npm test` (if tests are added).
- Keep `SUPABASE_SERVICE_ROLE_KEY` secure; use it only on server-side or in CI secrets.

**Contacts / Notes**

- DB seeds were applied using `scripts/run-sql.js` which uses the `POSTGRES_*` variables in `.env.local`.
- Realtime is implemented using `@supabase/supabase-js` channels from the client (`supabase` anon key) for public listings.

**Next Action Options (choose one)**

- Add dynamic metadata for detail pages (recommended next for SEO).
- Implement pagination + sorting for the list pages.
- Add auth + listing creation flows.

---

_Last updated: 2025-12-05_
