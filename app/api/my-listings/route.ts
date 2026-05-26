import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../auth'
import { db } from '../../../lib/db'
import { cars } from '../../../lib/db/schema'
import { serializeCar } from '../../../lib/db/serialize'

export const dynamic = 'force-dynamic'

const STATUSES = new Set(['active', 'closed', 'draft'])
const BODY_TYPES = new Set(['SUV', 'estate', 'Sedan', 'coupe', 'pickup truck'])

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('-', Date.now().toString().slice(-4))
}

function numOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : String(n)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view your listings.' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(cars)
    .where(eq(cars.ownerId, session.user.id))
    .orderBy(cars.createdAt)

  const listings = rows.map(serializeCar).sort((a, b) => (a.created_at && b.created_at ? b.created_at.localeCompare(a.created_at) : 0))
  return NextResponse.json({ listings })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to create ads.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 })
  }

  const isForRent = body.type === 'rent' || body.is_for_rent === true
  const status = STATUSES.has(body.status) ? body.status : 'active'
  const bodyType = BODY_TYPES.has(body.body_type) ? body.body_type : null
  const images = Array.isArray(body.images) ? body.images.filter((x: unknown) => typeof x === 'string') : []

  try {
    const inserted = await db
      .insert(cars)
      .values({
        title: body.title.trim(),
        brand: body.brand?.trim() || null,
        model: body.model?.trim() || null,
        year: body.year ? Number(body.year) || null : null,
        description: body.description?.trim() || null,
        images,
        slug: slugify(body.title || 'listing'),
        bodyType,
        location: body.location?.trim() || 'Kampala, Uganda',
        isForRent,
        pricePerDay: isForRent ? numOrNull(body.price) : null,
        priceBuy: isForRent ? null : numOrNull(body.price),
        status,
        closedAt: status === 'closed' ? new Date() : null,
        ownerId: session.user.id,
      })
      .returning()

    return NextResponse.json({ listing: serializeCar(inserted[0]) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/my-listings failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to create listing.' }, { status: 500 })
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates to save.' }, { status: 400 })
  }

  try {
    const updated = await db
      .update(cars)
      .set(updates)
      .where(and(eq(cars.id, body.id), eq(cars.ownerId, session.user.id)))
      .returning()

    if (!updated.length) {
      return NextResponse.json({ error: 'Listing not found or not yours.' }, { status: 404 })
    }
    return NextResponse.json({ listing: serializeCar(updated[0]) })
  } catch (error) {
    console.error('PATCH /api/my-listings failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to update listing.' }, { status: 500 })
  }
}
