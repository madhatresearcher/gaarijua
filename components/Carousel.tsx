"use client"
import { ReactNode, useRef } from 'react'

export default function Carousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)

  function scroll(delta: number) {
    if (!ref.current) return
    ref.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div ref={ref} className="flex gap-6 overflow-x-auto scrollbar-none py-4 px-3 snap-x snap-mandatory scroll-pl-6">
          {children}
        </div>
      </div>
      <button aria-label="scroll left" onClick={() => scroll(-420)} className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-md backdrop-blur-sm">
        ‹
      </button>
      <button aria-label="scroll right" onClick={() => scroll(420)} className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-md backdrop-blur-sm">
        ›
      </button>
    </div>
  )
}
