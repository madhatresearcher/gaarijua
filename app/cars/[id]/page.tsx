import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabase-server'

export default async function CarDetail({ params }: { params: { id: string } }) {
  const { id } = params

  // Try to find by slug first, then by id
  const { data: bySlug } = await supabaseServer.from('cars').select('*').eq('slug', id).maybeSingle()
  let car = bySlug
  if (!car) {
    const { data: byId } = await supabaseServer.from('cars').select('*').eq('id', id).maybeSingle()
    car = byId
  }

  if (!car) return notFound()

  const images: string[] = car.images || []
  const thumbnail = images[0] || '/placeholder-car.jpg'
  const pricePerDay = car.price_per_day ?? car.pricePerDay
  const priceBuy = car.price_buy ?? car.priceBuy

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            {images.slice(0,4).map((src, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded overflow-hidden">
                <img src={src} alt={`${car.title} ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length === 0 && (
              <div className="h-64 bg-gray-200 rounded" />
            )}
          </div>
          <h2 className="text-2xl font-semibold mt-4">{car.title}</h2>
          <p className="text-sm text-gray-600">{car.location} {car.year ? `• ${car.year}` : ''}</p>
          <p className="mt-4">{car.description}</p>
        </div>
        <aside className="border rounded p-4 bg-white">
          {pricePerDay && (
            <>
              <div className="text-sm text-gray-500">Rent</div>
              <div className="text-3xl font-bold">${pricePerDay}<span className="text-base font-normal">/day</span></div>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Request to Rent</button>
            </>
          )}

          {priceBuy && (
            <div className="mt-6 border-t pt-4">
              <div className="text-sm text-gray-500">Buy</div>
              <div className="text-2xl font-bold">${priceBuy}</div>
              <button className="mt-4 w-full bg-green-600 text-white py-2 rounded">Contact Seller</button>
            </div>
          )}
        </aside>
      </div>
      <div className="mt-6">
        <Link href="/cars" className="text-blue-600">← Back to cars</Link>
      </div>
    </div>
  )
}
