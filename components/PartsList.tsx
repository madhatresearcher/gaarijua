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

export default function PartsList({ initialParts }: { initialParts: PartRecord[] }) {
  const [parts, setParts] = useState<PartRecord[]>(initialParts || [])
  const [q, setQ] = useState('')
  const mounted = useRef(false)

  useEffect(() => {
    setParts(initialParts || [])
  }, [initialParts])

  const fetchFiltered = async (search: string) => {
    try {
      let query = supabase.from('parts').select('*').order('created_at', { ascending: false }).limit(100)
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
    const channel = supabase.channel('public:parts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, (payload: { eventType: string, new: PartRecord, old: PartRecord }) => {
        const ev = payload.eventType
        const newRecord = payload.new
        const oldRecord = payload.old

        const matches = (rec: any) => {
          if (!rec) return false
          if (q && q.trim()) {
            const s = q.toLowerCase()
            const title = String(rec.title || '').toLowerCase()
            const cat = String(rec.category || '').toLowerCase()
            if (!title.includes(s) && !cat.includes(s)) return false
          }
          return true
        }

        setParts(prev => {
          if (ev === 'INSERT') {
            if (!matches(newRecord)) return prev
            return [newRecord, ...prev]
          }
          if (ev === 'UPDATE') {
            if (matches(newRecord)) return prev.map((p: PartRecord) => (p.id === newRecord.id ? newRecord : p))
            return prev.filter((p: PartRecord) => p.id !== newRecord.id)
          }
          if (ev === 'DELETE') return prev.filter((p: PartRecord) => p.id !== oldRecord.id)
          return prev
        })
      })
      .subscribe()

    return () => { try { supabase.removeChannel(channel) } catch (e) {} }
  }, [q])

  return (
    <div>
      <div className="mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search parts or category" className="border rounded px-3 py-2 w-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {parts.map(p => (
          <PartCard key={p.id} part={p} />
        ))}
      </div>
    </div>
  )
}
