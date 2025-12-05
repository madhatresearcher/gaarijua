"use client"
import Link from 'next/link'

export default function CarCard({ car }: { car: any }) {
  const thumbnail = (car.images && car.images[0]) || car.thumbnail || '/placeholder-car.jpg'
  const pricePerDay = car.price_per_day ?? car.pricePerDay
  const priceBuy = car.price_buy ?? car.priceBuy
  const priceLabel = pricePerDay ? `$${pricePerDay}/day` : priceBuy ? `$${priceBuy}` : ''

  return (
    <Link href={`/cars/${car.id || car.slug}`} className="block bg-white rounded overflow-hidden shadow">
      <div className="h-44 bg-gray-200 overflow-hidden">
        <img src={thumbnail} alt={car.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-500">{car.location}</div>
        <div className="font-semibold">{car.title}</div>
        <div className="text-sm text-gray-700 mt-1">{priceLabel}</div>
      </div>
    </Link>
  )
}
