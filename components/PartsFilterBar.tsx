"use client"

export type PartFilterFields = {
  location: string
  make: string
  model: string
  seller: string
  minPrice: string
  maxPrice: string
}

type PartsFilterBarProps = {
  filters: PartFilterFields
  onChange: (field: keyof PartFilterFields, value: string) => void
  onApply: () => void
  onReset: () => void
}

export default function PartsFilterBar({ filters, onChange, onApply, onReset }: PartsFilterBarProps) {
  const pillClass =
    'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none'

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm min-w-[640px]">
        <input
          className={pillClass + ' min-w-[150px]'}
          placeholder="Location"
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
        />
        <input
          className={pillClass + ' min-w-[140px]'}
          placeholder="Make"
          value={filters.make}
          onChange={(event) => onChange('make', event.target.value)}
        />
        <input
          className={pillClass + ' min-w-[140px]'}
          placeholder="Model"
          value={filters.model}
          onChange={(event) => onChange('model', event.target.value)}
        />
        <input
          className={pillClass + ' min-w-[140px]'}
          placeholder="Seller"
          value={filters.seller}
          onChange={(event) => onChange('seller', event.target.value)}
        />
        <input
          className={pillClass + ' min-w-[110px]'}
          placeholder="Min UGX"
          value={filters.minPrice}
          onChange={(event) => onChange('minPrice', event.target.value)}
        />
        <input
          className={pillClass + ' min-w-[110px]'}
          placeholder="Max UGX"
          value={filters.maxPrice}
          onChange={(event) => onChange('maxPrice', event.target.value)}
        />
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
