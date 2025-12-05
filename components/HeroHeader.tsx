import Link from 'next/link'

const pattern = "data:image/svg+xml,%3Csvg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23ffffff' stroke-opacity='0.12' stroke-width='2'%3E%3Cpath d='M0 22.5h90M0 67.5h90M22.5 0v90M67.5 0v90'/%3E%3C/g%3E%3Ccircle cx='45' cy='45' r='6' fill='%23ffffff' fill-opacity='0.08'/%3E%3C/g%3E%3C/svg%3E"

export default function HeroHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#D87D4A] via-[#F2B94A] to-[#B6532A] text-white">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url(${pattern})`, backgroundSize: '220px 220px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-10">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight">Gaarijua</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white hidden sm:inline">
              Uganda's #1 Auto Marketplace
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/cars" className="hidden sm:inline text-white/85 hover:text-white transition-colors">
              Cars
            </Link>
            <Link href="/parts" className="hidden sm:inline text-white/85 hover:text-white transition-colors">
              Parts
            </Link>
            <Link href="/host" className="text-white/85 hover:text-white transition-colors hidden md:inline">
              Host Status
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 rounded-full border border-white/50 text-white font-semibold hover:bg-white/10 transition"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-white/85">Cars &amp; Parts Marketplace</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              Find your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300">perfect ride.</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Rent, buy, or source genuine parts vetted for East African roads. Trusted listings, fast responses, secure payments.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <Link
                href="/cars"
                className="px-6 py-3 rounded-full bg-white text-stone-900 shadow-xl shadow-amber-600/40 whitespace-nowrap"
              >
                Browse Cars
              </Link>
              <Link
                href="/parts"
                className="px-6 py-3 rounded-full border border-white/70 text-white hover:bg-white/10 transition whitespace-nowrap"
              >
                Browse Parts
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/85">
              <span className="px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">Verified sellers</span>
              <span className="px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">Secure payments</span>
              <span className="px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">Nationwide delivery options</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-black/25 text-stone-900 lg:translate-y-6">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-stone-400">Search inventory</p>
            <form className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[0.9fr,1.1fr] gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-stone-500">Type</label>
                  <select className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 font-semibold text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none">
                    <option>All Types</option>
                    <option>Rent</option>
                    <option>Buy</option>
                    <option>Parts</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-stone-500">Search</label>
                  <input
                    type="text"
                    placeholder="Search make, model, or part name"
                    className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-[#D87D4A] to-[#F2B94A] py-3 text-sm font-bold uppercase text-white shadow-xl shadow-amber-500/40 hover:opacity-95 transition"
              >
                Search
              </button>
              <p className="text-xs text-stone-500 text-center">Instant matches from verified hosts and dealers</p>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
