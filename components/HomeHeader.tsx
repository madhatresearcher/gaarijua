import Link from 'next/link'

export default function HomeHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white">
      <div
        className="absolute inset-0 opacity-15"
        style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.18'%3E%3Cpath d='M60 49V24h-3v25H32v3h25v25h3V52h25v-3H60zm-54 0V24H3v25h-25v3H3v25h3V52h25v-3H6zm108 0V24h-3v25H86v3h25v25h3V52h25v-3h-25z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-16 sm:pb-18 lg:pb-20 space-y-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Gaarijua
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/cars" className="hover:text-amber-100 transition-colors">
              Cars
            </Link>
            <Link href="/parts" className="hover:text-amber-100 transition-colors">
              Parts
            </Link>
            <Link
              href="/signin"
              className="px-4 py-2 rounded-full border border-white/30 hover:border-white/60 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </nav>

        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Marketplace for cars & parts</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight drop-shadow-sm">
            Find your next ride or the parts to keep it moving
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Discover vetted vehicles to rent or buy, and genuine spare parts from trusted sellers across the region.
          </p>
        </div>

        <div className="flex justify-center">
          <form className="w-full max-w-3xl bg-white text-gray-900 rounded-full shadow-2xl shadow-orange-500/30 border border-white/30 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
              <label className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-gray-700">
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-gray-500">Type</span>
                <select className="bg-transparent font-semibold text-sm text-gray-800 focus:outline-none">
                  <option>Cars</option>
                  <option>Parts</option>
                </select>
              </label>
              <div className="flex flex-1 items-center gap-3 px-5 py-3.5">
                <div className="flex-1">
                  <div className="text-[0.65rem] uppercase tracking-[0.25em] text-gray-500">Search</div>
                  <input
                    type="text"
                    placeholder="Model, location, or seller"
                    className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-orange-500/40 hover:shadow-orange-500/70 transition transform hover:-translate-y-0.5"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </header>
  )
}