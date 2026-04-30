'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { purchaseAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface Purchase {
  id: number;
  date: string;
  invoice_no: string;
  supplier: string;
  material?: { id: number; name: string };
  materialId: number;
  quantity_kg: number;
  quantity_box?: number | null;
  remarks?: string | null;
}

export default function PurchasePage() {
  const [entries, setEntries] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [materials, setMaterials] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    date: getToday(),
    invoice_no: '',
    supplier: '',
    materialId: '',
    quantity_kg: '',
    quantity_box: '',
    remarks: '',
  });

  useEffect(() => {
    fetchPurchases();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/material');
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
        if (result.data.length > 0) {
          setFormData(prev => ({ ...prev, materialId: result.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseAPI.getAll();
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

    if (!formData.invoice_no || !formData.supplier || !formData.quantity_kg) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await purchaseAPI.create({
        date: formData.date,
        invoice_no: formData.invoice_no,
        supplier: formData.supplier,
        materialId: parseInt(formData.materialId),
        size_mm: null,
        quantity_kg: parseFloat(formData.quantity_kg),
        quantity_box: formData.quantity_box ? parseFloat(formData.quantity_box) : null,
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Purchase entry created successfully');
        setFormData(prev => ({
          ...prev,
          date: getToday(),
          invoice_no: '',
          supplier: '',
          quantity_kg: '',
          quantity_box: '',
          remarks: '',
        }));
        fetchPurchases();
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
      await purchaseAPI.delete(id);
      setSuccess('Purchase entry deleted');
      fetchPurchases();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Purchase" subtitle="Raw material inward" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">New Purchase Entry</h2>

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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Invoice #</label>
              <input
                type="text"
                name="invoice_no"
                value={formData.invoice_no}
                onChange={handleInputChange}
                placeholder="Invoice number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Supplier name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Material</label>
              <select
                name="materialId"
                value={formData.materialId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                required
              >
                <option value="">Select Material</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Qty (kg)</label>
              <input
                type="number"
                name="quantity_kg"
                value={formData.quantity_kg}
                onChange={handleInputChange}
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
                placeholder="0"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional notes"
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Creating...' : 'Add Purchase Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Purchase History</h2>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No purchases yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Invoice</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Supplier</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Material</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Qty (kg)</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Qty (box)</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {entries.map(entry => (
                      <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 tabular-nums">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{entry.invoice_no}</td>
                        <td className="px-6 py-4 text-gray-700">{entry.supplier}</td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          {entry.material?.name || '-'}
                        </td>
                        <td className="text-center px-6 py-4 tabular-nums font-bold text-gray-800">{entry.quantity_kg.toFixed(2)}</td>
                        <td className="text-center px-6 py-4 tabular-nums text-gray-600">{entry.quantity_box || '-'}</td>
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
