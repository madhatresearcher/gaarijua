"use client"
import { useRef, useState, useEffect, ReactNode } from 'react'

interface CarouselProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function Carousel({ title, subtitle, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <section className="relative">
      {/* Header with decorative accent */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 ml-6 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="hidden md:flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  )
}
