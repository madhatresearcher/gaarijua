import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../auth'
import { db } from '../../../lib/db'
import { cars } from '../../../lib/db/schema'
import { serializeCar } from '../../../lib/db/serialize'
import { getHostListingPage, getPageSize } from '../../../lib/host-listings'
import { getR2Bucket } from '../../../lib/r2'

export const dynamic = 'force-dynamic'

const STATUSES = new Set(['active', 'closed', 'draft'])
const BODY_TYPES = new Set(['SUV', 'estate', 'Sedan', 'coupe', 'pickup truck'])
const MAX_BATCH_SIZE = 50
const MAX_IMAGES_PER_LISTING = 8

type ListingCreateInput = Record<string, unknown>

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('-', Date.now().toString().slice(-4))
}

function slugifyBatch(value: string, index: number) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('-', Date.now().toString().slice(-4), '-', String(index + 1))
}

function numOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : String(n)
}

function getListingsFromBody(body: unknown): ListingCreateInput[] {
  if (!body || typeof body !== 'object') return []
  const record = body as Record<string, unknown>
  if (Array.isArray(record.listings)) {
    return record.listings.filter(
      (listing): listing is ListingCreateInput => Boolean(listing) && typeof listing === 'object'
    )
  }
  return [record]
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getImageUrls(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_IMAGES_PER_LISTING) return null

  const seen = new Set<string>()
  const urls: string[] = []
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) return null
    try {
      const url = new URL(item)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
      if (!seen.has(url.toString())) {
        seen.add(url.toString())
        urls.push(url.toString())
      }
    } catch {
      return null
    }
  }
  return urls
}

function getOwnedR2ImagePaths(images: string[] | null, userId: string) {
  const prefix = `cars/${userId}/`
  return (images ?? []).flatMap((image) => {
    try {
      const path = decodeURIComponent(new URL(image).pathname).replace(/^\/+/, '')
      return path.startsWith(prefix) && !path.includes('..') ? [path] : []
    } catch {
      return []
    }
  })
}

async function cleanupRemovedImages(images: string[] | null, userId: string) {
  const paths = getOwnedR2ImagePaths(images, userId)
  if (!paths.length) return
  try {
    await getR2Bucket()?.delete(paths)
  } catch (error) {
    console.error('Failed to clean up deleted listing images:', (error as Error).message)
  }
}

function getListingTitle(input: ListingCreateInput) {
  return (
    getString(input.title).trim() ||
    [getString(input.brand).trim(), getString(input.model).trim()].filter(Boolean).join(' ')
  )
}

function buildInsertValues(input: ListingCreateInput, ownerId: string, index: number, useBatchSlug: boolean) {
  const title = getListingTitle(input)
  const isForRent = input.type === 'rent' || input.is_for_rent === true
  const status = typeof input.status === 'string' && STATUSES.has(input.status) ? input.status : 'active'
  const bodyType = typeof input.body_type === 'string' && BODY_TYPES.has(input.body_type) ? input.body_type : null
  const images = Array.isArray(input.images) ? input.images.filter((x): x is string => typeof x === 'string') : []

  return {
    title,
    brand: getString(input.brand).trim() || null,
    model: getString(input.model).trim() || null,
    year: input.year ? Number(input.year) || null : null,
    description: getString(input.description).trim() || null,
    images,
    slug: useBatchSlug ? slugifyBatch(title || 'listing', index) : slugify(title || 'listing'),
    bodyType,
    location: getString(input.location).trim() || 'Kampala, Uganda',
    isForRent,
    pricePerDay: isForRent ? numOrNull(input.price) : null,
    priceBuy: isForRent ? null : numOrNull(input.price),
    status,
    closedAt: status === 'closed' ? new Date() : null,
    ownerId,
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view your listings.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = await getHostListingPage(session.user.id, {
    closed: searchParams.get('status') === 'closed',
    cursor: searchParams.get('cursor'),
    pageSize: getPageSize(searchParams.get('limit')),
  })
  return NextResponse.json(page)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to create ads.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const requestedListings = getListingsFromBody(body)

  if (requestedListings.length === 0) {
    return NextResponse.json({ error: 'Add at least one listing.' }, { status: 400 })
  }
  if (requestedListings.length > MAX_BATCH_SIZE) {
    return NextResponse.json({ error: `Create ${MAX_BATCH_SIZE} listings or fewer at a time.` }, { status: 400 })
  }

  const invalidListingIndex = requestedListings.findIndex((listing) => getListingTitle(listing).length < 2)
  if (invalidListingIndex >= 0) {
    return NextResponse.json(
      { error: `Listing ${invalidListingIndex + 1}: brand and model are required.` },
      { status: 400 }
    )
  }

  const values = requestedListings.map((listing, index) =>
    buildInsertValues(listing, session.user.id, index, requestedListings.length > 1)
  )

  try {
    const inserted = await db
      .insert(cars)
      .values(values)
      .returning()

    const serialized = inserted.map(serializeCar)
    return NextResponse.json(
      {
        listing: serialized[0] ?? null,
        listings: serialized,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/my-listings failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to create listings.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to update ads.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'A listing id is required.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  let requestedImages: string[] | undefined
  if (body.description !== undefined) {
    updates.description = body.description ? String(body.description).trim() : null
  }
  if (body.status !== undefined && STATUSES.has(body.status)) {
    updates.status = body.status
    updates.closedAt = body.status === 'closed' ? new Date() : null
  }
  if (body.price !== undefined) {
    if (body.is_for_rent) {
      updates.pricePerDay = numOrNull(body.price)
    } else {
      updates.priceBuy = numOrNull(body.price)
    }
  }
  if (body.images !== undefined) {
    const images = getImageUrls(body.images)
    if (!images) {
      return NextResponse.json(
        { error: `Provide up to ${MAX_IMAGES_PER_LISTING} valid image URLs.` },
        { status: 400 }
      )
    }
    requestedImages = images
    updates.images = images
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates to save.' }, { status: 400 })
  }

  try {
    const existing = await db
      .select({ images: cars.images })
      .from(cars)
      .where(and(eq(cars.id, body.id), eq(cars.ownerId, session.user.id)))
      .limit(1)

    if (!existing.length) {
      return NextResponse.json({ error: 'Listing not found or not yours.' }, { status: 404 })
    }

    const updated = await db
      .update(cars)
      .set(updates)
      .where(and(eq(cars.id, body.id), eq(cars.ownerId, session.user.id)))
      .returning()

    if (!updated.length) {
      return NextResponse.json({ error: 'Listing not found or not yours.' }, { status: 404 })
    }
    if (requestedImages) {
      await cleanupRemovedImages(
        (existing[0].images ?? []).filter((image) => !requestedImages.includes(image)),
        session.user.id
      )
    }
    return NextResponse.json({ listing: serializeCar(updated[0]) })
  } catch (error) {
    console.error('PATCH /api/my-listings failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to update listing.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to delete ads.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'A listing id is required.' }, { status: 400 })
  }

  try {
    const deleted = await db
      .delete(cars)
      .where(and(eq(cars.id, body.id), eq(cars.ownerId, session.user.id)))
      .returning({ images: cars.images })

    if (!deleted.length) {
      return NextResponse.json({ error: 'Listing not found or not yours.' }, { status: 404 })
    }

    await cleanupRemovedImages(deleted[0].images, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/my-listings failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to delete listing.' }, { status: 500 })
  }
}
