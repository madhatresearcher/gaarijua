import Link from 'next/link'
import { supabaseServer } from '../lib/supabase-server'
import { isListingPubliclyVisible } from '../lib/listing-visibility'
import Carousel from '../components/Carousel'
import HeroCard from '../components/HeroCard'
import ListingCard from '../components/ListingCard'

export const revalidate = 60 // ISR: revalidate every 60 seconds

const categories = [
  { name: 'SUVs', href: '/cars?category=suv', icon: '🚙' },
  { name: 'Sedans', href: '/cars?category=sedan', icon: '🚗' },
  { name: 'Pickups', href: '/cars?category=pickup', icon: '🛻' },
  { name: 'Commercial', href: '/cars?category=commercial', icon: '🚐' },
  { name: 'Parts', href: '/parts', icon: '🔧' },
]

async function getPromotedCars() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .in('status', ['active', 'closed'])
    .eq('promoted', true)
    .gte('promoted_expires', new Date().toISOString())
    .order('promoted_expires', { ascending: true })
    .limit(24)
  return (data ?? []).filter((car) => isListingPubliclyVisible(car)).slice(0, 12)
}

async function getTrendingCars() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .in('status', ['active', 'closed'])
    .gt('views_count', 0)
    .gte('updated_at', threeDaysAgo)
    .order('views_count', { ascending: false })
    .limit(24)
  return (data ?? []).filter((car) => isListingPubliclyVisible(car)).slice(0, 12)
}

async function getHotParts() {
  const { data } = await supabaseServer
    .from('parts')
    .select('*')
    .gt('sales_count', 0)
    .order('sales_count', { ascending: false })
    .limit(12)
  return data ?? []
}

async function getLatestCars() {
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .in('status', ['active', 'closed'])
    .order('created_at', { ascending: false })
    .limit(32)
  return (data ?? []).filter((car) => isListingPubliclyVisible(car)).slice(0, 8)
}

export default async function Home() {
  const [promotedCars, trendingCars, hotParts, latestCars] = await Promise.all([
    getPromotedCars(),
    getTrendingCars(),
    getHotParts(),
    getLatestCars(),
  ])

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-8">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">East Africa’s trusted auto market</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            Browse verified rentals, sales, and spare parts across Uganda
          </h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto">
            Gaarijua keeps the market honest with transparent listings, real-time availability, and fast responses.
            Explore ready-to-drive cars or find the exact part you need.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5"
            >
              Browse Cars
            </Link>
            <Link
              href="/parts"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50"
            >
              Browse Parts
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-20 mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto bg-white rounded-full shadow-lg border border-stone-200 px-3 py-2">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition whitespace-nowrap"
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-12 pb-16">

        {promotedCars.length > 0 && (
          <section className="px-0">
            <Carousel title="🔥 Promoted Listings" subtitle="Featured vehicles from verified sellers">
              {promotedCars.map((car: any) => (
                <HeroCard key={car.id} item={car} tag="PROMOTED" tagColor="amber" type="car" />
              ))}
            </Carousel>
          </section>
        )}

        {trendingCars.length > 0 && (
          <section className="px-0">
            <Carousel title="📈 Trending Now" subtitle="Most viewed in the last 3 days">
              {trendingCars.map((car: any) => (
                <HeroCard key={car.id} item={car} tag={`${car.views_count ?? 0} views`} tagColor="blue" type="car" />
              ))}
            </Carousel>
          </section>
        )}

        {hotParts.length > 0 && (
          <section className="px-0">
            <Carousel title="⚡ Fast-Moving Parts" subtitle="Top-selling spare parts this month">
              {hotParts.map((part: any) => (
                <HeroCard key={part.id} item={part} tag={`${part.sales_count ?? 0} sold`} tagColor="green" type="part" />
              ))}
            </Carousel>
          </section>
        )}

        {latestCars.length > 0 && (
          <section className="px-0">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Latest Listings</h2>
                </div>
                <p className="mt-1 ml-6 text-sm text-gray-500">Fresh arrivals added recently</p>
              </div>
              <Link
                href="/cars"
                className="group flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-amber-100 rounded-xl font-semibold text-gray-700 transition-colors"
              >
                <span>View All</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {latestCars.map((car: any) => (
                <ListingCard key={car.id} item={car} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
