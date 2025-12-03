"use client"
import Link from 'next/link'

export default function PartCard({ part }: { part: any }) {
  return (
    <div className="bg-white rounded overflow-hidden shadow">
      <Link href={`/parts/${part.id}`} className="block p-3">
        <div className="h-36 bg-gray-200 rounded" />
        <div className="mt-3 font-semibold">{part.title}</div>
        <div className="text-sm text-gray-500">{part.seller}</div>
        <div className="mt-2 text-lg font-bold">${part.price}</div>
      </Link>
    </div>
  )
}
