import CarCard from '../../components/CarCard'
import SearchBar from '../../components/SearchBar'
import FiltersSidebar from '../../components/FiltersSidebar'

const sampleCars = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  title: `Sample Car ${i + 1}`,
  location: 'Nairobi, KE',
  pricePerDay: 45 + i * 5,
  thumbnail: '/placeholder-car.jpg'
}))

export default function CarsPage() {
  return (
    <div className="flex gap-6">
      <aside className="w-72 hidden lg:block">
        <FiltersSidebar />
      </aside>
      <div className="flex-1">
        <SearchBar />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  )
}
