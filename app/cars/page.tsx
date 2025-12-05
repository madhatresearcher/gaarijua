import CarCard from '../../components/CarCard'
import SearchBar from '../../components/SearchBar'
import FiltersSidebar from '../../components/FiltersSidebar'
import CarsList from '../../components/CarsList'
import { supabaseServer } from '../../lib/supabase-server'

export default async function CarsPage() {
  const { data: cars, error } = await supabaseServer
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const initialCars = Array.isArray(cars) ? cars : []

  return (
    <div className="flex gap-6">
      <aside className="w-72 hidden lg:block">
        <FiltersSidebar />
      </aside>
      <div className="flex-1">
        <SearchBar />
        <div className="mt-6">
          <CarsList initialCars={initialCars} />
        </div>
      </div>
    </div>
  )
}
