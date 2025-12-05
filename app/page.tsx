import { supabaseServer } from '../lib/supabase-server'
import Carousel from '../components/Carousel'
import HeroCard from '../components/HeroCard'

export const revalidate = 60

async function fetchPromoted() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .eq('promoted', true)
    .gte('promoted_expires', 'now()')
    .order('promoted_expires', { ascending: true })
    .limit(12)
  return data || []
}

async function fetchPopularThisWeek() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .gt('views_count', 0)
    .gte('created_at', `now() - interval '7 days'`)
    .order('views_count', { ascending: false })
    .limit(12)
  return data || []
}

async function fetchFastMovingParts() {
  const { data } = await supabaseServer
    .from('parts')
    .select('*')
    .gt('sales_count', 0)
    .order('sales_count', { ascending: false })
    .limit(12)
  return data || []
}

export default async function Home() {
  const [promoted, popular, parts] = await Promise.all([
    fetchPromoted(),
    fetchPopularThisWeek(),
    fetchFastMovingParts(),
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-yellow-50 via-white to-amber-50 p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">Gaarijua — Know Your Car</h1>
            <p className="mt-4 text-slate-700 max-w-xl">
              Discover premium rentals, buy trusted vehicles, and find quality spare parts across the region. Fast, secure, and built for African drivers.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/cars" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md shadow hover:brightness-95">Browse Cars</a>
              <a href="/parts" className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-amber-700 bg-white hover:bg-amber-50">Browse Parts</a>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <div className="bg-[url('/hero-cars.jpg')] bg-cover bg-center h-56 lg:h-80" />
              <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-sm font-medium">Premium marketplace</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promoted Ads */}
      {promoted.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Promoted Ads</h2>
            <a href="/cars" className="text-sm text-slate-600">View all</a>
          </div>
          <Carousel>
            {promoted.map((c: any) => (
              <HeroCard key={c.id ?? c.slug} item={c} kind="car" promoted />
            ))}
          </Carousel>
        </section>
      )}

      {/* Popular Cars This Week */}
      {popular.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Popular Cars This Week</h2>
            <a href="/cars" className="text-sm text-slate-600">See more</a>
          </div>
          <Carousel>
            {popular.map((c: any) => (
              <HeroCard key={c.id ?? c.slug} item={c} kind="car" views={c.views_count} />
            ))}
          </Carousel>
        </section>
      )}

      {/* Fast-moving spare parts */}
      {parts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Fast-moving Spare Parts</h2>
            <a href="/parts" className="text-sm text-slate-600">Browse parts</a>
          </div>
          <Carousel>
            {parts.map((p: any) => (
              <HeroCard key={p.id ?? p.slug} item={p} kind="part" sales={p.sales_count} />
            ))}
          </Carousel>
        </section>
      )}
    </main>
  )
}
