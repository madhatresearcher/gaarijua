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
      <section className="mb-12">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-10 lg:p-16">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">Find cars & parts — fast</h1>
              <p className="mt-3 text-slate-600 max-w-lg">Rent or buy trusted vehicles and source quality spare parts from sellers across the region.</p>

              <form className="mt-6 bg-white border rounded-full p-2 shadow-sm flex items-center gap-2">
                <input placeholder="Search location or model" className="flex-1 px-4 py-3 rounded-full outline-none text-sm" />
                <div className="hidden sm:flex items-center gap-2 px-3">
                  <input type="date" className="text-sm px-3 py-2 rounded-lg border" />
                </div>
                <button className="ml-2 bg-amber-600 text-white px-4 py-2 rounded-full text-sm">Search</button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                <a className="px-3 py-1 rounded-full bg-slate-50 border text-sm">Daily Rentals</a>
                <a className="px-3 py-1 rounded-full bg-slate-50 border text-sm">Buy a Car</a>
                <a className="px-3 py-1 rounded-full bg-slate-50 border text-sm">Spare Parts</a>
                <a className="px-3 py-1 rounded-full bg-slate-50 border text-sm">Promotions</a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-80 bg-[url('/hero-cars.jpg')] bg-cover bg-center" />
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
