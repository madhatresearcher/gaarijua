import CarsExplorer from '../../components/CarsExplorer'
import { getCarsForListing } from '../../lib/db/queries'
import { isListingPubliclyVisible } from '../../lib/listing-visibility'

export const revalidate = 60

export default async function CarsPage() {
  const data = await getCarsForListing({ mode: 'rent' }, 64)
  const initialCars = data.filter((car) => isListingPubliclyVisible(car)).slice(0, 32)

  return (
    <div className="bg-white">
      <CarsExplorer initialCars={initialCars} />
    </div>
  )
}
