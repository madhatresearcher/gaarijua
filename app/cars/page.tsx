import CarsExplorer from '../../components/CarsExplorer'
import { getCarListingPage } from '../../lib/db/queries'
import { isListingPubliclyVisible } from '../../lib/listing-visibility'

export const revalidate = 60

export default async function CarsPage() {
  const page = await getCarListingPage({ mode: 'rent' }, { limit: 24 })
  const initialCars = page.cars.filter((car) => isListingPubliclyVisible(car))

  return (
    <div className="bg-white">
      <CarsExplorer initialCars={initialCars} initialNextCursor={page.nextCursor} />
    </div>
  )
}
