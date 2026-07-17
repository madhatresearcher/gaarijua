import { and, asc, desc, eq, gt, gte, ilike, inArray, lt, lte, ne, or, sql } from 'drizzle-orm'
import { db, hasDatabaseEnv } from './index'
import { cars, parts, users } from './schema'
import { serializeCar, serializePart } from './serialize'

const PUBLIC_STATUSES = ['active', 'closed'] as const


type CarCardRow = {
  id: string
  slug: string | null
  title: string
  brand: string | null
  model: string | null
  year: number | null
  isForRent: boolean | null
  seller: string | null
  promoted: boolean | null
  promotedExpires: Date | null
  viewsCount: number | null
  closedAt: Date | null
  bodyType: string | null
  pricePerDay: string | null
  priceBuy: string | null
  location: string | null
  mileage: number | null
  status: string
  ownerId: string | null
  createdAt: Date
  coverImage: string | null
}

const carCardFields = {
  id: cars.id,
  slug: cars.slug,
  title: cars.title,
  brand: cars.brand,
  model: cars.model,
  year: cars.year,
  isForRent: cars.isForRent,
  seller: cars.seller,
  promoted: cars.promoted,
  promotedExpires: cars.promotedExpires,
  viewsCount: cars.viewsCount,
  closedAt: cars.closedAt,
  bodyType: cars.bodyType,
  pricePerDay: cars.pricePerDay,
  priceBuy: cars.priceBuy,
  location: cars.location,
  mileage: cars.mileage,
  status: cars.status,
  ownerId: cars.ownerId,
  createdAt: cars.createdAt,
  coverImage: sql<string | null>`${cars.images}[1]`,
}

function serializeCarCard(row: CarCardRow) {
  return serializeCar({
    ...row,
    images: row.coverImage ? [row.coverImage] : [],
  })
}

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

type CarListingCursor = { createdAt: string; id: string }

function decodeCarListingCursor(cursor: string | null | undefined): CarListingCursor | null {
  if (!cursor) return null
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    if (typeof parsed?.createdAt !== 'string' || Number.isNaN(Date.parse(parsed.createdAt)) || typeof parsed?.id !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function encodeCarListingCursor(row: CarCardRow) {
  return Buffer.from(JSON.stringify({ createdAt: row.createdAt.toISOString(), id: row.id }), 'utf8').toString('base64url')
}

export async function getCarListingPage(
  filters: CarFilters = {},
  options: { limit?: number; cursor?: string | null } = {}
) {
  if (!hasDatabaseEnv()) return { cars: [], nextCursor: null }

  const limit = Math.min(Math.max(options.limit ?? 24, 1), 24)
  const cursor = decodeCarListingCursor(options.cursor)
  const conditions = [inArray(cars.status, PUBLIC_STATUSES as unknown as string[])]

  if (filters.mode) {
    conditions.push(eq(cars.isForRent, filters.mode === 'rent'))
  }
  if (filters.location) conditions.push(ilike(cars.location, '%' + filters.location + '%'))
  if (filters.make) conditions.push(ilike(cars.brand, '%' + filters.make + '%'))
  if (filters.model) conditions.push(ilike(cars.model, '%' + filters.model + '%'))
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
    const search = '%' + filters.search.trim() + '%'
    const term = or(ilike(cars.title, search), ilike(cars.location, search))
    if (term) conditions.push(term)
  }
  if (cursor) {
    conditions.push(
      or(
        lt(cars.createdAt, new Date(cursor.createdAt)),
        and(eq(cars.createdAt, new Date(cursor.createdAt)), lt(cars.id, cursor.id))
      )!
    )
  }

  const rows = await db
    .select(carCardFields)
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt), desc(cars.id))
    .limit(limit + 1)

  const pageRows = rows.slice(0, limit)
  return {
    cars: pageRows.map(serializeCarCard),
    nextCursor: rows.length > limit && pageRows.length ? encodeCarListingCursor(pageRows[pageRows.length - 1]) : null,
  }
}

export async function getCarsForListing(filters: CarFilters = {}, limit = 24) {
  const page = await getCarListingPage(filters, { limit })
  return page.cars
}

export async function getPromotedCars(limit = 24) {
  if (!hasDatabaseEnv()) return []
  const rows = await db
    .select(carCardFields)
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
  return rows.map(serializeCarCard)
}

export async function getTrendingCars(limit = 24) {
  if (!hasDatabaseEnv()) return []
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const rows = await db
    .select(carCardFields)
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
  return rows.map(serializeCarCard)
}

export async function getLatestCars(limit = 32) {
  if (!hasDatabaseEnv()) return []
  const rows = await db
    .select(carCardFields)
    .from(cars)
    .where(inArray(cars.status, PUBLIC_STATUSES as unknown as string[]))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCarCard)
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
    .select(carCardFields)
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCarCard)
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
    .select(carCardFields)
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
  return rows.map(serializeCarCard)
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
