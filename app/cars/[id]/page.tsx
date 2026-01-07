import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabase-server'
import CarDetailLayout from '../../../components/CarDetailLayout'

type CarRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  model?: string
  year?: number
  description?: string
  images?: string[]
  location?: string
  is_for_rent?: boolean
  price_per_day?: number
  pricePerDay?: number
  price_buy?: number
  seller?: string
  body_type?: string
  priceBuy?: number
}

export default async function CarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: bySlug } = await supabaseServer
    .from('cars')
    .select('*')
    .eq('slug', id)
    .maybeSingle()
  let car: CarRecord | null = bySlug
  if (!car) {
    const { data: byId } = await supabaseServer
      .from('cars')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    car = byId
  }

  if (!car) {
    return notFound()
  }

  const pricePerDay = Number(car.price_per_day ?? car.pricePerDay ?? 0)
  const isRental = Boolean(car.is_for_rent || pricePerDay)

  let similarRentals: CarRecord[] = []
  if (isRental) {
    const range20 = await fetchSimilarRentals(car, pricePerDay, 0.2)
    similarRentals = range20

    if (similarRentals.length < 4) {
      const range40 = await fetchSimilarRentals(car, pricePerDay, 0.4)
      const deduped: CarRecord[] = []
      const seen = new Set<string>()
      for (const listing of [...similarRentals, ...range40]) {
        const key = listing.id || listing.slug || ''
        if (!key || seen.has(key)) continue
        if (key === car.id || key === car.slug) continue
        seen.add(key)
        deduped.push(listing)
      }
      similarRentals = deduped
    }

    similarRentals = prioritizeSimilar(similarRentals, car, pricePerDay)
    similarRentals = similarRentals.slice(0, 6)
  }

  const recommendedSales = isRental ? [] : await fetchRecommendedSales(car)

  return <CarDetailLayout car={car} similarRentals={similarRentals} recommendedSales={recommendedSales} />
}

async function fetchSimilarRentals(car: CarRecord, pricePerDay: number, rangeFactor: number) {
  const minPrice = pricePerDay ? Math.max(0, pricePerDay * (1 - rangeFactor)) : 0
  const maxPrice = pricePerDay ? pricePerDay * (1 + rangeFactor) : undefined

  let query = supabaseServer
    .from('cars')
    .select('*')
    .eq('is_for_rent', true)
    .neq('id', car.id)
    .neq('slug', car.slug)
    .order('created_at', { ascending: false })
    .limit(12)

  if (pricePerDay) {
    query = query.gte('price_per_day', minPrice)
    if (maxPrice !== undefined) {
      query = query.lte('price_per_day', maxPrice)
    }
  }

  const { data } = await query
  if (!data) return []
  return data.filter((item) => item.is_for_rent)
}

function prioritizeSimilar(listings: CarRecord[], current: CarRecord, currentPrice: number) {
  const currentSeller = (current.seller || '').toLowerCase()
  const currentLocation = parseLocation(current.location)

  return listings
    .filter((listing) => {
      if (!listing) return false
      if (listing.id === current.id || listing.slug === current.slug) return false
      if (!listing.is_for_rent && listing.price_per_day === undefined) return false
      return true
    })
    .sort((a, b) => {
      const sellerA = (a.seller || '').toLowerCase()
      const sellerB = (b.seller || '').toLowerCase()
      const otherVendorA = sellerA && sellerA !== currentSeller
      const otherVendorB = sellerB && sellerB !== currentSeller
      if (otherVendorA !== otherVendorB) return otherVendorA ? -1 : 1

      const locA = parseLocation(a.location)
      const locB = parseLocation(b.location)
      if (locA.city === currentLocation.city && locB.city !== currentLocation.city) return -1
      if (locB.city === currentLocation.city && locA.city !== currentLocation.city) return 1
      if (locA.region === currentLocation.region && locB.region !== currentLocation.region) return -1
      if (locB.region === currentLocation.region && locA.region !== currentLocation.region) return 1

      const diffA = Math.abs((a.price_per_day ?? a.pricePerDay ?? 0) - currentPrice)
      const diffB = Math.abs((b.price_per_day ?? b.pricePerDay ?? 0) - currentPrice)
      return diffA - diffB
    })
}

async function fetchRecommendedSales(car: CarRecord) {
  const currentPrice = getSalePrice(car)
  const bodyType = detectBodyType(car)

  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .eq('is_for_rent', false)
    .neq('id', car.id)
    .neq('slug', car.slug)
    .order('created_at', { ascending: false })
    .limit(24)

  if (!data) return []

  const unique: CarRecord[] = []
  const seen = new Set<string>()
  for (const listing of data) {
    const key = listing.id || listing.slug
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(listing)
  }

  const priced = unique.filter((listing) => getSalePrice(listing) > 0)
  return prioritizeSales(priced, bodyType, currentPrice).slice(0, 6)
}

function prioritizeSales(listings: CarRecord[], targetBody: string, targetPrice: number) {
  return listings.sort((a, b) => {
    const bodyA = detectBodyType(a)
    const bodyB = detectBodyType(b)
    const sameBodyA = targetBody && bodyA === targetBody
    const sameBodyB = targetBody && bodyB === targetBody
    if (sameBodyA !== sameBodyB) return sameBodyA ? -1 : 1

    const diffA = Math.abs(getSalePrice(a) - targetPrice)
    const diffB = Math.abs(getSalePrice(b) - targetPrice)
    if (diffA !== diffB) return diffA - diffB

    return 0
  })
}

function getSalePrice(listing: CarRecord) {
  return Number(listing.price_buy ?? listing.priceBuy ?? 0)
}

const BODY_TYPE_HINTS: Array<{ type: string; patterns: RegExp[] }> = [
  {
    type: 'suv',
    patterns: [
      /suv/i,
      /sport utility/i,
      /land cruiser/i,
      /defender/i,
      /prado/i,
      /patrol/i,
      /gle/i,
      /glc/i,
      /palisade/i,
      /^rx/i,
    ],
  },
  {
    type: 'pickup',
    patterns: [/pickup/i, /truck/i, /ranger/i, /hilux/i, /wildtrak/i],
  },
  {
    type: 'sedan',
    patterns: [/sedan/i, /limousine/i, /coupe/i, /luxury/i, /e-class/i, /c-class/i],
  },
]

function detectBodyType(listing: CarRecord) {
  const candidate = ((listing.body_type || listing.model || listing.title || '') as string).toLowerCase()
  for (const hint of BODY_TYPE_HINTS) {
    if (hint.patterns.some((pattern) => pattern.test(candidate))) {
      return hint.type
    }
  }
  return 'other'
}


function parseLocation(location?: string) {
  const parts = (location || '')
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
  return {
    city: parts[0] || '',
    region: parts[1] || '',
    country: parts[2] || parts[1] || parts[0] || '',
  }
}
