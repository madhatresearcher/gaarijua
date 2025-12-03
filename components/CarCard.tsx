"use client"
import Link from 'next/link'

export default function CarCard({ car }: { car: any }) {
  return (
    <Link href={`/cars/${car.id}`} className="block bg-white rounded overflow-hidden shadow">
      <div className="h-44 bg-gray-200" />
      <div className="p-3">
        <div className="text-sm text-gray-500">{car.location}</div>
        <div className="font-semibold">{car.title}</div>
        <div className="text-sm text-gray-700 mt-1">${car.pricePerDay}/day</div>
      </div>
    </Link>
  )
}
