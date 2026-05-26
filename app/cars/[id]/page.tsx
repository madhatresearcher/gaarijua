import { notFound } from 'next/navigation'
import {
  getCarBySlugOrId,
  getOwnerProfile,
  getSimilarRentals,
  getRecommendedSales,
} from '../../../lib/db/queries'
import { isListingPubliclyVisible } from '../../../lib/listing-visibility'
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
  owner_id?: string
  host_name?: string
  host_vendor_type?: 'rental_company' | 'seller' | null
  host_is_veteran?: boolean
  status?: string
  closed_at?: string
  created_at?: string
}

type OwnerProfile = {
  display_name?: string
  vendor_type?: 'rental_company' | 'seller' | null
  created_at?: string
}

export const revalidate = 60

export default async function CarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let car: CarRecord | null = (await getCarBySlugOrId(id)) as CarRecord | null

  if (!car || !isListingPubliclyVisible(car)) {
    return notFound()
  }

  const pricePerDay = Number(car.price_per_day ?? car.pricePerDay ?? 0)
  const isRental = Boolean(car.is_for_rent || pricePerDay)
  const ownerProfilePromise: Promise<OwnerProfile | null> = car.owner_id
    ? getOwnerProfile(car.owner_id)
    : Promise.resolve(null)
  const relatedPromise: Promise<CarRecord[]> = isRental ? fetchSimilarRentals(car, pricePerDay) : fetchRecommendedSales(car)
  const [ownerProfile, relatedListings]: [OwnerProfile | null, CarRecord[]] = await Promise.all([
    ownerProfilePromise,
    relatedPromise,
  ])

  if (ownerProfile) {
    const accountCreatedAt = ownerProfile.created_at ? new Date(ownerProfile.created_at) : null
    const accountAgeMs = accountCreatedAt ? Date.now() - accountCreatedAt.getTime() : 0
    const threeYearsMs = 1000 * 60 * 60 * 24 * 365 * 3

    car = {
      ...car,
      host_name: ownerProfile.display_name || car.seller || undefined,
      host_vendor_type: (ownerProfile.vendor_type as 'rental_company' | 'seller' | undefined) || null,
      host_is_veteran: Boolean(accountCreatedAt && accountAgeMs >= threeYearsMs),
    }
  }

  const similarRentals = isRental
    ? prioritizeSimilar(
        relatedListings.filter((listing) => isListingPubliclyVisible(listing)),
        car,
        pricePerDay
      ).slice(0, 6)
    : []
  const recommendedSales = isRental
    ? []
    : prioritizeSales(
        relatedListings.filter((listing) => isListingPubliclyVisible(listing)),
        detectBodyType(car),
        getSalePrice(car)
      ).slice(0, 6)

  return <CarDetailLayout car={car} similarRentals={similarRentals} recommendedSales={recommendedSales} />
}

async function fetchSimilarRentals(car: CarRecord, pricePerDay: number) {
  const data = (await getSimilarRentals(car.id, car.slug ?? null, pricePerDay)) as CarRecord[]
  return data.filter((item) => item.is_for_rent && isListingPubliclyVisible(item))
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
  const data = (await getRecommendedSales(car.id, car.slug ?? null)) as CarRecord[]

  const unique: CarRecord[] = []
  const seen = new Set<string>()
  for (const listing of data) {
    const key = listing.id || listing.slug
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(listing)
  }

  return unique.filter((listing) => getSalePrice(listing) > 0 && isListingPubliclyVisible(listing))
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
