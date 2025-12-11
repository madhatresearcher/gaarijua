import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabase-server'
import PartDetailLayout from '../../../components/PartDetailLayout'

export default async function PartDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: bySlug } = await supabaseServer.from('parts').select('*').eq('slug', id).maybeSingle()
  let part = bySlug
  if (!part) {
    const { data: byId } = await supabaseServer.from('parts').select('*').eq('id', id).maybeSingle()
    part = byId
  }

  if (!part) return notFound()

  return (
    <div className="bg-slate-50">
      <PartDetailLayout part={part} />
    </div>
  )
}
