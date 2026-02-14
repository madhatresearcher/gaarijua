"use client"

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase-client'
import { useSupabaseUser } from '../hooks/useSupabaseUser'

type ListingType = 'rent' | 'buy'
type ListingStatus = 'active' | 'closed' | 'draft'

type ManageFormShape = {
  title: string
  brand: string
  model: string
  year: string
  body_type: string
  location: string
  type: ListingType
  price: string
  description: string
  status: ListingStatus
}

type EditableListing = {
  id: string
  title: string
  brand: string | null
  model: string | null
  status: ListingStatus
  is_for_rent: boolean
  price_per_day: number | null
  price_buy: number | null
  body_type: string | null
  location: string | null
  description: string | null
}

const BODY_TYPE_OPTIONS = ['SUV', 'estate', 'Sedan', 'coupe', 'pickup truck']
const INITIAL_FORM: ManageFormShape = {
  title: '',
  brand: '',
  model: '',
  year: '',
  body_type: 'SUV',
  location: '',
  type: 'rent',
  price: '',
  description: '',
  status: 'active',
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  closed: 'Closed',
  draft: 'Draft',
}

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('-', Date.now().toString().slice(-4))

// Must match Supabase bucket name exactly (case- and character-sensitive).
const CAR_IMAGE_BUCKET = 'car_images'

