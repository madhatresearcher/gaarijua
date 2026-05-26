import type { Config } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // drizzle-kit reads .env itself, but surface a clear error if it is still missing.
  console.warn('DATABASE_URL is not set — drizzle-kit commands will fail until it is configured.')
}

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl ?? '',
  },
} satisfies Config
