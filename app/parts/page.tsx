import PartsExplorer from '../../components/PartsExplorer'
import { supabaseServer } from '../../lib/supabase-server'
import { PART_CARD_FIELDS } from '../../lib/selects'

type PartListRecord = {
  id?: string
  slug?: string
  title?: string
  seller?: string
  category?: string
  images?: string[]
  price?: number
}

export const revalidate = 60

export default async function PartsPage() {
  const { data, error } = await supabaseServer
    .from('parts')
    .select(PART_CARD_FIELDS)
    .order('created_at', { ascending: false })
    .limit(48)
    .overrideTypes<PartListRecord[], { merge: false }>()
  if (error) {
    console.error('PartsPage query failed:', error.message)
  }

  const initialParts = Array.isArray(data) ? data : []

  return (
    <div className="bg-white">
      <PartsExplorer initialParts={initialParts} />
    </div>
  )
}
