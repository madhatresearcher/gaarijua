"use client"
import Link from 'next/link'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

export default function PartCard({ part }: { part: any }) {
  const thumbnail = (part.images && part.images[0]) || part.thumbnail || '/placeholder-part.jpg'
  const price = part.price ?? part.price_formatted
  const detected = detectCurrencyFromRecord(part)
  const currency = detected || 'UGX'
  const formatted = formatCurrency(price, currency)

  return (
    <div className="bg-white rounded overflow-hidden shadow">
      <Link href={`/parts/${part.id || part.slug}`} className="block p-3">
        <div className="h-36 bg-gray-200 rounded overflow-hidden">
          <img src={thumbnail} alt={part.title} className="w-full h-full object-cover" />
        </div>
        <div className="mt-3 font-semibold">{part.title}</div>
        <div className="text-sm text-gray-500">{part.seller}</div>
        <div className="mt-2 text-lg font-bold">{formatted}</div>
      </Link>
    </div>
  )
}
