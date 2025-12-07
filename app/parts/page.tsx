import PartsExplorer from '../../components/PartsExplorer'
import { supabaseServer } from '../../lib/supabase-server'

export default async function PartsPage() {
  const { data } = await supabaseServer
    .from('parts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(48)

  const initialParts = Array.isArray(data) ? data : []

  return (
    <div className="bg-white">
      <PartsExplorer initialParts={initialParts} />
    </div>
  )
}
