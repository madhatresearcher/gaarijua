"use client"
import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

export default function CarCard({ car }: { car: any }) {
  const thumbnail = (car.images && car.images[0]) || car.thumbnail || '/placeholder-car.jpg'
  const pricePerDay = car.price_per_day ?? car.pricePerDay
  const priceBuy = car.price_buy ?? car.priceBuy
  const rating = car.rating ?? 4.8

  const detectedCurrency = detectCurrencyFromRecord(car)
  const currency = detectedCurrency || 'UGX'
  const pricePerDayLabel = pricePerDay ? `${formatCurrency(pricePerDay, currency)}/day` : ''
  const priceBuyLabel = priceBuy ? formatCurrency(priceBuy, currency) : ''
  const priceLabel = pricePerDay ? pricePerDayLabel : priceBuy ? priceBuyLabel : ''

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative mb-4 overflow-hidden rounded-xl bg-slate-100">
        <img src={thumbnail} alt={car.title} className="h-44 w-full object-cover" />
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
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/cars/${car.id || car.slug}`}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Details
        </Link>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Quick View
        </button>
        <button
          type="button"
          className="ml-auto rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Compare
        </button>
      </div>
    </div>
  )
}
