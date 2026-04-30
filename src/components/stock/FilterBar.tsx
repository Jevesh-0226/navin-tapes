import React from 'react';

interface FilterBarProps {
  filters: {
    date: string;
    materialId: string;
    size_mm: string;
  };
  setFilters: (filters: any) => void;
  materials: { id: number; name: string }[];
}

export default function FilterBar({ filters, setFilters, materials }: FilterBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const sizes = [12, 18, 24, 36, 48, 60, 72]; // Common tape sizes in mm

  return (
    <div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 border border-gray-200 rounded-md shadow-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Material</label>
        <select
          name="materialId"
          value={filters.materialId}
          onChange={handleChange}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 text-sm bg-white min-w-[150px]"
        >
          <option value="all">All Materials</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Size (mm)</label>
        <select
          name="size_mm"
          value={filters.size_mm}
          onChange={handleChange}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 text-sm bg-white min-w-[120px]"
        >
          <option value="all">All Sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s} mm
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setFilters({ date: '', materialId: 'all', size_mm: 'all' })}
        className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
