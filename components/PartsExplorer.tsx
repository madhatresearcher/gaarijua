"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import PartsFilterBar, { PartFilterFields } from './PartsFilterBar'
import PartCard from './PartCard'

const defaultFilters: PartFilterFields = {
  location: '',
  make: '',
  model: '',
  seller: '',
  minPrice: '',
  maxPrice: '',
}

type PartsExplorerProps = {
  initialParts: any[]
}

export default function PartsExplorer({ initialParts }: PartsExplorerProps) {
  const [workingFilters, setWorkingFilters] = useState<PartFilterFields>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<PartFilterFields>(defaultFilters)
  const [parts, setParts] = useState(initialParts)
  const [loading, setLoading] = useState(false)
  const shouldSkipInitialFetch = useRef(initialParts.length > 0)

  const fetchParts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (appliedFilters.make) params.set('make', appliedFilters.make)
      if (appliedFilters.model) params.set('model', appliedFilters.model)
      if (appliedFilters.seller) params.set('seller', appliedFilters.seller)
      if (appliedFilters.minPrice) params.set('minPrice', appliedFilters.minPrice)
      if (appliedFilters.maxPrice) params.set('maxPrice', appliedFilters.maxPrice)

      const response = await fetch(`/api/parts?${params.toString()}`)
      if (!response.ok) {
        console.error('PartsExplorer fetch failed:', response.status)
        setParts([])
        return
      }
      const body = await response.json()
      setParts(Array.isArray(body?.parts) ? body.parts : [])
    } catch (error) {
      console.error('PartsExplorer fetch failed:', (error as Error).message)
      setParts([])
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    if (shouldSkipInitialFetch.current) {
      shouldSkipInitialFetch.current = false
      const defaultFiltersApplied = Object.values(appliedFilters).every((value) => !value)
      if (defaultFiltersApplied) {
        return
      }
    }
    void fetchParts()
  }, [appliedFilters, fetchParts])

  const handleApplyFilters = () => {
    setAppliedFilters(workingFilters)
  }

  const handleResetFilters = () => {
    setWorkingFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Parts</h1>
          <p className="text-sm text-slate-500">
            Search verified parts, compare prices, and contact sellers with confidence.
          </p>
        </div>

        <PartsFilterBar
          filters={workingFilters}
          onChange={(field: keyof PartFilterFields, value: string) =>
            setWorkingFilters((prev: PartFilterFields) => ({ ...prev, [field]: value }))
          }
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              {loading ? 'Refreshing parts...' : `${parts.length} parts shown`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {parts.map((part) => (
              <PartCard key={part.id ?? part.slug} part={part} />
            ))}
          </div>
          {!loading && parts.length === 0 && (
            <p className="text-sm text-slate-500">No parts matched your filters yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
