import type { Car, Part } from './schema'

function toNum(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

/**
 * Map a Drizzle `cars` row (camelCase, numeric-as-string) back to the snake_case
 * number-typed shape the UI components were written against for Supabase/PostgREST.
 */
export function serializeCar(c: Partial<Car> & Record<string, unknown>) {
  return {
    id: c.id,
    slug: c.slug ?? null,
    title: c.title,
    brand: c.brand ?? null,
    model: c.model ?? null,
    year: c.year ?? null,
    description: c.description ?? null,
    images: (c.images as string[] | null) ?? [],
    is_for_rent: c.isForRent ?? false,
    seller: c.seller ?? null,
    promoted: c.promoted ?? false,
    promoted_expires: toIso(c.promotedExpires as Date | null),
    views_count: c.viewsCount ?? 0,
    closed_at: toIso(c.closedAt as Date | null),
    body_type: c.bodyType ?? null,
    price_per_day: toNum(c.pricePerDay as string | null),
    price_buy: toNum(c.priceBuy as string | null),
    location: c.location ?? null,
    mileage: c.mileage ?? null,
    status: c.status ?? 'active',
    owner_id: c.ownerId ?? null,
    created_at: toIso(c.createdAt as Date | null),
  }
}

export function serializePart(p: Partial<Part> & Record<string, unknown>) {
  return {
    id: p.id,
    slug: p.slug ?? null,
    title: p.title,
    category: p.category ?? null,
    brand: p.brand ?? null,
    price: toNum(p.price as string | null),
    description: p.description ?? null,
    images: (p.images as string[] | null) ?? [],
    seller: p.seller ?? null,
    compatible_models: (p.compatibleModels as string[] | null) ?? [],
    sku: p.sku ?? null,
    owner_id: p.ownerId ?? null,
    created_at: toIso(p.createdAt as Date | null),
  }
}

export type SerializedCar = ReturnType<typeof serializeCar>
export type SerializedPart = ReturnType<typeof serializePart>
