"use client"
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client'
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

  const fetchParts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('parts').select('*').order('created_at', { ascending: false }).limit(48)

    if (appliedFilters.location) {
      query = query.ilike('location', `%${appliedFilters.location}%`)
    }
    if (appliedFilters.make) {
      const look = `%${appliedFilters.make}%`
      query = query.or(`brand.ilike.${look},make.ilike.${look}`)
    }
    if (appliedFilters.model) {
      const look = `%${appliedFilters.model}%`
      query = query.or(`model.ilike.${look},compatible_models.ilike.${look}`)
    }
    if (appliedFilters.seller) {
      query = query.ilike('seller', `%${appliedFilters.seller}%`)
    }
    if (appliedFilters.minPrice) {
      query = query.gte('price', Number(appliedFilters.minPrice))
    }
    if (appliedFilters.maxPrice) {
      query = query.lte('price', Number(appliedFilters.maxPrice))
    }

    const { data } = await query
    setParts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [appliedFilters])

  useEffect(() => {
    fetchParts()
  }, [fetchParts])

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
