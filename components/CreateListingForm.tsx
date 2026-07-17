"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateListingForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const brand = String(form.get('brand') || '').trim()
    const model = String(form.get('model') || '').trim()
    if (!brand || !model) {
      setMessage('Enter both the vehicle brand and model.')
      return
    }

    setSaving(true)
    try {
      const type = form.get('type') === 'buy' ? 'buy' : 'rent'
      const response = await fetch('/api/my-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          title: `${brand} ${model}`,
          type,
          price: String(form.get('price') || ''),
          location: String(form.get('location') || 'Kampala, Uganda'),
          body_type: String(form.get('body_type') || 'SUV'),
          description: String(form.get('description') || ''),
          status: 'active',
        }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not create the listing.')
        return
      }
      router.push('/host')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">New vehicle</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Create listing</h1><p className="mt-2 text-sm text-slate-500">You can add and arrange photos from the listing manager immediately after saving.</p></div>
      {message && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Brand<input name="brand" required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label><label className="text-sm font-bold text-slate-700">Model<input name="model" required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label><label className="text-sm font-bold text-slate-700">Listing type<select name="type" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"><option value="rent">For rent</option><option value="buy">For sale</option></select></label><label className="text-sm font-bold text-slate-700">Price (UGX)<input name="price" inputMode="numeric" type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label><label className="text-sm font-bold text-slate-700">Body type<select name="body_type" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"><option>SUV</option><option>Sedan</option><option>estate</option><option>coupe</option><option>pickup truck</option></select></label><label className="text-sm font-bold text-slate-700">Location<input name="location" defaultValue="Kampala, Uganda" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label></div>
      <label className="block text-sm font-bold text-slate-700">Description<textarea name="description" rows={5} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
      <div className="flex gap-3"><button disabled={saving} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60">{saving ? 'Creating…' : 'Create listing'}</button><button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button></div>
    </form>
  )
}
