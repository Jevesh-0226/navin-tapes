'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { stockAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface Stock {
  id: number;
  date: string;
  materialId?: number | null;
  size_mm?: number | null;
  material?: { id: number; name: string };
  opening_stock: number;
  purchase: number;
  production: number;
  sales: number;
  balance: number;
}

export default function StockPage() {
  const [entries, setEntries] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    materialId: '1',
    size_mm: '',
    opening_stock: '',
    production: '',
  });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await stockAPI.getByDate(formData.date);
      setEntries(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      date: value,
    }));
    // Fetch stock for new date
    try {
      const response = await stockAPI.getByDate(value);
      setEntries(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.opening_stock) {
      setError('Please fill opening stock');
      return;
    }

    try {
      setLoading(true);
      const response = await stockAPI.create({
        date: formData.date,
        materialId: formData.materialId ? parseInt(formData.materialId) : null,
        size_mm: formData.size_mm ? parseInt(formData.size_mm) : null,
        opening_stock: parseFloat(formData.opening_stock),
        purchase: 0,
        production: formData.production ? parseFloat(formData.production) : 0,
        sales: 0,
      });

      if (response.data?.success) {
        setSuccess('Stock entry created successfully');
        setFormData({
          date: getToday(),
          materialId: '1',
          size_mm: '',
          opening_stock: '',
          production: '',
        });
        fetchStock();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduction = async (id: number, production: number) => {
    try {
      await stockAPI.update(id, { production });
      setSuccess('Stock updated');
      fetchStock();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateSales = async (id: number, sales: number) => {
    try {
      await stockAPI.update(id, { sales });
      setSuccess('Stock updated');
      fetchStock();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const totalBalance = entries.reduce((sum, e) => sum + e.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Stock" subtitle="Central inventory ledger" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Stock Entry</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <select
                name="materialId"
                value={formData.materialId}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="1">Material 1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size (mm)</label>
              <input
                type="number"
                name="size_mm"
                value={formData.size_mm}
                onChange={handleInputChange}
                placeholder="25"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opening Stock</label>
              <input
                type="number"
                name="opening_stock"
                value={formData.opening_stock}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Production</label>
              <input
                type="number"
                name="production"
                value={formData.production}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="lg:col-span-3 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Add Stock Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600">Total Opening</p>
              <p className="text-2xl font-bold text-blue-900">{entries.reduce((sum, e) => sum + e.opening_stock, 0).toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600">Total Purchase</p>
              <p className="text-2xl font-bold text-green-900">{entries.reduce((sum, e) => sum + e.purchase, 0).toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-600">Total Production</p>
              <p className="text-2xl font-bold text-yellow-900">{entries.reduce((sum, e) => sum + e.production, 0).toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600">Total Balance</p>
              <p className="text-2xl font-bold text-purple-900">{totalBalance.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Stock - {formatDate(formData.date)}</h2>

          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stock entries for this date</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">Material/Size</th>
                    <th className="text-right px-4 py-2">Opening</th>
                    <th className="text-right px-4 py-2">Purchase</th>
                    <th className="text-right px-4 py-2">Production</th>
                    <th className="text-right px-4 py-2">Sales</th>
                    <th className="text-right px-4 py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {entry.material?.name || '-'}
                        {entry.size_mm ? ` / ${entry.size_mm}mm` : ''}
                      </td>
                      <td className="text-right px-4 py-2">{entry.opening_stock.toFixed(2)}</td>
                      <td className="text-right px-4 py-2">{entry.purchase.toFixed(2)}</td>
                      <td className="text-right px-4 py-2">{entry.production.toFixed(2)}</td>
                      <td className="text-right px-4 py-2">{entry.sales.toFixed(2)}</td>
                      <td className="text-right px-4 py-2 font-bold">{entry.balance.toFixed(2)}</td>
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
