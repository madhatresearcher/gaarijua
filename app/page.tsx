import Link from 'next/link'
import { supabaseServer } from '../lib/supabase-server'
import Carousel from '../components/Carousel'
import HeroCard from '../components/HeroCard'
import ListingCard from '../components/ListingCard'
import HeroHeader from '../components/HeroHeader'

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
    .eq('promoted', true)
    .gte('promoted_expires', new Date().toISOString())
    .order('promoted_expires', { ascending: true })
    .limit(12)
  return data ?? []
}

async function getTrendingCars() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseServer
    .from('cars')
    .select('*')
    .gt('views_count', 0)
    .gte('updated_at', threeDaysAgo)
    .order('views_count', { ascending: false })
    .limit(12)
  return data ?? []
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
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
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
      <HeroHeader />

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-12">
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-400 hover:-translate-y-1"
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
            </Link>
          ))}
        </section>

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

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white">Ready to Sell Your Car?</h2>
              <p className="mt-3 text-lg text-stone-300 max-w-md">
                List your vehicle and reach thousands of buyers across Uganda. It&apos;s fast, easy, and free to get started.
              </p>
            </div>
            <Link
              href="/sell"
              className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 flex items-center gap-3"
            >
              <span>Start Selling</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
