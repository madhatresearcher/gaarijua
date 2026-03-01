import CarsExplorer from '../../components/CarsExplorer'
import { supabaseServer } from '../../lib/supabase-server'
import { isListingPubliclyVisible } from '../../lib/listing-visibility'

export default async function CarsPage() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .in('status', ['active', 'closed'])
    .eq('is_for_rent', true)
    .order('created_at', { ascending: false })
    .limit(64)

  const initialCars = Array.isArray(data) ? data.filter((car) => isListingPubliclyVisible(car)).slice(0, 32) : []

  return (
    <div className="bg-white">
      <CarsExplorer initialCars={initialCars} />
    </div>
  )
}
