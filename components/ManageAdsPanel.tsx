"use client"

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '../hooks/useUser'

type ListingType = 'rent' | 'buy'
type ListingStatus = 'active' | 'closed' | 'draft'

type ManageFormShape = {
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

type ListingDraft = ManageFormShape & {
  id: string
  files: File[]
  imagePreviews: string[]
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

type UploadedImage = {
  path: string
  publicUrl: string
}

const MAX_UPLOAD_FILES = 8
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024
const ALLOWED_IMAGE_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
}
const ALLOWED_IMAGE_EXTENSIONS = new Set(Object.values(ALLOWED_IMAGE_MIME))

const BODY_TYPE_OPTIONS = ['SUV', 'estate', 'Sedan', 'coupe', 'pickup truck']
const INITIAL_FORM: ManageFormShape = {
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

function createEmptyDraft(id: string): ListingDraft {
  return {
    ...INITIAL_FORM,
    id,
    files: [],
    imagePreviews: [],
  }
}

function getSupportedImageExtension(file: File) {
  const mimeExtension = ALLOWED_IMAGE_MIME[file.type.toLowerCase()]
  if (mimeExtension) return mimeExtension

  const filenameExtension = file.name.split('.').pop()?.toLowerCase()
  if (filenameExtension && ALLOWED_IMAGE_EXTENSIONS.has(filenameExtension)) {
    return filenameExtension
  }

  return null
}

function priceDigits(value: string | number | null | undefined) {
  return (value ?? '').toString().split('.')[0].replace(/\D/g, '')
}

function formatPrice(value: string | number | null | undefined) {
  const digits = priceDigits(value)
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
}

function buildDraftTitle(draft: Pick<ListingDraft, 'brand' | 'model'>) {
  return [draft.brand.trim(), draft.model.trim()].filter(Boolean).join(' ')
}

function isDraftFilled(draft: ListingDraft) {
  return (
    draft.brand.trim().length > 0 ||
    draft.model.trim().length > 0 ||
    draft.year.trim().length > 0 ||
    draft.location.trim().length > 0 ||
    draft.price.trim().length > 0 ||
    draft.description.trim().length > 0 ||
    draft.files.length > 0
  )
}

function getDraftValidationError(draft: ListingDraft) {
  if (!isDraftFilled(draft)) return null
  if (!draft.brand.trim() || !draft.model.trim()) {
    return 'Enter both brand and model.'
  }

  if (draft.year.trim()) {
    const year = Number(draft.year)
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return 'Enter a valid vehicle year.'
    }
  }

  if (draft.price.trim() && Number.isNaN(Number(draft.price))) {
    return 'Enter a valid price.'
  }

  return null
}

export default function ManageAdsPanel() {
  const { user } = useUser()
  const draftSequenceRef = useRef(2)
  const previewUrlsRef = useRef<Map<string, string[]>>(new Map())

  const [drafts, setDrafts] = useState<ListingDraft[]>(() => [createEmptyDraft('draft-1')])
  const [listings, setListings] = useState<EditableListing[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [updates, setUpdates] = useState<Record<string, Partial<EditableListing> & { price?: string }>>({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const validateSelectedFiles = (files: File[]) => {
    if (files.length > MAX_UPLOAD_FILES) {
      return `You can upload up to ${MAX_UPLOAD_FILES} images per listing.`
    }
    for (const file of files) {
      if (!getSupportedImageExtension(file)) {
        return `${file.name}: unsupported format. Use JPG, PNG, WEBP, AVIF, HEIC, or HEIF.`
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `${file.name}: exceeds 12MB size limit.`
      }
    }
    return null
  }

  const cleanupUploadedFiles = async (paths: string[]) => {
    if (!paths.length) return
    const response = await fetch('/api/listing-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    })

    if (!response.ok) {
      let nextMessage = 'Failed to cleanup uploaded files.'
      try {
        const body = await response.json()
        if (typeof body?.error === 'string') nextMessage = body.error
      } catch {}
      console.error(nextMessage)
    }
  }

  const uploadFilesToStorage = async (files: File[]): Promise<UploadedImage[]> => {
    if (!files.length) return []

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await fetch('/api/listing-images', {
      method: 'POST',
      body: formData,
    })

    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to upload photos.')
    }

    return Array.isArray(body?.images) ? body.images : []
  }

  const fetchAds = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/my-listings')
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Failed to load your listings.')
        return
      }
      setListings(Array.isArray(body?.listings) ? body.listings : [])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchAds()
  }, [fetchAds])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      for (const urls of previewUrls.values()) {
        urls.forEach((url) => URL.revokeObjectURL(url))
      }
      previewUrls.clear()
    }
  }, [])

  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status !== 'closed'),
    [listings]
  )
  const closedListings = useMemo(
    () => listings.filter((listing) => listing.status === 'closed'),
    [listings]
  )

  const nextDraftId = () => `draft-${draftSequenceRef.current++}`

  const handleDraftChange = (draftId: string, field: keyof ManageFormShape, value: string) => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === draftId ? { ...draft, [field]: value } : draft))
    )
  }

  const updateDraftFiles = (draftId: string, files: File[]) => {
    const existingUrls = previewUrlsRef.current.get(draftId) || []
    existingUrls.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.delete(draftId)

    const previews = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 4)
      .map((file) => URL.createObjectURL(file))

    if (previews.length) {
      previewUrlsRef.current.set(draftId, previews)
    }

    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === draftId ? { ...draft, files, imagePreviews: previews } : draft
      )
    )
  }

  const removeDraftFile = (draftId: string, fileIndex: number) => {
    const draft = drafts.find((entry) => entry.id === draftId)
    if (!draft) return
    updateDraftFiles(
      draftId,
      draft.files.filter((_file, index) => index !== fileIndex)
    )
  }

  const handleFileSelection = (draftId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) {
      updateDraftFiles(draftId, [])
      return
    }

    const nextFiles = Array.from(files)
    const validationError = validateSelectedFiles(nextFiles)
    if (validationError) {
      setMessage(validationError)
      updateDraftFiles(draftId, [])
      event.target.value = ''
      return
    }

    updateDraftFiles(draftId, nextFiles)
  }

  const addDraft = () => {
    setDrafts((currentDrafts) => [...currentDrafts, createEmptyDraft(nextDraftId())])
  }

  const duplicateDraft = (draftId: string) => {
    setDrafts((currentDrafts) => {
      const source = currentDrafts.find((draft) => draft.id === draftId)
      if (!source) return currentDrafts
      return [
        ...currentDrafts,
        {
          ...source,
          id: nextDraftId(),
          files: [],
          imagePreviews: [],
        },
      ]
    })
  }

  const removeDraft = (draftId: string) => {
    const existingUrls = previewUrlsRef.current.get(draftId) || []
    existingUrls.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.delete(draftId)

    setDrafts((currentDrafts) => {
      if (currentDrafts.length === 1) {
        return [createEmptyDraft(nextDraftId())]
      }
      return currentDrafts.filter((draft) => draft.id !== draftId)
    })
  }

  const resetDrafts = () => {
    for (const urls of previewUrlsRef.current.values()) {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
    previewUrlsRef.current.clear()
    setDrafts([createEmptyDraft(nextDraftId())])
  }

  const handleCreateListings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      setMessage('Sign in to create ads.')
      return
    }

    const filledDraftEntries = drafts
      .map((draft, index) => ({ draft, index }))
      .filter(({ draft }) => isDraftFilled(draft))

    if (filledDraftEntries.length === 0) {
      setMessage('Add at least one listing before creating.')
      return
    }

    const invalidEntries = filledDraftEntries.filter(({ draft }) => getDraftValidationError(draft) !== null)
    if (invalidEntries.length > 0) {
      setMessage(`Complete the required fields for listing ${invalidEntries.map(({ index }) => index + 1).join(', ')}.`)
      return
    }

    const fileValidationError = filledDraftEntries
      .map(({ draft, index }) => ({ error: validateSelectedFiles(draft.files), index }))
      .find((entry) => entry.error)
    if (fileValidationError?.error) {
      setMessage(`Listing ${fileValidationError.index + 1}: ${fileValidationError.error}`)
      return
    }

    setSaving(true)
    const uploadedByDraftId = new Map<string, UploadedImage[]>()
    const uploadedPaths: string[] = []

    try {
      const draftsWithImages = filledDraftEntries.filter(({ draft }) => draft.files.length > 0)
      if (draftsWithImages.length) setUploadingImages(true)

      for (const { draft } of draftsWithImages) {
        const uploadedImages = await uploadFilesToStorage(draft.files)
        uploadedByDraftId.set(draft.id, uploadedImages)
        uploadedPaths.push(...uploadedImages.map((image) => image.path))
      }

      setUploadingImages(false)

      const response = await fetch('/api/my-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listings: filledDraftEntries.map(({ draft }) => {
            const uploadedImages = uploadedByDraftId.get(draft.id) || []
            return {
              clientRequestId: draft.id,
              brand: draft.brand.trim() || null,
              model: draft.model.trim() || null,
              year: draft.year ? Number(draft.year) : null,
              description: draft.description.trim() || null,
              images: uploadedImages.map((image) => image.publicUrl),
              title: buildDraftTitle(draft),
              body_type: draft.body_type,
              location: draft.location || 'Kampala, Uganda',
              type: draft.type,
              price: draft.price,
              status: draft.status,
            }
          }),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        await cleanupUploadedFiles(uploadedPaths)
        setMessage(typeof body?.error === 'string' ? body.error : 'Failed to create listings.')
        return
      }

      setMessage(`Created ${filledDraftEntries.length} listing${filledDraftEntries.length === 1 ? '' : 's'} successfully!`)
      resetDrafts()
      void fetchAds()
    } catch (error) {
      await cleanupUploadedFiles(uploadedPaths)
      setMessage((error as Error).message || 'Failed to create listings.')
    } finally {
      setUploadingImages(false)
      setSaving(false)
    }
  }

  const handleListingUpdate = async (listing: EditableListing) => {
    if (!user) return
    const partial = updates[listing.id]
    if (!partial) {
      setMessage('No changes detected.')
      return
    }

    const payload: Record<string, unknown> = { id: listing.id, is_for_rent: listing.is_for_rent }
    let hasChange = false
    if (partial.description !== undefined) {
      payload.description = partial.description ? partial.description.trim() : null
      hasChange = true
    }
    if (partial.status && partial.status !== listing.status) {
      payload.status = partial.status
      hasChange = true
    }
    if (partial.price !== undefined) {
      payload.price = partial.price
      hasChange = true
    }

    if (!hasChange) {
      setMessage('No updates to save.')
      return
    }

    const response = await fetch('/api/my-listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setMessage(typeof body?.error === 'string' ? body.error : 'Failed to update listing.')
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
                Owner ID: {user.id.slice(0, 8)}...
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
                {showCreateForm ? 'Close form' : 'Create ads'}
              </button>
            </div>
          </div>
          {message && (
            <p className="mt-4 text-sm font-semibold text-amber-100">{message}</p>
          )}
          {showCreateForm && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <form className="space-y-4 text-slate-900" onSubmit={handleCreateListings}>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Batch listing entry</p>
                  <p className="text-sm text-slate-500">
                    Add one or more vehicles, attach photos to each listing, then create them in one submission.
                  </p>
                </div>

                {drafts.map((draft, index) => (
                  <div key={draft.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Listing {index + 1}</p>
                        <p className="text-xs text-slate-500">Each block creates one vehicle ad.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => duplicateDraft(draft.id)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDraft(draft.id)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Generated title</p>
                        <p className="mt-1 min-h-5 text-sm font-semibold text-slate-900">
                          {buildDraftTitle(draft) || 'Brand and model'}
                        </p>
                      </div>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Type</span>
                        <select
                          value={draft.type}
                          onChange={(event) => handleDraftChange(draft.id, 'type', event.target.value)}
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
                          value={draft.brand}
                          onChange={(event) => handleDraftChange(draft.id, 'brand', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Model</span>
                        <input
                          type="text"
                          value={draft.model}
                          onChange={(event) => handleDraftChange(draft.id, 'model', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Year</span>
                        <input
                          type="number"
                          value={draft.year}
                          onChange={(event) => handleDraftChange(draft.id, 'year', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Body type</span>
                        <select
                          value={draft.body_type}
                          onChange={(event) => handleDraftChange(draft.id, 'body_type', event.target.value)}
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
                          value={draft.location}
                          onChange={(event) => handleDraftChange(draft.id, 'location', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                          {draft.type === 'rent' ? 'Price / day (UGX)' : 'Sale price (UGX)'}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatPrice(draft.price)}
                          onChange={(event) => handleDraftChange(draft.id, 'price', priceDigits(event.target.value))}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Upload photos</span>
                      <input
                        key={`${draft.id}-${draft.files.map((file) => `${file.name}-${file.size}`).join('|')}`}
                        type="file"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif"
                        onChange={(event) => handleFileSelection(draft.id, event)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
                      />
                      {draft.files.length > 0 && (
                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                          {draft.files.length} file{draft.files.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </label>

                    {draft.imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {draft.imagePreviews.map((src, previewIndex) => (
                          <div key={src} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <img
                              src={src}
                              alt={`${buildDraftTitle(draft) || `Listing ${index + 1}`} preview ${previewIndex + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeDraftFile(draft.id, previewIndex)}
                              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/85 text-sm font-bold text-white shadow transition hover:bg-rose-600"
                              aria-label={`Remove selected photo ${previewIndex + 1}`}
                            >
                              x
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                              {draft.files[previewIndex]?.name || `Photo ${previewIndex + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Description</span>
                        <textarea
                          value={draft.description}
                          onChange={(event) => handleDraftChange(draft.id, 'description', event.target.value)}
                          rows={3}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none"
                        ></textarea>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</span>
                        <select
                          value={draft.status}
                          onChange={(event) => handleDraftChange(draft.id, 'status', event.target.value)}
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
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={addDraft}
                    disabled={saving || uploadingImages}
                    className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Add listing
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingImages ? 'Uploading photos...' : saving ? 'Saving...' : 'Create listings'}
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
                Loading your listings...
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
                    <p className="text-sm text-slate-500">{listing.brand} - {listing.model} - {listing.body_type}</p>
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
                        type="text"
                        inputMode="numeric"
                        value={formatPrice(priceValue)}
                        onChange={(event) =>
                          setUpdates((prev) => ({
                            ...prev,
                            [listing.id]: { ...prev[listing.id], price: priceDigits(event.target.value) },
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
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{listing.brand} - {listing.model}</p>
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
