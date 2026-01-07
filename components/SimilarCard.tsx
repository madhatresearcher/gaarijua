"use client"

import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

type CarRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  model?: string
  price_per_day?: number
  pricePerDay?: number
  rating?: number
  images?: string[]
  location?: string
  price_buy?: number
  priceBuy?: number
}

type SimilarCardProps = {
  listing: CarRecord
  onCompare: (listing: CarRecord) => void
}

export default function SimilarCard({ listing, onCompare }: SimilarCardProps) {
  const pricePerDay = listing.price_per_day ?? listing.pricePerDay
  const salePrice = listing.price_buy ?? listing.priceBuy
  const currency = detectCurrencyFromRecord(listing) || 'UGX'
  const priceLabel = pricePerDay
    ? `${formatCurrency(pricePerDay, currency)}/day`
    : salePrice
    ? formatCurrency(salePrice, currency)
    : 'Price on request'
  const thumbnail = listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder-car.jpg'
  const rating = listing.rating ?? 4.6

  return (
    <div className="min-w-[260px] max-w-[260px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100">
        <img src={thumbnail} alt={listing.title} className="h-full w-full object-cover" />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
          <svg className="h-3 w-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1.5l2.472 5.008 5.528.805-3.99 3.89.943 5.493L10 15.85l-4.953 2.846.943-5.493-3.99-3.89 5.528-.805L10 1.5z" />
          </svg>
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="truncate text-base font-semibold text-slate-900">
          {listing.title || `${listing.brand || 'Rental'} ${listing.model || ''}`.trim()}
        </h3>
        <p className="text-sm text-slate-500">{listing.location || 'Kampala, UG'}</p>
        <p className="text-lg font-bold text-slate-900">{priceLabel}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/cars/${listing.id || listing.slug}`}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400"
        >
          Details
        </Link>
        <button
          type="button"
          onClick={() => onCompare(listing)}
          className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
        >
          Compare
        </button>
      </div>
    </div>
  )
}