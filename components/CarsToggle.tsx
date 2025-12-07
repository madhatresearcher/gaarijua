"use client"

type CarsToggleProps = {
  mode: 'rent' | 'buy'
  onChange: (value: 'rent' | 'buy') => void
}

export default function CarsToggle({ mode, onChange }: CarsToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 gap-1">
      <button
        type="button"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          mode === 'rent' ? 'bg-slate-900 text-white' : 'text-slate-700'
        }`}
        onClick={() => onChange('rent')}
      >
        Rent
      </button>
      <button
        type="button"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          mode === 'buy' ? 'bg-slate-900 text-white' : 'text-slate-700'
        }`}
        onClick={() => onChange('buy')}
      >
        Buy
      </button>
    </div>
  )
}
