import Link from 'next/link'
import { supabaseServer } from '../lib/supabase-server'
import Carousel from '../components/Carousel'
import HeroCard from '../components/HeroCard'
import ListingCard from '../components/ListingCard'

export const revalidate = 60 // ISR: revalidate every 60 seconds

// ─────────────────────────────────────────────────────────────
// DATA FETCHING
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// CATEGORIES (static links — no DB dependency)
// ─────────────────────────────────────────────────────────────

const categories = [
  { name: 'SUVs', href: '/cars?category=suv', icon: '🚙' },
  { name: 'Sedans', href: '/cars?category=sedan', icon: '🚗' },
  { name: 'Pickups', href: '/cars?category=pickup', icon: '🛻' },
  { name: 'Commercial', href: '/cars?category=commercial', icon: '🚐' },
  { name: 'Parts', href: '/parts', icon: '🔧' },
]

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default async function Home() {
  // Fetch all data in parallel
  const [promotedCars, trendingCars, hotParts, latestCars] = await Promise.all([
    getPromotedCars(),
    getTrendingCars(),
    getHotParts(),
    getLatestCars(),
  ])

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ════════════════════════════════════════════════════════════
          HERO SECTION — Distinctive Gaarijua style
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background with terracotta/earth gradient + geometric pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-amber-900 to-orange-800" />
        {/* African-inspired geometric overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Decorative accent shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm text-amber-100 font-medium">Uganda&apos;s #1 Auto Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight text-white">
              Find Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
                Perfect Ride
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-stone-300 max-w-xl leading-relaxed">
              Rent cars, buy vehicles, or source genuine spare parts — all verified, all local.
            </p>

            {/* Hero search bar — visible when at top; header search takes over on scroll */}
            <div className="mt-10 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-2xl">
              <form className="flex flex-col sm:flex-row gap-2">
                <select
                  name="type"
                  className="px-4 py-3 bg-white/20 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 sm:w-32"
                  defaultValue="all"
                >
                  <option value="all" className="text-gray-800">All Types</option>
                  <option value="rent" className="text-gray-800">🚗 Rent</option>
                  <option value="buy" className="text-gray-800">💰 Buy</option>
                  <option value="parts" className="text-gray-800">🔧 Parts</option>
                </select>
                <input
                  type="text"
                  name="q"
                  placeholder="Search by make, model, or part..."
                  className="flex-1 px-4 py-3 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cars"
                className="group px-7 py-4 bg-white text-stone-900 font-bold rounded-xl hover:bg-amber-50 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Browse Cars</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/parts"
                className="px-7 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                🔧 Browse Parts
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-stone-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURED CATEGORIES — Distinctive card style
      ════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center gap-2 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-400 hover:-translate-y-1"
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROMOTED ADS CAROUSEL
      ════════════════════════════════════════════════════════════ */}
      {promotedCars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <Carousel title="🔥 Promoted Listings" subtitle="Featured vehicles from verified sellers">
            {promotedCars.map((car: any) => (
              <HeroCard
                key={car.id}
                item={car}
                tag="PROMOTED"
                tagColor="amber"
                type="car"
              />
            ))}
          </Carousel>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          TRENDING CARS CAROUSEL (last 3 days)
      ════════════════════════════════════════════════════════════ */}
      {trendingCars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-r from-stone-100 to-amber-50 -mx-4 px-8 rounded-none md:rounded-3xl">
          <Carousel title="📈 Trending Now" subtitle="Most viewed in the last 3 days">
            {trendingCars.map((car: any) => (
              <HeroCard
                key={car.id}
                item={car}
                tag={`${car.views_count ?? 0} views`}
                tagColor="blue"
                type="car"
              />
            ))}
          </Carousel>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          HOT SPARE PARTS CAROUSEL
      ════════════════════════════════════════════════════════════ */}
      {hotParts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <Carousel title="⚡ Fast-Moving Parts" subtitle="Top-selling spare parts this month">
            {hotParts.map((part: any) => (
              <HeroCard
                key={part.id}
                item={part}
                tag={`${part.sales_count ?? 0} sold`}
                tagColor="green"
                type="part"
              />
            ))}
          </Carousel>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          LATEST LISTINGS GRID
      ════════════════════════════════════════════════════════════ */}
      {latestCars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Latest Listings</h2>
              </div>
              <p className="mt-1 ml-6 text-sm text-gray-500">Fresh arrivals added recently</p>
            </div>
            <Link href="/cars" className="group flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-amber-100 rounded-xl font-semibold text-gray-700 transition-colors">
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

      {/* ════════════════════════════════════════════════════════════
          CALL TO ACTION FOOTER BANNER — Distinctive Gaarijua style
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
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
  )
}