export default function ManageAdsPanel() {
  const { user } = useSupabaseUser()
  const [form, setForm] = useState(INITIAL_FORM)
  const [listings, setListings] = useState<EditableListing[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [updates, setUpdates] = useState<Record<string, Partial<EditableListing> & { price?: string }>>({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadFilesToStorage = async () => {
    if (!selectedFiles.length || !user) return []
    const uploaded: string[] = []
    for (const file of selectedFiles) {
      const sanitizedFileName = file.name.replace(/[^a-z0-9.]/gi, '-')
      const filePath = `cars/${user.id}/${Date.now()}-${sanitizedFileName}`
      const { data, error } = await supabase.storage
        .from(CAR_IMAGE_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (error) {
        throw error
      }
      const { data: urlData } = supabase.storage.from(CAR_IMAGE_BUCKET).getPublicUrl(data.path)
      uploaded.push(urlData.publicUrl)
    }
    return uploaded
  }


  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) {
      setSelectedFiles([])
      return
    }
    setSelectedFiles(Array.from(files))
  }

  const fetchAds = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('cars')
      .select('id,title,brand,model,status,is_for_rent,price_per_day,price_buy,body_type,location,description')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setListings(Array.isArray(data) ? data : [])
  }, [user])

  useEffect(() => {
    void fetchAds()
  }, [fetchAds])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status !== 'closed'),
    [listings]
  )
  const closedListings = useMemo(
    () => listings.filter((listing) => listing.status === 'closed'),
    [listings]
  )

  const handleFormChange = (field: keyof ManageFormShape, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      setMessage('Sign in to create ads.')
      return
    }
    let uploadedImages: string[] = []
    try {
      if (selectedFiles.length) {
        setUploadingImages(true)
        uploadedImages = await uploadFilesToStorage()
      }
    } catch (error) {
      setUploadingImages(false)
      setMessage((error as Error).message || 'Failed to upload photos.')
      return
    } finally {
      setUploadingImages(false)
    }
    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? Number(form.year) : null,
      description: form.description.trim() || null,
      images: uploadedImages,
      slug: form.title ? generateSlug(form.title) : generateSlug('listing'),
      body_type: form.body_type,
      location: form.location || 'Kampala, Uganda',
      is_for_rent: form.type === 'rent',
      price_per_day: form.type === 'rent' ? Number(form.price) || null : null,
      price_buy: form.type === 'buy' ? Number(form.price) || null : null,
      status: form.status,
      owner_id: user.id,
    }

    setSaving(true)
    const { error } = await supabase.from('cars').insert(payload)
    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Listing created successfully!')
    setForm(INITIAL_FORM)
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    void fetchAds()
  }

  const handleListingUpdate = async (listing: EditableListing) => {
    if (!user) return
    const partial = updates[listing.id]
    if (!partial) {
      setMessage('No changes detected.')
      return
    }

    const updatesPayload: Record<string, any> = {}
    if (partial.description !== undefined) {
      updatesPayload.description = partial.description ? partial.description.trim() : null
    }
    if (partial.status && partial.status !== listing.status) {
      updatesPayload.status = partial.status
    }
    if (partial.price !== undefined) {
      const price = Number(partial.price)
      if (listing.is_for_rent) {
        updatesPayload.price_per_day = isNaN(price) ? null : price
      } else {
        updatesPayload.price_buy = isNaN(price) ? null : price
      }
    }

    if (Object.keys(updatesPayload).length === 0) {
      setMessage('No updates to save.')
      return
    }

    const { error } = await supabase.from('cars').update(updatesPayload).eq('id', listing.id)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Listing updated')
    setUpdates((prev) => {
      const copy = { ...prev }
      delete copy[listing.id]
      return copy
    })
    void fetchAds()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-lg font-semibold text-slate-700">Sign in to manage your ads.</p>
          <p className="text-sm text-slate-500 mt-2">
            Create, update, and archive listings for your vehicles from a single dashboard.
          </p>
          <Link href="/auth/sign-in" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">Ad Control</p>
              <h1 className="text-3xl font-semibold">Host dashboard</h1>
              <p className="mt-1 max-w-3xl text-sm text-amber-100/80">
                Create, refresh, and monitor your live inventory without leaving this corner of Gaarijua.
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-100/70">
                Owner ID: {user.id.slice(0, 8)}…
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-amber-200/40 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-amber-100">
                {activeListings.length} live ads
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-900 transition hover:bg-amber-300"
              >
                {showCreateForm ? 'Close form' : 'Create ad'}
              </button>
            </div>
          </div>
          {message && (
            <p className="mt-4 text-sm font-semibold text-amber-100">{message}</p>
          )}
          {showCreateForm && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <form className="space-y-4 text-slate-900" onSubmit={handleCreateListing}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Title</span>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => handleFormChange('title', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Type</span>
                    <select
                      value={form.type}
                      onChange={(event) => handleFormChange('type', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none"
                    >
                      <option value="rent">Rent</option>
                      <option value="buy">Sell</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Brand</span>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(event) => handleFormChange('brand', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Model</span>
                    <input
                      type="text"
                      value={form.model}
                      onChange={(event) => handleFormChange('model', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Year</span>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(event) => handleFormChange('year', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Body type</span>
                    <select
                      value={form.body_type}
                      onChange={(event) => handleFormChange('body_type', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none"
                    >
                      {BODY_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Location</span>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => handleFormChange('location', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      {form.type === 'rent' ? 'Price / day (UGX)' : 'Sale price (UGX)'}
                    </span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(event) => handleFormChange('price', event.target.value)}
                      min="0"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Upload photos</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelection}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Description</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => handleFormChange('description', event.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                    ></textarea>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => handleFormChange('status', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Create listing'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Active ads</p>
              <h2 className="text-2xl font-semibold text-slate-900">Edit & refresh</h2>
            </div>
            {!loading && activeListings.length === 0 && (
              <p className="text-sm text-slate-500">You have no live listings yet.</p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {loading && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
                Loading your listings…
              </div>
            )}
            {!loading && activeListings.length > 0 &&
              activeListings.map((listing) => {
                const pending = updates[listing.id] || {}
                const priceValue = pending.price ?? (listing.is_for_rent ? listing.price_per_day?.toString() : listing.price_buy?.toString())
                return (
                  <article key={listing.id} className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{STATUS_LABELS[listing.status]}</span>
                    </div>
                    <p className="text-sm text-slate-500">{listing.brand} · {listing.model} · {listing.body_type}</p>
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</label>
                      <select
                        value={pending.status ?? listing.status}
                        onChange={(event) =>
                          setUpdates((prev) => ({
                            ...prev,
                            [listing.id]: { ...prev[listing.id], status: event.target.value as ListingStatus },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Price (UGX)</label>
                      <input
                        type="number"
                        value={priceValue ?? ''}
                        onChange={(event) =>
                          setUpdates((prev) => ({
                            ...prev,
                            [listing.id]: { ...prev[listing.id], price: event.target.value },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Description</label>
                      <textarea
                        rows={2}
                        value={pending.description ?? listing.description ?? ''}
                        onChange={(event) =>
                          setUpdates((prev) => ({
                            ...prev,
                            [listing.id]: { ...prev[listing.id], description: event.target.value },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                      ></textarea>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void handleListingUpdate(listing)}
                        className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                      >
                        Save changes
                      </button>
                      <span className="text-xs text-slate-500">{listing.location}</span>
                    </div>
                  </article>
                )
              })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sold / closed ads</p>
              <h2 className="text-2xl font-semibold text-slate-900">Track closed inventory</h2>
            </div>
            <p className="text-sm text-slate-500">{closedListings.length} archived</p>
          </div>
          <div className="mt-4 space-y-3">
            {closedListings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/90 p-6 text-sm text-slate-500">
                Closed ads will appear here once you mark a listing as sold.
              </div>
            )}
            {closedListings.map((listing) => (
              <article key={listing.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{listing.brand} · {listing.model}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{listing.location}</p>
                  <p>{listing.is_for_rent ? 'Rental hold' : 'Sold'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
