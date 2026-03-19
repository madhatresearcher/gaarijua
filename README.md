# Gaarijua

Scaffolded Next.js (App Router) + TypeScript + Tailwind project for the Gaarijua automotive marketplace.

Run locally:

```powershell
npm install
npm run dev
```

Environment variables (create a `.env.local` file):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database helpers

- Run `node scripts/run-sql.js add-cars-status.sql` to ensure the `cars.status` column exists before the dashboard queries it.
- Run `node scripts/run-sql.js add-cars-body-type.sql` to add the required `body_type` column (with the same options as the UI) when the schema is missing it.
- Run `node scripts/run-sql.js add-cars-closed-at.sql` to add `cars.closed_at` for 24-hour public visibility after a listing is marked closed.
- Run `node scripts/run-sql.js add-performance-indexes.sql` to add the missing indexes needed for list pages, search, and trending/promoted traffic spikes.
- Run `node scripts/run-sql.js harden-security.sql` to apply critical security hardening:
  - lock profile grants/policies to block self-promotion
  - enforce public cars visibility in SQL (no draft leak)
  - enforce storage policies for `car_images` uploads

## Security rollout

For existing projects, run these in order:

```powershell
node scripts/run-sql.js fix-profiles-rls.sql
node scripts/run-sql.js harden-security.sql
```

Then verify:

```powershell
node scripts/test-rls.js
```

This scaffold includes app routes for `/cars` and `/parts`, reusable components under `components/`, and Supabase client/server libs under `lib/`.
