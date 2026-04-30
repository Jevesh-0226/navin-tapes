'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { salesAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface Sales {
  id: number;
  date: string;
  customer_name: string;
  size_mm: number;
  quantity: number;
  rate: number;
  amount: number;
  remarks?: string | null;
}

export default function SalesPage() {
  const [entries, setEntries] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    customer_name: '',
    size_mm: '25',
    quantity: '',
    rate: '',
    remarks: '',
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll();
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

    if (!formData.customer_name || !formData.quantity || !formData.rate) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await salesAPI.create({
        date: formData.date,
        customer_name: formData.customer_name,
        size_mm: parseInt(formData.size_mm),
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Sales entry created successfully');
        setFormData({
          date: getToday(),
          customer_name: '',
          size_mm: '25',
          quantity: '',
          rate: '',
          remarks: '',
        });
        fetchSales();
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
      await salesAPI.delete(id);
      setSuccess('Sales entry deleted');
      fetchSales();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Sales" subtitle="Product distribution to customers" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">New Sales Entry</h2>

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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Customer name"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size (mm)</label>
              <select
                name="size_mm"
                value={formData.size_mm}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="20">20 mm</option>
                <option value="25">25 mm</option>
                <option value="30">30 mm</option>
                <option value="40">40 mm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rate</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                disabled
                value={
                  formData.quantity && formData.rate
                    ? (parseFloat(formData.quantity) * parseFloat(formData.rate)).toFixed(2)
                    : ''
                }
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional notes"
                rows={2}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="lg:col-span-3 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Add Sales'}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600">Total Quantity</p>
              <p className="text-2xl font-bold text-blue-900">{totalQuantity.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-900">₹{totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600">Entries</p>
              <p className="text-2xl font-bold text-purple-900">{entries.length}</p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Sales Entries</h2>

          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Customer</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Size (mm)</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Quantity</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Rate</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 tabular-nums">{formatDate(entry.date)}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{entry.customer_name}</td>
                      <td className="text-center px-6 py-4 text-gray-700">{entry.size_mm}</td>
                      <td className="text-center px-6 py-4 tabular-nums font-medium text-gray-700">{entry.quantity.toFixed(2)}</td>
                      <td className="text-center px-6 py-4 tabular-nums text-gray-600">₹{entry.rate.toFixed(2)}</td>
                      <td className="text-center px-6 py-4 tabular-nums font-bold text-gray-900">₹{entry.amount.toFixed(2)}</td>
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
