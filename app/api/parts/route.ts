import { NextRequest, NextResponse } from 'next/server'
import { getPartsForListing, type PartFilters } from '../../../lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const filters: PartFilters = {
    make: sp.get('make') || undefined,
    model: sp.get('model') || undefined,
    seller: sp.get('seller') || undefined,
    minPrice: sp.get('minPrice') || undefined,
    maxPrice: sp.get('maxPrice') || undefined,
    search: sp.get('search') || undefined,
  }

  try {
    const parts = await getPartsForListing(filters, 48)
    return NextResponse.json({ parts })
  } catch (error) {
    console.error('GET /api/parts failed:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to load parts.', parts: [] }, { status: 500 })
  }
}
