"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CompareTray, { CompareItem } from './CompareTray'
import SimilarCard from './SimilarCard'
import { detectCurrencyFromRecord, formatCurrency } from '../lib/currency'

type CarRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  model?: string
  year?: number
  description?: string
  images?: string[]
  location?: string
  is_for_rent?: boolean
  price_per_day?: number
  pricePerDay?: number
  seller?: string
  rating?: number
  review_count?: number
  instant_book?: boolean
  instant_bookable?: boolean
  featured?: boolean
  price_buy?: number
  priceBuy?: number
}

const MAX_COMPARE = 4
const STORAGE_KEY = 'gaariua-compare-tray'

type DateRange = {
  start?: Date
  end?: Date
}

type CarDetailLayoutProps = {
  car: CarRecord
  similarRentals: CarRecord[]
}

export default function CarDetailLayout({ car, similarRentals }: CarDetailLayoutProps) {
  const router = useRouter()
  const currency = detectCurrencyFromRecord(car) || 'UGX'
  const pricePerDay = Number(car.price_per_day ?? car.pricePerDay ?? 0)
  const salePrice = Number(car.price_buy ?? car.priceBuy ?? 0)
  const normalizedCurrent = useMemo(() => normalizeListing(car), [car])
  const isRental = Boolean(car.is_for_rent || pricePerDay)
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const galleryImages = car.images && car.images.length > 0 ? car.images : ['/placeholder-car.jpg']
  const [selectedRange, setSelectedRange] = useState<DateRange>({})
  const [tray, setTray] = useState<CompareItem[]>([])
  const [trayMessage, setTrayMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))

  const earliestMonth = useMemo(() => startOfMonth(new Date()), [])
  const maxAdvanceMonths = 5
  const latestMonth = useMemo(() => addMonths(earliestMonth, maxAdvanceMonths), [earliestMonth])

  const calibratedRange = useMemo(() => (
    selectedRange.start && selectedRange.end
      ? {
          start: selectedRange.start < selectedRange.end ? selectedRange.start : selectedRange.end,
          end: selectedRange.end < selectedRange.start ? selectedRange.start : selectedRange.end,
        }
      : selectedRange
  ), [selectedRange])

  const calendarDays = useMemo(() => buildMonthCalendar(currentMonth, calibratedRange), [currentMonth, calibratedRange])
  const selectedNights = useMemo(() => computeNights(calibratedRange), [calibratedRange])
  const totalPrice = pricePerDay * Math.max(1, selectedNights)
  const features = useMemo(() => buildFeatures(car), [car])
  const reviews = useMemo(() => buildReviews(car), [car])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setTray(parsed)
      }
    } catch (error) {
      console.error('unable to read compare tray', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tray))
  }, [tray])

  useEffect(() => {
    if (!trayMessage) return
    if (typeof window === 'undefined') return
    const timer = window.setTimeout(() => setTrayMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [trayMessage])

  const addToTray = useCallback(
    (listing: CarRecord) => {
      const normalized = normalizeListing(listing)
      setTray((prev) => {
        const hasCurrent = prev.some((item) => item.id === normalizedCurrent.id)
        const withCurrent = hasCurrent ? prev : [normalizedCurrent, ...prev]
        if (withCurrent.some((entry) => entry.id === normalized.id)) {
          return withCurrent
        }
        if (withCurrent.length >= MAX_COMPARE) {
          setTrayMessage('Tray is full. Remove an item to add another.')
          return withCurrent
        }
        return [...withCurrent, normalized]
      })
    },
    [normalizedCurrent]
  )

  const removeFromTray = useCallback((id: string) => {
    setTray((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const clearTray = useCallback(() => {
    setTray([])
  }, [])

  const handleCompareNow = useCallback(() => {
    if (tray.length < 2) return
    const ids = tray.map((entry) => entry.id).join(',')
    router.push(`/compare?ids=${ids}`)
  }, [router, tray])

  const handleDayClick = useCallback((date: Date, disabled: boolean) => {
    if (disabled) return
    setSelectedRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: date }
      }
      if (prev.start && !prev.end) {
        if (date < prev.start) return { start: date, end: prev.start }
        return { start: prev.start, end: date }
      }
      return { start: date }
    })
  }, [])

  const handleMonthChange = useCallback(
    (direction: number) => {
      setCurrentMonth((prev) => {
        const next = addMonths(prev, direction)
        if (direction < 0 && next.getTime() < earliestMonth.getTime()) return prev
        if (direction > 0 && next.getTime() > latestMonth.getTime()) return prev
        return next
      })
    },
    [earliestMonth, latestMonth]
  )

  const priceLabel = isRental
    ? pricePerDay
      ? `${formatCurrency(pricePerDay, currency)}/day`
      : 'Price on request'
    : salePrice
    ? formatCurrency(salePrice, currency)
    : 'Price on request'
  const vendorTitle = car.seller || 'Verified Host'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <div className="relative rounded-3xl bg-slate-900/5 p-6 shadow-lg">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={galleryImages[activeImage]}
                  alt={car.title}
                  className="h-[420px] w-full object-cover transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  className="absolute bottom-4 right-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  View gallery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                  className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev + 1) % galleryImages.length)}
                  className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow"
                >
                  ›
                </button>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {galleryImages.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-20 min-w-[90px] rounded-2xl border ${
                      index === activeImage ? 'border-slate-900 shadow-lg' : 'border-transparent'
                    } overflow-hidden bg-white`}
                  >
                    <img src={src} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            {lightbox && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="relative w-full max-w-5xl">
                  <button
                    type="button"
                    onClick={() => setLightbox(false)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900"
                  >
                    Close
                  </button>
                  <img
                    src={galleryImages[activeImage]}
                    alt={car.title}
                    className="h-[70vh] w-full object-contain"
                  />
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl lg:sticky lg:top-24">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{car.location || 'East Africa'}</p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900">
                {car.title || `${car.brand || ''} ${car.model || ''}`.trim()}
              </h1>
              <p className="text-2xl font-bold text-slate-900">{priceLabel}</p>
              <p className="text-sm text-slate-500">{car.description?.split('\n')[0]}</p>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800">
                {isRental ? 'Book now' : 'Contact seller'}
              </button>
              {(car.instant_bookable || car.instant_book) && (
                <button className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">
                  Quick reserve
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Price summary</p>
              <p className="text-sm font-semibold text-slate-500">Selected dates</p>
              <p className="text-lg font-semibold text-slate-900">
                {selectedRange.start ? formatDate(selectedRange.start) : 'Start date'} –{' '}
                {selectedRange.end ? formatDate(selectedRange.end) : 'End date'}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span>{selectedNights || 1} day(s)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalPrice, currency)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vendor</p>
              <p className="text-lg font-semibold text-slate-900">{vendorTitle}</p>
              <p className="text-sm text-slate-500">{car.location || 'Kampala, UG'}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                  ★ {(car.rating ?? 4.8).toFixed(1)}
                </div>
                <span>{car.review_count ?? 32} reviews</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="space-y-10">
          <article className="space-y-3 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">About this car</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{car.description}</p>
          </article>

          <article className="space-y-3 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Included / Features</h2>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <span key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-sm font-semibold text-slate-600">
                  {feature}
                </span>
              ))}
            </div>
          </article>

          {isRental && (
            <article className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Availability calendar</h2>
                  <p className="text-sm text-slate-500">Scroll the slabs to book any number of days.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMonthChange(-1)}
                    disabled={!canPrevMonth(currentMonth, earliestMonth)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMonthChange(1)}
                    disabled={!canNextMonth(currentMonth, latestMonth)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid auto-cols-fr grid-flow-col gap-2 overflow-x-auto">
                {calendarDays.map((day) => (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => handleDayClick(day.date, day.disabled)}
                    className={`flex h-24 w-20 flex-col items-center justify-center rounded-2xl border p-2 text-[10px] font-semibold ${
                      day.disabled
                        ? 'border-rose-100 bg-rose-50 text-rose-400'
                        : day.selected
                        ? 'border-pink-200 bg-pink-50 text-pink-600'
                        : 'border-slate-100 bg-white text-slate-900'
                    }`}
                  >
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">{day.weekday}</span>
                    <span className="text-lg font-bold">{day.label}</span>
                  </button>
                ))}
              </div>
            </article>
          )}

          <article className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Ratings &amp; recent reviews</h2>
              <button className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">View all reviews</button>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl font-semibold text-emerald-600">
                {(car.rating ?? 4.8).toFixed(1)}
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">rating</span>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                    <p className="font-semibold text-slate-900">{review.author}</p>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">{review.date}</p>
                    <p>{review.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {isRental && (
            <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Similar rentals</h2>
              <p className="text-sm text-slate-500">Showing {similarRentals.length}</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {similarRentals.map((listing, index) => (
                <SimilarCard
                  key={listing.id ?? listing.slug ?? `similar-${index}`}
                  listing={listing}
                  onCompare={addToTray}
                />
              ))}
            </div>
          </section>
          )}
        </section>
      </div>

      {isRental && (
        <CompareTray
          tray={tray}
          max={MAX_COMPARE}
          message={trayMessage}
          onRemove={removeFromTray}
          onClear={clearTray}
          onCompareNow={handleCompareNow}
          compareDisabled={tray.length < 2}
        />
      )}
    </div>
  )
}

function normalizeListing(car: CarRecord): CompareItem {
  const identifier =
    car.id ||
    car.slug ||
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `compare-${Date.now()}`)
  const title = car.title || `${car.brand || ''} ${car.model || ''}`.trim() || 'Rental'
  return {
    id: identifier,
    title,
    shortTitle: title.length > 15 ? `${title.slice(0, 15)}…` : title,
    slug: car.slug || car.id || identifier,
    thumb: (car.images && car.images[0]) || '/placeholder-car.jpg',
    price: Number(car.price_per_day ?? car.pricePerDay ?? 0),
  }
}

function buildFeatures(car: CarRecord) {
  const features: string[] = []
  if (car.brand && car.model) features.push(`${car.brand} ${car.model}`)
  if (car.year) features.push(`${car.year} model`)
  if (car.location) features.push(car.location)
  if (car.rating) features.push(`Rating ${car.rating.toFixed(1)}`)
  if (car.instant_bookable || car.instant_book) features.push('Instant reservation')
  features.push('Comprehensive insurance', 'Roadside support', 'Sanitized interior')
  return Array.from(new Set(features))
}

function buildReviews(car: CarRecord) {
  const now = new Date()
  const authors = ['Asha N.', 'Samuel B.', 'Lena H.']
  const excerpts = [
    'Flawless pickup, very responsive host. Vehicle felt new and safe for the kids.',
    'Smooth ride in and out of Kampala. Host answered every question before pickup.',
    'Great fuel efficiency and clean cabin. Would rent again for my road trip.',
  ]
  return authors.map((author, index) => ({
    id: `${author}-${index}`,
    author,
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    excerpt: excerpts[index],
  }))
}

function buildCalendar(range: DateRange) {
  const today = new Date()
  const blockedOffsets = [3, 6, 9, 12]
  const blockedSet = new Set(blockedOffsets.map((offset) => makeISO(today, offset)))
  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date()
    date.setDate(today.getDate() + index)
    const iso = date.toISOString().slice(0, 10)
    return {
      date,
      label: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      iso,
      disabled: blockedSet.has(iso),
      selected: isSelected(date, range),
    }
  })
}

function computeNights(range: DateRange) {
  if (!range.start) return 0
  if (!range.end) return 1
  const start = normalizeDay(range.start)
  const end = normalizeDay(range.end)
  const diffMs = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays + 1)
}

function isSelected(date: Date, range: DateRange) {
  if (!range.start) return false
  const target = normalizeDay(date).getTime()
  if (!range.end) {
    return target === normalizeDay(range.start).getTime()
  }
  const start = normalizeDay(range.start)
  const end = normalizeDay(range.end)
  const startTime = Math.min(start.getTime(), end.getTime())
  const endTime = Math.max(start.getTime(), end.getTime())
  return target >= startTime && target <= endTime
}

function normalizeDay(date: Date) {
  const clone = new Date(date)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function makeISO(base: Date, offset: number) {
  const date = new Date(base)
  date.setDate(base.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function formatDate(date?: Date) {
  if (!date) return '--'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function canPrevMonth(currentMonth: Date, earliestMonth: Date) {
  return currentMonth.getTime() > earliestMonth.getTime()
}

function canNextMonth(currentMonth: Date, latestMonth: Date) {
  return currentMonth.getTime() < latestMonth.getTime()
}

function startOfMonth(date: Date) {
  const clone = new Date(date)
  clone.setDate(1)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function endOfMonth(date: Date) {
  const clone = new Date(date)
  clone.setMonth(clone.getMonth() + 1)
  clone.setDate(0)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function addMonths(date: Date, amount: number) {
  const clone = new Date(date)
  clone.setMonth(clone.getMonth() + amount)
  return clone
}

function buildMonthCalendar(monthStart: Date, range: DateRange) {
  const days: Array<{ date: Date; label: number; weekday: string; iso: string; disabled: boolean; selected: boolean }> = []
  const start = startOfMonth(monthStart)
  const end = endOfMonth(monthStart)
  const today = normalizeDay(new Date())
  const cursor = new Date(start)
  while (cursor.getTime() <= end.getTime()) {
    const iso = cursor.toISOString().slice(0, 10)
    days.push({
      date: new Date(cursor),
      label: cursor.getDate(),
      weekday: cursor.toLocaleDateString('en-US', { weekday: 'short' }),
      iso,
      disabled: cursor.getTime() < today.getTime(),
      selected: isSelected(cursor, range),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}