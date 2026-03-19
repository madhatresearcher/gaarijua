"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase-client'
import { isListingPubliclyVisible } from '../lib/listing-visibility'
import CarCard from './CarCard'

function debounce(fn: (...args: any[]) => void, wait = 300) {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

interface CarRecord {
  id?: string
  slug?: string
  title?: string
  location?: string
  status?: string
  closed_at?: string
  updated_at?: string
  images?: string[]
  is_for_rent?: boolean
  price_per_day?: number
  price_buy?: number
  description?: string
  year?: number
  [key: string]: any
}

const CAR_LIST_SELECT =
  'id,slug,title,make,brand,model,location,status,closed_at,updated_at,is_for_rent,price_per_day,price_buy,images,rating,thumbnail'

export default function CarsList({ initialCars }: { initialCars: CarRecord[] }) {
  const [cars, setCars] = useState<CarRecord[]>((initialCars || []).filter((car) => isListingPubliclyVisible(car)))
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>('all')
  const mounted = useRef(false)
  const qRef = useRef('')
  const filterRef = useRef<'all' | 'rent' | 'sale'>('all')

  useEffect(() => {
    setCars((initialCars || []).filter((car) => isListingPubliclyVisible(car)))
  }, [initialCars])

  useEffect(() => {
    qRef.current = q
  }, [q])

  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  // Fetch function used for queries
  const fetchFiltered = async (search: string, flt: string) => {
    try {
      let query = supabase
        .from('cars')
        .select(CAR_LIST_SELECT)
        .in('status', ['active', 'closed'])
        .order('created_at', { ascending: false })
        .limit(120)
      if (search && search.trim()) {
        const s = search.replace(/'/g, "''")
        query = query.or(`title.ilike.%${s}%,location.ilike.%${s}%`)
      }
      if (flt === 'rent') query = query.eq('is_for_rent', true)
      if (flt === 'sale') query = query.eq('is_for_rent', false)
      const { data, error } = await query
      if (error) {
        console.error('cars fetch error', error)
        return
      }
      const nextCars = Array.isArray(data) ? data.filter((car) => isListingPubliclyVisible(car)).slice(0, 100) : []
      setCars(nextCars)
    } catch (err) {
      console.error('fetchFiltered exception', err)
    }
  }

  // Debounced version
  const debouncedFetch = useRef(debounce(fetchFiltered, 300)).current

  useEffect(() => {
    // avoid calling on first mount because server provided initialCars
    if (!mounted.current) {
      mounted.current = true
      return
    }
    debouncedFetch(q, filter)
  }, [q, filter, debouncedFetch])

  useEffect(() => {
    const matches = (rec: CarRecord) => {
      if (!rec) return false
      const activeSearch = qRef.current.trim().toLowerCase()
      if (activeSearch) {
        const title = String(rec.title || '').toLowerCase()
        const loc = String(rec.location || '').toLowerCase()
        if (!title.includes(activeSearch) && !loc.includes(activeSearch)) return false
      }
      const activeFilter = filterRef.current
      if (activeFilter === 'rent' && !rec.is_for_rent) return false
      if (activeFilter === 'sale' && rec.is_for_rent) return false
      return true
    }

    const applyRealtimeChange = (eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: CarRecord, oldRecord: CarRecord) => {
      setCars((prev) => {
        if (eventType === 'INSERT') {
          if (!matches(newRecord) || !isListingPubliclyVisible(newRecord)) return prev
          const next = [newRecord, ...prev.filter((entry) => entry.id !== newRecord.id)]
          return next.slice(0, 100)
        }

        if (eventType === 'UPDATE') {
          if (matches(newRecord) && isListingPubliclyVisible(newRecord)) {
            return prev.map((entry) => (entry.id === newRecord.id ? newRecord : entry))
          }
          return prev.filter((entry) => entry.id !== newRecord.id)
        }

        return prev.filter((entry) => entry.id !== oldRecord.id)
      })
    }

    // Keep one subscription instance to avoid reconnect churn while users type/filter.
    const channel = supabase
      .channel('cars-list-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cars' }, (payload: { new: CarRecord; old: CarRecord }) => {
        applyRealtimeChange('INSERT', payload.new, payload.old)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cars' }, (payload: { new: CarRecord; old: CarRecord }) => {
        applyRealtimeChange('UPDATE', payload.new, payload.old)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cars' }, (payload: { new: CarRecord; old: CarRecord }) => {
        applyRealtimeChange('DELETE', payload.new, payload.old)
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch (e) { /* ignore */ }
    }
  }, [])

  return (
    <div>
      <div className="mb-4 flex gap-3 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search title or location"
          className="border rounded px-3 py-2 flex-1"
        />
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">All</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <CarCard key={car.id || car.slug} car={car} />
        ))}
      </div>
    </div>
  )
}
