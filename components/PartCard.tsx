"use client"
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

export default function PartCard({ part }: { part: any }) {
  const thumbnail = (part.images && part.images[0]) || part.thumbnail || '/placeholder-part.jpg'
  const price = part.price ?? part.price_formatted
  const detected = detectCurrencyFromRecord(part)
  const currency = detected || 'UGX'
  const formatted = formatCurrency(price, currency)
  const [compareActive, setCompareActive] = useState(false)

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/parts/${part.id || part.slug}`} className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl bg-slate-100">
          <img src={thumbnail} alt={part.title} className="h-40 w-full object-cover" />
          <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
            {part.category ?? 'Part'}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{part.title}</h3>
          <p className="text-sm text-slate-500">{part.seller}</p>
          <p className="text-xl font-bold text-slate-900">{formatted}</p>
        </div>
      </Link>

      <div className="mt-4 flex items-end justify-between gap-3">
        <Link
          href={`/parts/${part.id || part.slug}`}
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
