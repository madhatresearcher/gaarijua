import { and, count, desc, eq, lt, ne, or, sql } from 'drizzle-orm'
import { db } from './db'
import { cars } from './db/schema'
import { serializeCar } from './db/serialize'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 24

export type HostListingSummary = {
  id: string
  title: string
  brand: string | null
  model: string | null
  status: string
  is_for_rent: boolean
  price_per_day: number | null
  price_buy: number | null
  body_type: string | null
  location: string | null
  created_at: string | null
  cover_image: string | null
  image_count: number
}

export type HostListingPage = {
  listings: HostListingSummary[]
  nextCursor: string | null
  total: number
}

type Cursor = { createdAt: string; id: string }

type HostListingRow = {
  id: string
  title: string
  brand: string | null
  model: string | null
  status: string
  isForRent: boolean | null
  pricePerDay: string | number | null
  priceBuy: string | number | null
  bodyType: string | null
  location: string | null
  createdAt: Date
  coverImage: string | null
  imageCount: number | string
  total: number | string
}

const hostListingFields = {
  id: cars.id,
  title: cars.title,
  brand: cars.brand,
  model: cars.model,
  status: cars.status,
  isForRent: cars.isForRent,
  pricePerDay: cars.pricePerDay,
  priceBuy: cars.priceBuy,
  bodyType: cars.bodyType,
  location: cars.location,
  createdAt: cars.createdAt,
  coverImage: sql<string | null>`${cars.images}[1]`,
  imageCount: sql<number>`coalesce(cardinality(${cars.images}), 0)`,
  total: sql<number>`count(*) over()`,
}

function decodeCursor(cursor: string | null | undefined): Cursor | null {
  if (!cursor) return null
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    if (
      typeof parsed?.createdAt !== 'string' ||
      Number.isNaN(Date.parse(parsed.createdAt)) ||
      typeof parsed?.id !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function encodeCursor(listing: HostListingSummary) {
  if (!listing.created_at) return null
  return Buffer.from(JSON.stringify({ createdAt: listing.created_at, id: listing.id }), 'utf8').toString('base64url')
}

function toSummary(listing: HostListingRow): HostListingSummary {
  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    model: listing.model,
    status: listing.status,
    is_for_rent: listing.isForRent ?? false,
    price_per_day: listing.pricePerDay === null ? null : Number(listing.pricePerDay),
    price_buy: listing.priceBuy === null ? null : Number(listing.priceBuy),
    body_type: listing.bodyType,
    location: listing.location,
    created_at: listing.createdAt.toISOString(),
    cover_image: listing.coverImage,
    image_count: Number(listing.imageCount),
  }
}

export function getPageSize(value: string | null) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return DEFAULT_PAGE_SIZE
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE)
}

export async function getHostListingPage(
  ownerId: string,
  options: { cursor?: string | null; pageSize?: number; closed?: boolean } = {}
): Promise<HostListingPage> {
  const pageSize = Math.min(Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
  const cursor = decodeCursor(options.cursor)
  const statusCondition = options.closed ? eq(cars.status, 'closed') : ne(cars.status, 'closed')
  const cursorCondition = cursor
    ? or(
        lt(cars.createdAt, new Date(cursor.createdAt)),
        and(eq(cars.createdAt, new Date(cursor.createdAt)), lt(cars.id, cursor.id))
      )
    : undefined
  const where = cursorCondition
    ? and(eq(cars.ownerId, ownerId), statusCondition, cursorCondition)
    : and(eq(cars.ownerId, ownerId), statusCondition)
  const baseWhere = and(eq(cars.ownerId, ownerId), statusCondition)
  const [rows, countRows] = await Promise.all([
    db
      .select(hostListingFields)
      .from(cars)
      .where(where)
      .orderBy(desc(cars.createdAt), desc(cars.id))
      .limit(pageSize + 1),
    cursor ? db.select({ total: count() }).from(cars).where(baseWhere) : Promise.resolve(null),
  ])

  const summaries = rows.slice(0, pageSize).map((row) => toSummary(row))
  return {
    listings: summaries,
    nextCursor: rows.length > pageSize ? encodeCursor(summaries[summaries.length - 1]) : null,
    total: cursor ? Number(countRows?.[0]?.total ?? 0) : Number(rows[0]?.total ?? 0),
  }
}

export async function getOwnedHostListing(ownerId: string, listingId: string) {
  const [row] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.ownerId, ownerId), eq(cars.id, listingId)))
    .limit(1)

  return row ? serializeCar(row) : null
}
