"use client"
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'
import { isClosedListingForDisplay } from '../lib/listing-visibility'

export default function CarCard({ car }: { car: any }) {
  const thumbnail = (car.images && car.images[0]) || car.thumbnail || '/placeholder-car.jpg'
  const pricePerDay = car.price_per_day ?? car.pricePerDay
  const priceBuy = car.price_buy ?? car.priceBuy
  const rating = car.rating ?? 4.8
  const [compareActive, setCompareActive] = useState(false)

  const detectedCurrency = detectCurrencyFromRecord(car)
  const currency = detectedCurrency || 'UGX'
  const pricePerDayLabel = pricePerDay ? `${formatCurrency(pricePerDay, currency)}/day` : ''
  const priceBuyLabel = priceBuy ? formatCurrency(priceBuy, currency) : ''
  const priceLabel = pricePerDay ? pricePerDayLabel : priceBuy ? priceBuyLabel : ''
  const isRecentlyClosed = isClosedListingForDisplay(car)

  return (
    <div className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${isRecentlyClosed ? 'opacity-70 grayscale' : ''}`}>
      <div className="relative mb-4 overflow-hidden rounded-xl bg-slate-100">
        <img src={thumbnail} alt={car.title} className="h-56 w-full object-cover" />
        {isRecentlyClosed && (
          <span className="absolute top-3 right-3 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            Closed
          </span>
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
          <svg className="h-3 w-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1.5l2.472 5.008 5.528.805-3.99 3.89.943 5.493L10 15.85l-4.953 2.846.943-5.493-3.99-3.89 5.528-.805L10 1.5z" />
          </svg>
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">
          {car.title || `${car.make || 'Car'} ${car.model || ''}`.trim()}
        </h3>
        <p className="text-sm text-slate-500">{car.location}</p>
        {priceLabel && <p className="text-lg font-bold text-slate-900">{priceLabel}</p>}
        {isRecentlyClosed && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">No longer available</p>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <Link
          href={`/cars/${car.id || car.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-[12px] bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-slate-800"
        >
          Details
        </Link>
        <button
          type="button"
          onClick={() => setCompareActive((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] transition ${
            compareActive
              ? 'border-transparent bg-slate-900/10 text-slate-900 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full border transition ${
              compareActive ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
            }`}
          ></span>
          Compare
        </button>
      </div>
    </div>
  )
}
