import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabase-server'
import { PART_DETAIL_FIELDS } from '../../../lib/selects'
import PartDetailLayout from '../../../components/PartDetailLayout'

export const revalidate = 60

export default async function PartDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: bySlug } = await supabaseServer.from('parts').select(PART_DETAIL_FIELDS).eq('slug', id).maybeSingle()
  let part = bySlug
  if (!part) {
    const { data: byId } = await supabaseServer.from('parts').select(PART_DETAIL_FIELDS).eq('id', id).maybeSingle()
    part = byId
  }

  if (!part) return notFound()

  return (
    <div className="bg-slate-50">
      <PartDetailLayout part={part} />
    </div>
  )
}
