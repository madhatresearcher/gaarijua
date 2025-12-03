"use client"
export default function FiltersSidebar() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Filters</h3>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-gray-600">Type</label>
          <select className="w-full border rounded px-2 py-1">
            <option>All</option>
            <option>SUV</option>
            <option>Sedan</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-600">Price</label>
          <input type="range" className="w-full" />
        </div>
      </div>
    </div>
  )
}
