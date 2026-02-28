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

This scaffold includes app routes for `/cars` and `/parts`, reusable components under `components/`, and Supabase client/server libs under `lib/`.
