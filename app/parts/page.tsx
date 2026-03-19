import PartsExplorer from '../../components/PartsExplorer'
import { supabaseServer } from '../../lib/supabase-server'
import { PART_CARD_FIELDS } from '../../lib/selects'

export const revalidate = 60

export default async function PartsPage() {
  const { data } = await supabaseServer
    .from('parts')
    .select(PART_CARD_FIELDS)
    .order('created_at', { ascending: false })
    .limit(48)

  const initialParts = Array.isArray(data) ? data : []

  return (
    <div className="bg-white">
      <PartsExplorer initialParts={initialParts} />
    </div>
  )
}
