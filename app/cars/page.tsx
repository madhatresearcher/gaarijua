import CarsExplorer from '../../components/CarsExplorer'
import { supabaseServer } from '../../lib/supabase-server'
import { isListingPubliclyVisible } from '../../lib/listing-visibility'
import { CAR_CARD_FIELDS } from '../../lib/selects'

type CarListRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  model?: string
  year?: number
  images?: string[]
  thumbnail?: string
  price_per_day?: number
  price_buy?: number
  is_for_rent?: boolean
  location?: string
  status?: string | null
  closed_at?: string | null
  updated_at?: string | null
}

export const revalidate = 60

export default async function CarsPage() {
  const { data } = await supabaseServer
    .from('cars')
    .select(CAR_CARD_FIELDS)
    .in('status', ['active', 'closed'])
    .eq('is_for_rent', true)
    .order('created_at', { ascending: false })
    .limit(64)
    .overrideTypes<CarListRecord[], { merge: false }>()

  const initialCars = Array.isArray(data) ? data.filter((car) => isListingPubliclyVisible(car)).slice(0, 32) : []

  return (
    <div className="bg-white">
      <CarsExplorer initialCars={initialCars} />
    </div>
  )
}
