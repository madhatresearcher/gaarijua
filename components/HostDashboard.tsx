"use client"

import { useCallback, useEffect, useState } from 'react'
import type { HostListingSummary } from '../lib/host-listings'
import { listingImageUrl } from '../lib/listing-image-url'
import ManageAdsPanel from './ManageAdsPanel'

type ListingStatus = 'active' | 'closed' | 'draft'
type ListingDetail = HostListingSummary & { description: string | null; images: string[] }
type ListingPage = { listings: HostListingSummary[]; nextCursor: string | null; total: number }

const MAX_IMAGES = 15
const STATUS_LABELS: Record<ListingStatus, string> = { active: 'Active', closed: 'Closed', draft: 'Draft' }

function formatPrice(value: number | null) {
  return value === null ? 'Price on request' : `UGX ${Math.round(value).toLocaleString()}`
}

function listingPrice(listing: HostListingSummary) {
  return formatPrice(listing.is_for_rent ? listing.price_per_day : listing.price_buy)
}

function isImageFile(file: File) {
  return /^image\/(avif|heic|heif|jpeg|jpg|png|webp)$/i.test(file.type) || /\.(avif|heic|heif|jpe?g|png|webp)$/i.test(file.name)
}

export default function HostDashboard({
  initialListings,
  initialNextCursor,
  initialOpenCount,
}: {
  initialListings: HostListingSummary[]
  initialNextCursor: string | null
  initialOpenCount: number
}) {
  const [scope, setScope] = useState<'open' | 'closed'>('open')
  const [listings, setListings] = useState(initialListings)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [total, setTotal] = useState(initialOpenCount)
  const [loadingPage, setLoadingPage] = useState(false)
  const [detail, setDetail] = useState<ListingDetail | null>(null)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showBatchCreator, setShowBatchCreator] = useState(false)
  const [initialDraftCount, setInitialDraftCount] = useState(1)

  const loadPage = useCallback(async (nextScope: 'open' | 'closed', cursor?: string | null, append = false) => {
    setLoadingPage(true)
    try {
      const params = new URLSearchParams({ limit: '12' })
      if (nextScope === 'closed') params.set('status', 'closed')
      if (cursor) params.set('cursor', cursor)
      const response = await fetch(`/api/my-listings?${params}`)
      const body = (await response.json().catch(() => null)) as ListingPage | { error?: string } | null
      if (!response.ok || !body || !('listings' in body)) {
        const error = body && 'error' in body && typeof body.error === 'string' ? body.error : null
        setMessage(error || 'Could not load your listings.')
        return
      }
      setListings((current) => (append ? [...current, ...body.listings] : body.listings))
      setNextCursor(body.nextCursor)
      setTotal(body.total)
    } finally {
      setLoadingPage(false)
    }
  }, [])

  const changeScope = (nextScope: 'open' | 'closed') => {
    if (nextScope === scope) return
    setScope(nextScope)
    setDetail(null)
    void loadPage(nextScope)
  }

  const openManager = async (id: string) => {
    setLoadingDetailId(id)
    try {
      const response = await fetch(`/api/my-listings/${id}`)
      const body = await response.json().catch(() => null)
      if (!response.ok || !body?.listing) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not load this listing.')
        return
      }
      setDetail(body.listing as ListingDetail)
    } finally {
      setLoadingDetailId(null)
    }
  }

  const saveDetail = async (updates: Record<string, unknown>) => {
    if (!detail) return false
    setSaving(true)
    try {
      const response = await fetch('/api/my-listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detail.id, is_for_rent: detail.is_for_rent, ...updates }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok || !body?.listing) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not save changes.')
        return false
      }
      setDetail(body.listing as ListingDetail)
      setMessage('Listing saved.')
      void loadPage(scope)
      return true
    } finally {
      setSaving(false)
    }
  }

  const uploadPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!detail) return
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    if (files.some((file) => !isImageFile(file))) {
      setMessage('Use JPG, PNG, WEBP, AVIF, HEIC, or HEIF images.')
      return
    }
    if (files.some((file) => file.size > 15 * 1024 * 1024)) {
      setMessage('Each photo must be 15MB or smaller.')
      return
    }
    if (detail.images.length + files.length > MAX_IMAGES) {
      setMessage(`A listing can have up to ${MAX_IMAGES} photos.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      const response = await fetch('/api/listing-images', { method: 'POST', body: formData })
      const body = await response.json().catch(() => null)
      if (!response.ok || !Array.isArray(body?.images)) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not upload photos.')
        return
      }
      const uploaded = body.images.map((image: { publicUrl: string }) => image.publicUrl)
      const saved = await saveDetail({ images: [...detail.images, ...uploaded] })
      if (!saved) {
        await fetch('/api/listing-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: body.images.map((image: { path: string }) => image.path) }),
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const deleteListing = async (listing: HostListingSummary) => {
    if (!window.confirm(`Permanently delete ${listing.title}? This cannot be undone.`)) return
    const response = await fetch('/api/my-listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: listing.id }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(typeof body?.error === 'string' ? body.error : 'Could not delete this listing.')
      return
    }
    setListings((current) => current.filter((entry) => entry.id !== listing.id))
    setTotal((current) => Math.max(0, current - 1))
    if (detail?.id === listing.id) setDetail(null)
    setMessage('Listing permanently deleted.')
  }

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/80">Ad control</p>
              <h1 className="mt-1 text-3xl font-semibold">Host dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">Manage your inventory without loading every gallery at once.</p>
            </div>
            <div className="rounded-full border border-amber-200/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
              {total} {scope === 'open' ? 'live ads' : 'archived ads'}
            </div>
          </div>
          {message && <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm text-amber-50">{message}</p>}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button type="button" onClick={() => changeScope('open')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === 'open' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Live & drafts</button>
            <button type="button" onClick={() => changeScope('closed')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === 'closed' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Archived</button>
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setInitialDraftCount(1); setShowBatchCreator(true) }} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Create one listing</button><button type="button" onClick={() => { setInitialDraftCount(2); setShowBatchCreator(true) }} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">Create multiple listings</button></div>
        </div>

        {showBatchCreator && (
          <ManageAdsPanel
            key={initialDraftCount}
            embedded
            initiallyShowCreateForm
            initialDraftCount={initialDraftCount}
            onClose={() => setShowBatchCreator(false)}
            onListingsCreated={() => {
              setShowBatchCreator(false)
              setScope('open')
              void loadPage('open')
            }}
          />
        )}

        <section aria-busy={loadingPage} className="grid gap-4 md:grid-cols-2">
          {listings.map((listing, index) => {
            const cover = listingImageUrl(listing.cover_image, 'card')
            return (
              <article key={listing.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-100">
                  {cover ? <img src={cover} alt="" width={640} height={480} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo yet</div>}
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="text-lg font-bold text-slate-900">{listing.title}</h2><p className="mt-1 text-sm text-slate-500">{listing.body_type || 'Vehicle'} · {listing.location || 'Location not set'}</p></div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{STATUS_LABELS[listing.status as ListingStatus] || listing.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-900">{listingPrice(listing)}</span><span className="text-slate-500">{listing.image_count} {listing.image_count === 1 ? 'photo' : 'photos'}</span></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => listing.id && void openManager(listing.id)} disabled={!listing.id || loadingDetailId === listing.id} className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{loadingDetailId === listing.id ? 'Opening…' : `Manage listing${listing.image_count ? ' & photos' : ''}`}</button>
                    <button type="button" onClick={() => void deleteListing(listing)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50" aria-label={`Delete ${listing.title}`}>Delete</button>
                  </div>
                </div>
              </article>
            )
          })}
          {!loadingPage && listings.length === 0 && <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No {scope === 'open' ? 'live' : 'archived'} listings yet.</div>}
        </section>

        {nextCursor && <div className="flex justify-center"><button type="button" disabled={loadingPage} onClick={() => void loadPage(scope, nextCursor, true)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">{loadingPage ? 'Loading…' : 'Load more listings'}</button></div>}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label={`Manage ${detail.title}`}>
          <div className="mx-auto my-8 max-w-4xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Listing manager</p><h2 className="text-2xl font-bold text-slate-900">{detail.title}</h2></div><button type="button" onClick={() => setDetail(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Close</button></div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Photos ({detail.images.length}/{MAX_IMAGES})</h3><label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white">{uploading ? 'Uploading…' : 'Add photos'}<input type="file" className="sr-only" multiple accept="image/*,.avif,.heic,.heif" disabled={uploading || saving} onChange={(event) => void uploadPhotos(event)} /></label></div><p className="mt-2 text-sm text-slate-500">The first photo is used as the card cover. Choose “Set cover” to reorder it.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{detail.images.map((image, imageIndex) => <div key={image} className="overflow-hidden rounded-2xl border border-slate-200"><img src={listingImageUrl(image, 'thumb') || image} alt={`${detail.title} photo ${imageIndex + 1}`} width={256} height={256} loading="lazy" decoding="async" className="aspect-square w-full object-cover" /><div className="grid grid-cols-2 gap-1 p-2"><button type="button" disabled={saving || imageIndex === 0} onClick={() => void saveDetail({ images: [image, ...detail.images.filter((current) => current !== image)] })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 disabled:opacity-40">Set cover</button><button type="button" disabled={saving} onClick={() => void saveDetail({ images: detail.images.filter((current) => current !== image) })} className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700">Remove</button></div></div>)}</div></section>
              <section className="space-y-4"><label className="block text-sm font-bold text-slate-700">Status<select value={detail.status} onChange={(event) => setDetail({ ...detail, status: event.target.value as ListingStatus })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"><option value="active">Active</option><option value="draft">Draft</option><option value="closed">Closed</option></select></label><label className="block text-sm font-bold text-slate-700">Price (UGX)<input type="number" inputMode="numeric" value={detail.is_for_rent ? detail.price_per_day ?? '' : detail.price_buy ?? ''} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setDetail(detail.is_for_rent ? { ...detail, price_per_day: value } : { ...detail, price_buy: value }) }} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-bold text-slate-700">Description<textarea rows={6} value={detail.description || ''} onChange={(event) => setDetail({ ...detail, description: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label><button type="button" disabled={saving} onClick={() => void saveDetail({ status: detail.status, price: detail.is_for_rent ? detail.price_per_day : detail.price_buy, description: detail.description })} className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60">{saving ? 'Saving…' : 'Save listing changes'}</button></section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
