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
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-none py-2 px-1">
          {children}
        </div>
      </div>
      <button aria-label="scroll left" onClick={() => scroll(-400)} className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow ml-2">
        ‹
      </button>
      <button aria-label="scroll right" onClick={() => scroll(400)} className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow mr-2">
        ›
      </button>
    </div>
  )
}
