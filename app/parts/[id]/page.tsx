import { notFound } from 'next/navigation'
import { getPartBySlugOrId } from '../../../lib/db/queries'
import PartDetailLayout from '../../../components/PartDetailLayout'

type PartRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  category?: string
  description?: string
  images?: string[]
  compatible_models?: string[]
  price?: number
  seller?: string
  sku?: string
  created_at?: string
}

export const revalidate = 60

export default async function PartDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const part = (await getPartBySlugOrId(id)) as PartRecord | null

  if (!part) return notFound()

  return (
    <div className="bg-slate-50">
      <PartDetailLayout part={part} />
    </div>
  )
}
