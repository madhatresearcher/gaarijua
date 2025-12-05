import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

interface HeroCardProps {
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
    price?: number
    views_count?: number
    sales_count?: number
    is_for_rent?: boolean
    [key: string]: any
  }
  tag?: string
  tagColor?: 'amber' | 'green' | 'blue' | 'rose'
  type?: 'car' | 'part'
}

export default function HeroCard({ item, tag, tagColor = 'amber', type = 'car' }: HeroCardProps) {
  const href = type === 'car'
    ? `/cars/${item.slug || item.id}`
    : `/parts/${item.slug || item.id}`

  const image = (item.images && item.images[0]) || item.thumbnail || (type === 'car' ? '/placeholder-car.jpg' : '/placeholder-part.jpg')

  const currency = detectCurrencyFromRecord(item) || 'UGX'
  const pricePerDay = item.price_per_day ?? item.pricePerDay
  const priceBuy = item.price_buy ?? item.priceBuy ?? item.price

  let priceLabel = ''
  if (type === 'car') {
    if (pricePerDay) priceLabel = `${formatCurrency(pricePerDay, currency)}/day`
    else if (priceBuy) priceLabel = formatCurrency(priceBuy, currency)
  } else {
    if (item.price) priceLabel = formatCurrency(item.price, currency)
  }

  const subtitle = type === 'car'
    ? [item.brand, item.model, item.year].filter(Boolean).join(' • ')
    : item.category || item.brand || ''

  const tagStyles: Record<string, string> = {
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
    green: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30',
  }

  return (
    <Link
      href={href}
      className="flex-shrink-0 w-80 snap-start group"
    >
      {/* Card container with accent border */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border-b-4 border-amber-500">
        {/* Image */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={item.title || 'Listing'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Tag */}
          {tag && (
            <span className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-bold rounded-lg ${tagStyles[tagColor]}`}>
              {tag}
            </span>
          )}
          {/* Price badge on image */}
          {priceLabel && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur rounded-lg shadow-lg">
              <span className="font-black text-gray-900">{priceLabel}</span>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-amber-600 transition-colors">
            {item.title || 'Untitled'}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 truncate flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
