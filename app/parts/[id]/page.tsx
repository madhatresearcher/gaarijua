import Link from 'next/link'

export default function PartDetail({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <div className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="h-96 bg-gray-200 rounded" />
          <h2 className="text-2xl font-semibold mt-4">Part {id}</h2>
          <p className="text-sm text-gray-600">Sold by Gaarijua Parts</p>
          <p className="mt-4">Product description placeholder. Add specs, compatibility, and details here.</p>
        </div>
        <aside className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-3xl font-bold">$129.99</div>
          <div className="text-sm text-green-600 mt-2">In stock</div>
          <button className="mt-4 w-full bg-yellow-500 text-black py-2 rounded">Add to Cart</button>
        </aside>
      </div>
      <div className="mt-6">
        <Link href="/parts" className="text-blue-600">← Back to parts</Link>
      </div>
    </div>
  )
}
