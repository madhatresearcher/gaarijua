"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

// HeaderGlassy uses a 10px scroll threshold to toggle between solid and frosted-glass classes.
export default function HeaderGlassy() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!searchOpen) return undefined
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [searchOpen])

  const headerClasses = `fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
    scrolled
      ? 'bg-white/20 backdrop-blur-md border border-white/10 shadow-md'
      : 'bg-white shadow-sm'
  }`

  const searchPillClasses = `flex w-full max-w-3xl items-center gap-2 rounded-full shadow-sm px-2 py-1 transition-all duration-300 ${
    scrolled ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
  }`

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Gaarijua home" className="font-extrabold text-lg md:text-xl text-slate-900">
              Gaarijua
            </Link>
            <span className="hidden md:inline-block text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-800">
              Uganda’s #1 Auto Marketplace
            </span>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:justify-center">
            <form method="get" action="/cars" className={searchPillClasses}>
              <label className="sr-only" htmlFor="search-type">
                Search type
              </label>
              <select
                id="search-type"
                name="type"
                aria-label="Select listing type"
                className="rounded-full border border-slate-200 bg-transparent px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                defaultValue="all"
              >
                <option value="all">All</option>
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
                <option value="parts">Parts</option>
              </select>

              <label className="sr-only" htmlFor="search-query">
                Search listings and parts
              </label>
              <input
                id="search-query"
                name="q"
                aria-label="Search make, model, or part"
                placeholder="Search make, model, or part"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                className="ml-auto rounded-full bg-[var(--g-accent,#F2B94A)] px-5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open search"
              className="sm:hidden rounded-full border border-slate-200 p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
              onClick={() => setSearchOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link
                href="/cars"
                className={`px-2 text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none ${
                  scrolled ? 'text-slate-900/90' : 'text-slate-900'
                }`}
              >
                Cars
              </Link>
              <Link
                href="/parts"
                className={`px-2 text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none ${
                  scrolled ? 'text-slate-900/90' : 'text-slate-900'
                }`}
              >
                Parts
              </Link>
            </nav>

            <button
              type="button"
              className={`hidden md:inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                scrolled
                  ? 'border border-white/30 bg-white/10 text-slate-900/90'
                  : 'border border-slate-200 bg-white text-slate-900'
              }`}
            >
              Host Status
            </button>

            <button
              type="button"
              aria-label="View alerts"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>

            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Search Gaarijua</h2>
              <button
                type="button"
                aria-label="Close search"
                className="rounded-full p-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
                onClick={() => setSearchOpen(false)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              method="get"
              action="/cars"
              className="mt-4 flex flex-col gap-4"
              onSubmit={() => setSearchOpen(false)}
            >
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="mobile-search-type">
                Listing type
              </label>
              <select
                id="mobile-search-type"
                name="type"
                defaultValue="all"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="all">All</option>
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
                <option value="parts">Parts</option>
              </select>

              <label className="sr-only" htmlFor="mobile-search-query">
                Search make, model, or part
              </label>
              <input
                id="mobile-search-query"
                name="q"
                aria-label="Search make, model, or part"
                placeholder="Search make, model, or part"
                className="rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />

              <button
                type="submit"
                className="rounded-full bg-[var(--g-accent,#F2B94A)] px-4 py-3 text-center text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
