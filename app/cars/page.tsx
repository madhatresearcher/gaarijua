import CarsExplorer from '../../components/CarsExplorer'
import { supabaseServer } from '../../lib/supabase-server'

export default async function CarsPage() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .eq('is_for_rent', true)
    .order('created_at', { ascending: false })
    .limit(32)

  const initialCars = Array.isArray(data) ? data : []

  return (
    <div className="bg-white">
      <CarsExplorer initialCars={initialCars} />
    </div>
  )
}
