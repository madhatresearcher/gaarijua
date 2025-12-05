"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const hideOnHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (hideOnHome) return null

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* expanded state shown at top */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            scrolled ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-white tracking-tight">
              Gaarijua
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/cars" className="text-sm font-medium text-white/80 hover:text-white transition">
                Cars
              </Link>
              <Link href="/parts" className="text-sm font-medium text-white/80 hover:text-white transition">
                Parts
              </Link>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur transition">
                Sign in
              </button>
            </nav>
          </div>
        </div>

        {/* collapsed/floating state for scrolled header */}
        <div
          className={`flex items-center gap-4 transition-all duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
          }`}
        >
          <Link href="/" className="text-xl font-black text-amber-600 tracking-tight shrink-0">
            Gaarijua
          </Link>

          <form className="flex-1 flex items-center bg-stone-100 rounded-full border border-stone-200 hover:shadow-md transition-shadow overflow-hidden max-w-2xl">
            <select
              name="type"
              className="pl-4 pr-2 py-2.5 bg-transparent text-sm font-medium text-gray-700 focus:outline-none border-r border-stone-200"
              defaultValue="all"
            >
              <option value="all">All</option>
              <option value="rent">Rent</option>
              <option value="buy">Buy</option>
              <option value="parts">Parts</option>
            </select>
            <input
              type="text"
              name="q"
              placeholder="Search cars, parts..."
              className="flex-1 px-4 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              className="m-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full hover:shadow-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>

          <nav className="flex items-center gap-4 shrink-0">
            <Link href="/cars" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Cars
            </Link>
            <Link href="/parts" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Parts
            </Link>
            <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-stone-100 hover:bg-stone-200 rounded-full transition">
              Sign in
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
