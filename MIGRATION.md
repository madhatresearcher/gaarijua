# Gaarijua — Cloudflare + Neon migration

This app moved off **Vercel + Supabase** to **Cloudflare Workers + Neon Postgres**.

## Stack now

| Concern   | Before                 | After                                            |
| --------- | ---------------------- | ------------------------------------------------ |
| Database  | Supabase Postgres      | **Neon** (`@neondatabase/serverless` + Drizzle)  |
| Data layer| Supabase JS in browser | Drizzle on the server (`lib/db/`) + API routes   |
| Auth      | Supabase Auth (OTP)    | **Auth.js v5** magic-link via **Resend**         |
| Storage   | Supabase Storage       | **Cloudflare R2** (S3 API, `lib/r2.ts`)          |
| Hosting   | Vercel                 | **Cloudflare Workers** (`@opennextjs/cloudflare`)|

## Environment variables

Set these locally in `.env.local` and in production via `wrangler secret put <NAME>`
(or the Cloudflare dashboard):

- `DATABASE_URL` — Neon pooled connection string (already configured locally).
- `AUTH_SECRET` — random 32-byte base64 string (generated).
- `AUTH_URL` — site origin (`http://localhost:3000` in dev, the prod URL live).
- `AUTH_RESEND_KEY` — Resend API key. **Required for sign-in to work.**
- `EMAIL_FROM` — verified Resend sender, e.g. `Gaarijua <login@yourdomain.com>`.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — R2 S3 credentials.
- `R2_BUCKET` — bucket name (default `car-images`).
- `R2_PUBLIC_BASE_URL` — public base URL for the bucket (custom domain or r2.dev).

## Database

The Drizzle schema lives in `lib/db/schema.ts`. The Neon schema has already been
created (`drizzle/0000_*.sql` applied via `drizzle-kit migrate`).

- Edit schema → `npm run db:generate` → `npm run db:migrate`.
- Quick sync without migration files → `npm run db:push`.

> Auth.js now owns identity. The old `profiles` table is folded into the `users`
> table (with `display_name`, `role`, `vendor_type`, `phone`). `cars.owner_id`
> and `parts.owner_id` reference `users.id`.

## Deploy to Cloudflare

```bash
npm run cf:build      # opennextjs-cloudflare build
npm run cf:preview    # run the Worker locally
npm run cf:deploy     # deploy to Cloudflare
```

Make sure all secrets above are set in the Worker before deploying.

## Outstanding

- **Data migration**: existing rows still live in Supabase. The Neon tables are
  empty. A one-off copy of `cars` / `parts` (and users) is still to be done.
- **Resend**: create an API key and verify a sending domain, then fill
  `AUTH_RESEND_KEY` + `EMAIL_FROM`, or magic-link sign-in will fail.
- **R2**: create the bucket + S3 token and a public URL, then fill the `R2_*` vars.
