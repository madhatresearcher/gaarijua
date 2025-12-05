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
    <Link href={href} className="snap-start block min-w-[260px] max-w-sm bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover" />
        <div className="absolute left-3 bottom-3 bg-white/95 px-3 py-1 rounded-full text-sm font-semibold shadow">{pricePerDay ? `$${pricePerDay}/day` : priceBuy ? `$${priceBuy}` : ''}</div>
        {promoted && <div className="absolute right-3 top-3 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">Promoted</div>}
      </div>
      <div className="p-3">
        <div className="text-sm text-slate-500 truncate">{kind === 'car' ? `${item.brand ?? ''} ${item.model ?? ''}` : `${item.brand ?? item.category ?? ''}`}</div>
        <div className="mt-1 font-semibold text-slate-900 text-base leading-tight truncate">{title}</div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <div>{views ? `${views} views` : sales ? `${sales} sold` : ''}</div>
          <div className="text-slate-400">{item.year ?? ''}</div>
        </div>
      </div>
    </Link>
  )
}
