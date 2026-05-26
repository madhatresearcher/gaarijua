import { and, asc, desc, eq, gt, gte, ilike, inArray, lte, ne, or, sql } from 'drizzle-orm'
import { db, hasDatabaseEnv } from './index'
import { cars, parts, users } from './schema'
import { serializeCar, serializePart } from './serialize'

const PUBLIC_STATUSES = ['active', 'closed'] as const

/* --------------------------------- Cars ---------------------------------- */

export type CarFilters = {
  mode?: 'rent' | 'buy'
  location?: string
  make?: string
  model?: string
  year?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

export async function getCarsForListing(filters: CarFilters = {}, limit = 96) {
  if (!hasDatabaseEnv()) return []

  const conditions = [inArray(cars.status, PUBLIC_STATUSES as unknown as string[])]

  if (filters.mode) {
    conditions.push(eq(cars.isForRent, filters.mode === 'rent'))
  }
  if (filters.location) conditions.push(ilike(cars.location, `%${filters.location}%`))
  if (filters.make) conditions.push(ilike(cars.brand, `%${filters.make}%`))
  if (filters.model) conditions.push(ilike(cars.model, `%${filters.model}%`))
  if (filters.year && !Number.isNaN(Number(filters.year))) {
    conditions.push(eq(cars.year, Number(filters.year)))
  }
  if (filters.minPrice && !Number.isNaN(Number(filters.minPrice))) {
    conditions.push(gte(cars.pricePerDay, String(Number(filters.minPrice))))
  }
  if (filters.maxPrice && !Number.isNaN(Number(filters.maxPrice))) {
    conditions.push(lte(cars.pricePerDay, String(Number(filters.maxPrice))))
  }
  if (filters.search && filters.search.trim()) {
    const s = `%${filters.search.trim()}%`
    const term = or(ilike(cars.title, s), ilike(cars.location, s))
    if (term) conditions.push(term)
  }

  const rows = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(limit)

  return rows.map(serializeCar)
}

export async function getPromotedCars(limit = 24) {
  if (!hasDatabaseEnv()) return []
  const rows = await db
    .select()
    .from(cars)
    .where(
      and(
        inArray(cars.status, PUBLIC_STATUSES as unknown as string[]),
        eq(cars.promoted, true),
        gte(cars.promotedExpires, new Date())
      )
    )
    .orderBy(asc(cars.promotedExpires))
    .limit(limit)
  return rows.map(serializeCar)
}

export async function getTrendingCars(limit = 24) {
  if (!hasDatabaseEnv()) return []
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const rows = await db
    .select()
    .from(cars)
    .where(
      and(
        inArray(cars.status, PUBLIC_STATUSES as unknown as string[]),
        gt(cars.viewsCount, 0),
        gte(cars.createdAt, threeDaysAgo)
      )
    )
    .orderBy(desc(cars.viewsCount))
    .limit(limit)
  return rows.map(serializeCar)
}

export async function getLatestCars(limit = 32) {
  if (!hasDatabaseEnv()) return []
  const rows = await db
    .select()
    .from(cars)
    .where(inArray(cars.status, PUBLIC_STATUSES as unknown as string[]))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCar)
}

export async function getCarBySlugOrId(idOrSlug: string) {
  if (!hasDatabaseEnv()) return null
  const bySlug = await db.select().from(cars).where(eq(cars.slug, idOrSlug)).limit(1)
  if (bySlug[0]) return serializeCar(bySlug[0])

  // Only attempt id lookup when the value looks like a uuid to avoid cast errors.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    const byId = await db.select().from(cars).where(eq(cars.id, idOrSlug)).limit(1)
    if (byId[0]) return serializeCar(byId[0])
  }
  return null
}

export async function getOwnerProfile(ownerId: string) {
  if (!hasDatabaseEnv()) return null
  const rows = await db
    .select({
      display_name: users.displayName,
      vendor_type: users.vendorType,
      created_at: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, ownerId))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    display_name: row.display_name ?? undefined,
    vendor_type: (row.vendor_type as 'rental_company' | 'seller' | null) ?? null,
    created_at: row.created_at ? row.created_at.toISOString() : undefined,
  }
}

export async function getSimilarRentals(carId: string | undefined, slug: string | null, pricePerDay: number, limit = 24) {
  if (!hasDatabaseEnv()) return []
  const conditions = [
    eq(cars.isForRent, true),
    inArray(cars.status, PUBLIC_STATUSES as unknown as string[]),
  ]
  if (carId) conditions.push(ne(cars.id, carId))
  if (slug) conditions.push(ne(cars.slug, slug))
  if (pricePerDay) {
    conditions.push(gte(cars.pricePerDay, String(Math.max(0, pricePerDay * 0.6))))
    conditions.push(lte(cars.pricePerDay, String(pricePerDay * 1.4)))
  }
  const rows = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCar)
}

export async function getRecommendedSales(carId: string | undefined, slug: string | null, limit = 24) {
  if (!hasDatabaseEnv()) return []
  const conditions = [
    eq(cars.isForRent, false),
    inArray(cars.status, PUBLIC_STATUSES as unknown as string[]),
  ]
  if (carId) conditions.push(ne(cars.id, carId))
  if (slug) conditions.push(ne(cars.slug, slug))
  const rows = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCar)
}

export async function getCarsByOwner(ownerId: string) {
  if (!hasDatabaseEnv()) return []
  const rows = await db
    .select()
    .from(cars)
    .where(eq(cars.ownerId, ownerId))
    .orderBy(desc(cars.createdAt))
  return rows.map(serializeCar)
}

/* --------------------------------- Parts --------------------------------- */

export type PartFilters = {
  make?: string
  model?: string
  seller?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

export async function getPartsForListing(filters: PartFilters = {}, limit = 48) {
  if (!hasDatabaseEnv()) return []
  const conditions = []
  if (filters.make) conditions.push(ilike(parts.brand, `%${filters.make}%`))
  if (filters.model) conditions.push(sql`${parts.compatibleModels} @> ARRAY[${filters.model}]::text[]`)
  if (filters.seller) conditions.push(ilike(parts.seller, `%${filters.seller}%`))
  if (filters.minPrice && !Number.isNaN(Number(filters.minPrice))) {
    conditions.push(gte(parts.price, String(Number(filters.minPrice))))
  }
  if (filters.maxPrice && !Number.isNaN(Number(filters.maxPrice))) {
    conditions.push(lte(parts.price, String(Number(filters.maxPrice))))
  }
  if (filters.search && filters.search.trim()) {
    const s = `%${filters.search.trim()}%`
    const term = or(ilike(parts.title, s), ilike(parts.category, s))
    if (term) conditions.push(term)
  }

  const rows = await db
    .select()
    .from(parts)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(parts.createdAt))
    .limit(limit)
  return rows.map(serializePart)
}

export async function getPartBySlugOrId(idOrSlug: string) {
  if (!hasDatabaseEnv()) return null
  const bySlug = await db.select().from(parts).where(eq(parts.slug, idOrSlug)).limit(1)
  if (bySlug[0]) return serializePart(bySlug[0])

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    const byId = await db.select().from(parts).where(eq(parts.id, idOrSlug)).limit(1)
    if (byId[0]) return serializePart(byId[0])
  }
  return null
}
