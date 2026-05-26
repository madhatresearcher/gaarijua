"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import { isListingPubliclyVisible } from '../lib/listing-visibility'
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
  const [cars, setCars] = useState(() => initialCars.filter((car) => isListingPubliclyVisible(car)))
  const [loading, setLoading] = useState(false)
  const shouldSkipInitialFetch = useRef(initialCars.length > 0)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ mode })
      if (appliedFilters.location) params.set('location', appliedFilters.location)
      if (appliedFilters.make) params.set('make', appliedFilters.make)
      if (appliedFilters.model) params.set('model', appliedFilters.model)
      if (appliedFilters.year) params.set('year', appliedFilters.year)
      if (mode === 'rent' && appliedFilters.minPrice) params.set('minPrice', appliedFilters.minPrice)
      if (mode === 'rent' && appliedFilters.maxPrice) params.set('maxPrice', appliedFilters.maxPrice)

      const response = await fetch(`/api/cars?${params.toString()}`)
      if (!response.ok) {
        console.error('CarsExplorer fetch failed:', response.status)
        setCars([])
        return
      }
      const body = await response.json()
      const data = Array.isArray(body?.cars) ? body.cars : []
      const nextCars = data.filter((car: any) => isListingPubliclyVisible(car)).slice(0, 48)
      setCars(nextCars)
    } catch (error) {
      console.error('CarsExplorer fetch failed:', (error as Error).message)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [mode, appliedFilters])

  useEffect(() => {
    if (shouldSkipInitialFetch.current) {
      shouldSkipInitialFetch.current = false
      const defaultFiltersApplied = Object.values(appliedFilters).every((value) => !value)
      if (mode === 'rent' && defaultFiltersApplied) {
        return
      }
    }
    void fetchCars()
  }, [appliedFilters, fetchCars, mode])

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
