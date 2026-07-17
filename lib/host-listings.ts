import { and, count, desc, eq, lt, ne, or } from 'drizzle-orm'
import { db } from './db'
import { cars } from './db/schema'
import { serializeCar, type SerializedCar } from './db/serialize'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 24

export type HostListingSummary = Pick<
  SerializedCar,
  | 'id'
  | 'title'
  | 'brand'
  | 'model'
  | 'status'
  | 'is_for_rent'
  | 'price_per_day'
  | 'price_buy'
  | 'body_type'
  | 'location'
  | 'created_at'
  | 'description'
  | 'images'
> & {
  cover_image: string | null
  image_count: number
}

export type HostListingPage = {
  listings: HostListingSummary[]
  nextCursor: string | null
  total: number
}

type Cursor = { createdAt: string; id: string }

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

function toSummary(listing: SerializedCar): HostListingSummary {
  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    model: listing.model,
    status: listing.status,
    is_for_rent: listing.is_for_rent,
    price_per_day: listing.price_per_day,
    price_buy: listing.price_buy,
    body_type: listing.body_type,
    location: listing.location,
    created_at: listing.created_at,
    description: listing.description,
    images: listing.images,
    cover_image: listing.images[0] ?? null,
    image_count: listing.images.length,
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
      .select()
      .from(cars)
      .where(where)
      .orderBy(desc(cars.createdAt), desc(cars.id))
      .limit(pageSize + 1),
    db.select({ total: count() }).from(cars).where(baseWhere),
  ])

  const summaries = rows.slice(0, pageSize).map((row) => toSummary(serializeCar(row)))
  return {
    listings: summaries,
    nextCursor: rows.length > pageSize ? encodeCursor(summaries[summaries.length - 1]) : null,
    total: Number(countRows[0]?.total ?? 0),
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
