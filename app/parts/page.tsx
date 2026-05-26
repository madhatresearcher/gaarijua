import PartsExplorer from '../../components/PartsExplorer'
import { getPartsForListing } from '../../lib/db/queries'

export const revalidate = 60

export default async function PartsPage() {
  const initialParts = await getPartsForListing({}, 48)

  return (
    <div className="bg-white">
      <PartsExplorer initialParts={initialParts} />
    </div>
  )
}
