import { NextRequest, NextResponse } from 'next/server'
import { getCarsForListing, type CarFilters } from '../../../lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const modeParam = sp.get('mode')
  const filters: CarFilters = {
    mode: modeParam === 'rent' || modeParam === 'buy' ? modeParam : undefined,
    location: sp.get('location') || undefined,
    make: sp.get('make') || undefined,
    model: sp.get('model') || undefined,
    year: sp.get('year') || undefined,
    minPrice: sp.get('minPrice') || undefined,
    maxPrice: sp.get('maxPrice') || undefined,
    search: sp.get('search') || undefined,
  }

  try {
    const cars = await getCarsForListing(filters, 96)
    return NextResponse.json({ cars })
  } catch (error) {
    console.error('GET /api/cars failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to load cars.', cars: [] }, { status: 500 })
  }
}
