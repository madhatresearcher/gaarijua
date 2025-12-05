"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase-client'
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
  images?: string[]
  is_for_rent?: boolean
  price_per_day?: number
  price_buy?: number
  description?: string
  year?: number
  [key: string]: any
}

export default function CarsList({ initialCars }: { initialCars: CarRecord[] }) {
  const [cars, setCars] = useState<CarRecord[]>(initialCars || [])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>('all')
  const mounted = useRef(false)

  useEffect(() => {
    setCars(initialCars || [])
  }, [initialCars])

  // Fetch function used for queries
  const fetchFiltered = async (search: string, flt: string) => {
    try {
      let query = supabase.from('cars').select('*').order('created_at', { ascending: false }).limit(100)
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
      setCars(Array.isArray(data) ? data : [])
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
    // Subscribe to realtime changes on the `cars` table
    const channel = supabase.channel('public:cars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, (payload: { eventType: string, new: CarRecord, old: CarRecord }) => {
        const ev = payload.eventType
        const newRecord = payload.new
        const oldRecord = payload.old

        const matches = (rec: any) => {
          if (!rec) return false
          if (q && q.trim()) {
            const s = q.toLowerCase()
            const title = String(rec.title || '').toLowerCase()
            const loc = String(rec.location || '').toLowerCase()
            if (!title.includes(s) && !loc.includes(s)) return false
          }
          if (filter === 'rent' && !rec.is_for_rent) return false
          if (filter === 'sale' && rec.is_for_rent) return false
          return true
        }

        setCars(prev => {
          if (ev === 'INSERT') {
            if (!matches(newRecord)) return prev
            return [newRecord, ...prev]
          }
          if (ev === 'UPDATE') {
            // if updated record matches, replace; if no longer matches, remove
            if (matches(newRecord)) return prev.map((r: CarRecord) => (r.id === newRecord.id ? newRecord : r))
            return prev.filter((r: CarRecord) => r.id !== newRecord.id)
          }
          if (ev === 'DELETE') {
            return prev.filter((r: CarRecord) => r.id !== oldRecord.id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch (e) { /* ignore */ }
    }
  }, [q, filter])

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
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  )
}
