import PartCard from '../../components/PartCard'
import SearchBar from '../../components/SearchBar'

const sampleParts = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Part ${i + 1}`,
  seller: 'Gaarijua Parts',
  price: (20 + i * 5).toFixed(2),
  thumbnail: '/placeholder-part.jpg'
}))

export default function PartsPage() {
  return (
    <div>
      <SearchBar />
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Parts</h2>
        <select className="border rounded px-3 py-1">
          <option>Sort: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sampleParts.map(p => (
          <PartCard key={p.id} part={p} />
        ))}
      </div>
    </div>
  )
}
