"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatCurrency, detectCurrencyFromRecord } from '../lib/currency'

type PartRecord = {
  id?: string
  slug?: string
  title?: string
  brand?: string
  category?: string
  description?: string
  images?: string[]
  compatible_models?: string[]
  price?: number
  seller?: string
  sku?: string
  created_at?: string
}

const placeholderImage = '/placeholder-part.jpg'

export default function PartDetailLayout({ part }: { part: PartRecord }) {
  const galleryImages = part.images && part.images.length > 0 ? part.images : [placeholderImage]
  const [activeImage, setActiveImage] = useState(0)
  const currency = detectCurrencyFromRecord(part) || 'UGX'
  const priceLabel = formatCurrency(part.price, currency)
  const sellerName = part.seller || 'Gaarijua Parts'
  const specs = useMemo(() => {
    const base: string[] = []
    if (part.brand) base.push(`Brand · ${part.brand}`)
    if (part.category) base.push(`Category · ${part.category}`)
    if (part.sku) base.push(`SKU · ${part.sku}`)
    return base
  }, [part.brand, part.category, part.sku])
  const compatibility = part.compatible_models || []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-slate-100">
              <img
                src={galleryImages[activeImage]}
                alt={part.title}
                className="h-[420px] w-full object-cover transition duration-200"
              />
              <button
                type="button"
                onClick={() => setActiveImage((prev) => (prev + 1) % galleryImages.length)}
                className="absolute bottom-4 right-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                View gallery
              </button>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {galleryImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
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
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">{part.title}</h1>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{sellerName}</p>
              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                {specs.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <article className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">About this part</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{part.description}</p>
            </article>
            {compatibility.length > 0 && (
              <article className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Compatible models</h2>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  {compatibility.map((model) => (
                    <span
                      key={model}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1 font-semibold"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </article>
            )}
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white shadow-xl p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Price</p>
              <p className="text-4xl font-bold text-slate-900">{priceLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Availability</p>
              <p className="text-lg font-semibold text-emerald-600">In stock</p>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm">
                Add to cart
              </button>
              <button className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">
                Contact seller
              </button>
            </div>
            <p className="text-xs text-slate-500">Updated {new Date(part.created_at || Date.now()).toLocaleDateString()}</p>
          </aside>
        </div>
        <div>
          <Link href="/parts" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to parts
          </Link>
        </div>
      </div>
    </div>
  )
}
