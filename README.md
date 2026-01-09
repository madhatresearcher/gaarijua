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

- Run `node scripts/run-sql.js add-cars-status.sql` to make sure the `cars.status` column exists when the Supabase schema is missing it; this resolves `column cars.status does not exist` errors.

This scaffold includes app routes for `/cars` and `/parts`, reusable components under `components/`, and Supabase client/server libs under `lib/`.
