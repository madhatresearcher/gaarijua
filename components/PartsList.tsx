"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase-client'
import PartCard from './PartCard'

interface PartRecord {
  id?: string
  slug?: string
  title?: string
  category?: string
  brand?: string
  price?: number
  images?: string[]
  compatible_models?: string[]
  sku?: string
  description?: string
  [key: string]: any
}

const PART_LIST_SELECT = 'id,slug,title,seller,category,images,thumbnail,price,price_formatted'

export default function PartsList({ initialParts }: { initialParts: PartRecord[] }) {
  const [parts, setParts] = useState<PartRecord[]>(initialParts || [])
  const [q, setQ] = useState('')
  const mounted = useRef(false)
  const qRef = useRef('')

  useEffect(() => {
    setParts(initialParts || [])
  }, [initialParts])

  useEffect(() => {
    qRef.current = q
  }, [q])

  const fetchFiltered = async (search: string) => {
    try {
      let query = supabase.from('parts').select(PART_LIST_SELECT).order('created_at', { ascending: false }).limit(100)
      if (search && search.trim()) {
        const s = search.replace(/'/g, "''")
        query = query.or(`title.ilike.%${s}%,category.ilike.%${s}%`)
      }
      const { data, error } = await query
      if (error) {
        console.error('parts fetch error', error)
        return
      }
      setParts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('fetchFiltered exception', err)
    }
  }

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    const t = setTimeout(() => fetchFiltered(q), 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const matches = (rec: PartRecord) => {
      if (!rec) return false
      const activeSearch = qRef.current.trim().toLowerCase()
      if (!activeSearch) return true
      const title = String(rec.title || '').toLowerCase()
      const category = String(rec.category || '').toLowerCase()
      return title.includes(activeSearch) || category.includes(activeSearch)
    }

    const applyRealtimeChange = (eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: PartRecord, oldRecord: PartRecord) => {
      setParts((prev) => {
        if (eventType === 'INSERT') {
          if (!matches(newRecord)) return prev
          const next = [newRecord, ...prev.filter((entry) => entry.id !== newRecord.id)]
          return next.slice(0, 100)
        }
        if (eventType === 'UPDATE') {
          if (matches(newRecord)) return prev.map((entry) => (entry.id === newRecord.id ? newRecord : entry))
          return prev.filter((entry) => entry.id !== newRecord.id)
        }
        return prev.filter((entry) => entry.id !== oldRecord.id)
      })
    }

    // Keep one subscription instance to avoid reconnect churn while users type.
    const channel = supabase
      .channel('parts-list-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parts' }, (payload: { new: PartRecord; old: PartRecord }) => {
        applyRealtimeChange('INSERT', payload.new, payload.old)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parts' }, (payload: { new: PartRecord; old: PartRecord }) => {
        applyRealtimeChange('UPDATE', payload.new, payload.old)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'parts' }, (payload: { new: PartRecord; old: PartRecord }) => {
        applyRealtimeChange('DELETE', payload.new, payload.old)
      })
      .subscribe()

    return () => { try { supabase.removeChannel(channel) } catch (e) {} }
  }, [])

  return (
    <div>
      <div className="mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search parts or category" className="border rounded px-3 py-2 w-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {parts.map(p => (
          <PartCard key={p.id || p.slug} part={p} />
        ))}
      </div>
    </div>
  )
}
