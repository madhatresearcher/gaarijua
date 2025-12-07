"use client"

export type CompareItem = {
  id: string
  title: string
  shortTitle: string
  slug: string
  thumb: string
  price: number
}

type CompareTrayProps = {
  tray: CompareItem[]
  max: number
  compareDisabled: boolean
  message?: string
  onRemove: (id: string) => void
  onClear: () => void
  onCompareNow: () => void
}

export default function CompareTray({
  tray,
  max,
  compareDisabled,
  message,
  onRemove,
  onClear,
  onCompareNow,
}: CompareTrayProps) {
  if (!tray.length) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[320px] rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Compare ({tray.length}/{max})</span>
        <button type="button" onClick={onClear} className="text-[0.6rem] font-semibold text-slate-400 hover:text-slate-900">
          Clear
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3">
        {tray.map((item, index) => (
          <div key={item.id} className="relative flex min-w-[90px] flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 text-center text-[0.7rem]">
            <div className="h-16 overflow-hidden rounded-xl bg-white">
              <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <span className="truncate font-semibold text-slate-800">{item.shortTitle}</span>
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-slate-700 shadow"
                aria-label={`Remove ${item.title}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {message && <p className="mb-2 text-xs font-semibold text-rose-500">{message}</p>}

      <button
        type="button"
        onClick={onCompareNow}
        disabled={compareDisabled}
        className={`w-full rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition ${
          compareDisabled ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 hover:bg-slate-800'
        }`}
      >
        Compare now
      </button>
    </div>
  )
}