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
  quantity_box?: number | null;
  colour?: string | null;
  product_type?: string | null;
  remarks?: string | null;
}

export default function ProductPage() {
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    size_mm: '3',
    quantity: '',
    quantity_box: '',
    colour: '',
    product_type: '',
    remarks: '',
  });

  const sizes = [3, 4, 6, 8, 10, 15, 18, 20, 25, 30, 35, 40, 45, 50, 55];
  const COLOURS = ['Black', 'White', 'Other'];
  const PRODUCT_TYPES = ['Rubber Elastic', '840 Lycra', '840 Lycra Finishing', '1120 Lycra Finishing'];

  useEffect(() => {
    fetchProducts();
    // Cleanup: clear loading and messages when component unmounts
    return () => {
      setLoading(false);
      setError(null);
      setSuccess(null);
    };
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

    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.create({
        date: formData.date,
        size_mm: parseInt(formData.size_mm),
        quantity: parseFloat(formData.quantity),
        quantity_box: formData.quantity_box ? parseFloat(formData.quantity_box) : null,
        colour: formData.colour || null,
        product_type: formData.product_type || null,
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Product entry created successfully');
        setTimeout(() => setSuccess(null), 3000);
        setFormData(prev => ({
          ...prev,
          quantity: '',
          quantity_box: '',
          colour: '',
          product_type: '',
          remarks: '',
        }));
        // Add new entry to state immediately without waiting for full refetch
        if (response.data?.data) {
          setEntries([response.data.data, ...entries]);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    // Optimistic update - remove from UI immediately
    const previousEntries = entries;
    setEntries(entries.filter(e => e.id !== id));
    setSuccess('Product entry deleted');
    setTimeout(() => setSuccess(null), 3000);

    try {
      await productAPI.delete(id);
    } catch (err) {
      // Revert on error
      setEntries(previousEntries);
      setError(getErrorMessage(err));
      setSuccess(null);
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
                <option value="0">Unsize</option>
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
              <label className="block text-sm font-medium mb-1 text-gray-700">Qty (box)</label>
              <input
                type="number"
                name="quantity_box"
                value={formData.quantity_box}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="0"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Colour</label>
              <select
                name="colour"
                value={formData.colour}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="">Select Colour</option>
                {COLOURS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Type of Product</label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="">Select Type</option>
                {PRODUCT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
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
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                  <col style={{ width: '14.2857%' }} />
                </colgroup>
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Size (mm)</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Type / Colour</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Quantity (m)</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Qty (box)</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-3 py-4 text-gray-600 tabular-nums">{formatDate(entry.date)}</td>
                      <td className="text-center px-3 py-4 text-gray-900 font-medium">{entry.size_mm === 0 ? 'Unsize' : `${entry.size_mm} mm`}</td>
                      <td className="px-3 py-4 text-gray-700 text-xs">
                        {entry.product_type || '-'} <br/>
                        <span className="text-gray-500">{entry.colour || '-'}</span>
                      </td>
                      <td className="text-center px-3 py-4 tabular-nums font-bold text-gray-800">{entry.quantity.toFixed(2)}</td>
                      <td className="text-center px-3 py-4 tabular-nums text-gray-600">{entry.quantity_box ?? '-'}</td>
                      <td className="px-3 py-4 text-gray-500 text-xs italic max-w-xs truncate" title={entry.remarks || ''}>
                        {entry.remarks || '-'}
                      </td>
                      <td className="text-center px-3 py-4">
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
