"use client"
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client'
import CarsToggle from './CarsToggle'
import CarsFilterBar, { FilterFields } from './CarsFilterBar'
import CarCard from './CarCard'

const defaultFilters: FilterFields = {
  location: '',
  make: '',
  model: '',
  year: '',
  minPrice: '',
  maxPrice: '',
}

type CarsExplorerProps = {
  initialCars: any[]
}

export default function CarsExplorer({ initialCars }: CarsExplorerProps) {
  const [mode, setMode] = useState<'rent' | 'buy'>('rent')
  const [workingFilters, setWorkingFilters] = useState<FilterFields>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterFields>(defaultFilters)
  const [cars, setCars] = useState(initialCars)
  const [loading, setLoading] = useState(false)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('cars').select('*').order('created_at', { ascending: false }).limit(48)
    query = query.eq('is_for_rent', mode === 'rent')

    if (appliedFilters.location) {
      query = query.ilike('location', `%${appliedFilters.location}%`)
    }
    if (appliedFilters.make) {
      query = query.ilike('make', `%${appliedFilters.make}%`)
    }
    if (appliedFilters.model) {
      query = query.ilike('model', `%${appliedFilters.model}%`)
    }
    if (appliedFilters.year) {
      query = query.eq('year', Number(appliedFilters.year))
    }
    if (mode === 'rent' && appliedFilters.minPrice) {
      query = query.gte('price_per_day', Number(appliedFilters.minPrice))
    }
    if (mode === 'rent' && appliedFilters.maxPrice) {
      query = query.lte('price_per_day', Number(appliedFilters.maxPrice))
    }

    const { data } = await query
    setCars(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [mode, appliedFilters])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleApplyFilters = () => {
    setAppliedFilters(workingFilters)
  }

  const handleResetFilters = () => {
    setWorkingFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Cars</h1>
          <CarsToggle
            mode={mode}
            onChange={(value: 'rent' | 'buy') => setMode(value)}
          />
        </div>

        <CarsFilterBar
          filters={workingFilters}
          onChange={(field: keyof FilterFields, value: string) =>
            setWorkingFilters((prev: FilterFields) => ({ ...prev, [field]: value }))
          }
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              {loading ? 'Refreshing results...' : `${cars.length} cars shown`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cars.map((car) => (
              <CarCard key={car.id ?? car.slug} car={car} />
            ))}
          </div>
          {!loading && cars.length === 0 && (
            <p className="text-sm text-slate-500">No cars matched your filters yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
