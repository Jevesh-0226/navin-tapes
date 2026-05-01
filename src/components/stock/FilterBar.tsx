import React from 'react';
import { getToday } from '@/lib/utils';

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
    <form 
      onSubmit={(e) => e.preventDefault()}
      className="bg-gray-50 border rounded-md p-6 mb-6 text-sm"
    >
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-tight">Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="mt-1 border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-tight">Material</label>
          <select
            name="materialId"
            value={filters.materialId}
            onChange={handleChange}
            className="mt-1 border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
          >
            <option value="all">All Materials</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setFilters({ date: getToday(), materialId: 'all', size_mm: 'all' })}
          className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
