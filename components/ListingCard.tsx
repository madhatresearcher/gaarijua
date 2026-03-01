import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'
import { isClosedListingForDisplay } from '../lib/listing-visibility'

interface ListingCardProps {
  item: {
    id?: string
    slug?: string
    title?: string
    brand?: string
    model?: string
    year?: number
    images?: string[]
    thumbnail?: string
    price_per_day?: number
    price_buy?: number
    is_for_rent?: boolean
    location?: string
    [key: string]: any
  }
}

export default function ListingCard({ item }: ListingCardProps) {
  const href = `/cars/${item.slug || item.id}`
  const image = (item.images && item.images[0]) || item.thumbnail || '/placeholder-car.jpg'

  const currency = detectCurrencyFromRecord(item) || 'UGX'
  const pricePerDay = item.price_per_day ?? item.pricePerDay
  const priceBuy = item.price_buy ?? item.priceBuy
  const isRecentlyClosed = isClosedListingForDisplay(item)

  let priceLabel = ''
  if (pricePerDay) priceLabel = `${formatCurrency(pricePerDay, currency)}/day`
  else if (priceBuy) priceLabel = formatCurrency(priceBuy, currency)

  const subtitle = [item.brand, item.model, item.year].filter(Boolean).join(' | ')

  return (
    <Link href={href} className="group block">
      <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-amber-200 ${isRecentlyClosed ? 'opacity-70 grayscale' : ''}`}>
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={item.title || 'Listing'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isRecentlyClosed && (
            <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-md shadow">
              SOLD
            </span>
          )}
          {item.is_for_rent && (
            <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-bold bg-amber-500 text-white rounded-md shadow">
              RENT
            </span>
          )}
          {!item.is_for_rent && (
            <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-bold bg-emerald-500 text-white rounded-md shadow">
              BUY
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-amber-600 transition-colors">
            {item.title || 'Untitled'}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            {priceLabel && (
              <span className="font-black text-amber-600">{priceLabel}</span>
            )}
            {item.location && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {item.location}
              </span>
            )}
          </div>
          {isRecentlyClosed && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">No longer available</p>
          )}
        </div>
      </div>
    </Link>
  )
}
