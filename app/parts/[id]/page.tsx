import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabase-server'

export default async function PartDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: bySlug } = await supabaseServer.from('parts').select('*').eq('slug', id).maybeSingle()
  let part = bySlug
  if (!part) {
    const { data: byId } = await supabaseServer.from('parts').select('*').eq('id', id).maybeSingle()
    part = byId
  }

  if (!part) return notFound()

  const images: string[] = part.images || []
  const thumbnail = images[0] || '/placeholder-part.jpg'

  return (
    <div className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="h-96 bg-gray-200 rounded overflow-hidden">
            <img src={thumbnail} alt={part.title} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-semibold mt-4">{part.title}</h2>
          <p className="text-sm text-gray-600">Sold by {part.seller || 'Gaarijua Parts'}</p>
          <p className="mt-4">{part.description}</p>
          {part.compatible_models && (
            <div className="mt-4">
              <h3 className="font-semibold">Compatible Models</h3>
              <ul className="list-disc ml-5 mt-2 text-sm">
                {part.compatible_models.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-3xl font-bold">${part.price}</div>
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
