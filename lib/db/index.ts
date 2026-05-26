import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || ''

export function hasDatabaseEnv() {
  return Boolean(connectionString)
}

// Lazily created so importing this module never throws when DATABASE_URL is unset
// (e.g. during static analysis or when a deployment hasn't been configured yet).
let cached: ReturnType<typeof createDb> | null = null

function createDb() {
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL. Set your Neon connection string in the environment.')
  }
  const sql = neon(connectionString)
  return drizzle(sql, { schema })
}

export function getDb() {
  if (!cached) {
    cached = createDb()
  }
  return cached
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
})

export { schema }
