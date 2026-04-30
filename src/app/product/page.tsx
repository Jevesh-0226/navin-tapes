'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { productAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface ProductEntry {
  id: number;
  date: string;
  size_mm: number;
  quantity: number;
  remarks?: string | null;
}

export default function ProductPage() {
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    size_mm: '12',
    quantity: '',
    remarks: '',
  });

  const sizes = [12, 18, 20, 24, 25, 30, 36, 40, 48, 60, 72];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setEntries(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity) {
      setError('Please enter quantity');
      return;
    }

    try {
      setLoading(true);
      const response = await productAPI.create({
        date: formData.date,
        size_mm: parseInt(formData.size_mm),
        quantity: parseFloat(formData.quantity),
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Product entry created successfully');
        setFormData(prev => ({
          ...prev,
          quantity: '',
          remarks: '',
        }));
        fetchProducts();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    try {
      setLoading(true);
      await productAPI.delete(id);
      setSuccess('Product entry deleted');
      fetchProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Product" subtitle="Finished goods production" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">New Product Entry</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Size (mm)</label>
              <select
                name="size_mm"
                value={formData.size_mm}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                required
              >
                {sizes.map(s => (
                  <option key={s} value={s}>
                    {s} mm
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quantity (meters)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder="Optional notes"
                rows={1}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-4 flex items-end justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Saving...' : 'Save Product Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Production History</h2>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No production entries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Size (mm)</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Quantity (m)</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 tabular-nums">{formatDate(entry.date)}</td>
                      <td className="text-center px-6 py-4 text-gray-900 font-medium">{entry.size_mm} mm</td>
                      <td className="text-center px-6 py-4 tabular-nums font-bold text-gray-800">{entry.quantity.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs italic max-w-xs truncate" title={entry.remarks || ''}>
                        {entry.remarks || '-'}
                      </td>
                      <td className="text-center px-6 py-4">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
