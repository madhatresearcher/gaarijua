import Link from 'next/link'

type Props = {
  item: any
  kind: 'car' | 'part'
  promoted?: boolean
  views?: number
  sales?: number
}

export default function HeroCard({ item, kind, promoted, views, sales }: Props) {
  const title = item.title || item.name || ''
  const slugOrId = item.slug || item.id
  const href = kind === 'part' ? `/parts/${slugOrId}` : `/cars/${slugOrId}`
  const img = (item.images && item.images[0]) || item.thumbnail || '/placeholder-car.jpg'
  const pricePerDay = item.price_per_day ?? item.pricePerDay
  const priceBuy = item.price_buy ?? item.price

  return (
    <Link href={href} className="block min-w-[220px] max-w-xs bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{kind === 'car' ? `${item.brand ?? ''} ${item.model ?? ''} ${item.year ?? ''}` : `${item.brand ?? item.category ?? ''}`}</div>
          {promoted && <div className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Promoted</div>}
        </div>
        <div className="mt-1 font-semibold text-slate-900 truncate">{title}</div>
        <div className="mt-2 text-sm text-slate-700">{pricePerDay ? `$${pricePerDay}/day` : priceBuy ? `$${priceBuy}` : ''}</div>
        <div className="mt-2 text-xs text-slate-500">
          {views ? `${views} views` : sales ? `${sales} sold` : null}
        </div>
      </div>
    </Link>
  )
}
