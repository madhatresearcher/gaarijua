"use client"
import { useEffect, useState } from 'react'

const stickyThreshold = 240

export default function FloatingSearchBar() {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > stickyThreshold)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="relative">
      <div
        className={`transition-all duration-500 ease-in-out ${isSticky
          ? 'fixed top-4 left-1/2 -translate-x-1/2 w-[min(640px,calc(100%-32px))] bg-white/95 border border-amber-100 shadow-2xl shadow-amber-500/40 rounded-2xl py-3 z-50 backdrop-blur'
          : 'relative bg-transparent'
        }`}
      >
        <form className={`flex flex-col sm:flex-row gap-2 px-4 ${isSticky ? 'py-2' : 'py-0'}`}>
          <select
            name="type"
            className={`px-4 py-3 font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${isSticky ? 'bg-white text-gray-800' : 'bg-stone-100 text-gray-700'}`}
            defaultValue="all"
          >
            <option value="all">All Types</option>
            <option value="rent">🚗 Rent</option>
            <option value="buy">💰 Buy</option>
            <option value="parts">🔧 Parts</option>
          </select>
          <input
            type="text"
            name="q"
            placeholder="Search by make, model, or part name..."
            className="flex-1 px-4 py-3 text-gray-800 bg-white rounded-xl focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition" 
          >
            Search
          </button>
        </form>
      </div>
      {isSticky && <div className="h-16" aria-hidden="true" />}
    </div>
  )
}
