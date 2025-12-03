import Link from 'next/link'

export default function CarDetail({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
          <h2 className="text-2xl font-semibold mt-4">Sample Car {id}</h2>
          <p className="text-sm text-gray-600">Nairobi, KE • 2021 • 50,000 km</p>
          <p className="mt-4">Detailed description placeholder for the vehicle. Add specs, features, and more.</p>
        </div>
        <aside className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Rent</div>
          <div className="text-3xl font-bold">$65<span className="text-base font-normal">/day</span></div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Request to Rent</button>

          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-500">Buy</div>
            <div className="text-2xl font-bold">$18,500</div>
            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded">Contact Seller</button>
          </div>
        </aside>
      </div>
      <div className="mt-6">
        <Link href="/cars" className="text-blue-600">← Back to cars</Link>
      </div>
    </div>
  )
}
