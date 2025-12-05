import PartCard from '../../components/PartCard'
import SearchBar from '../../components/SearchBar'
import PartsList from '../../components/PartsList'
import { supabaseServer } from '../../lib/supabase-server'

export default async function PartsPage() {
  const { data: parts, error } = await supabaseServer
    .from('parts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const initialParts = Array.isArray(parts) ? parts : []

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
      <div className="mt-6">
        <PartsList initialParts={initialParts} />
      </div>
    </div>
  )
}
