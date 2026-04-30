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

  const [formData, setFormData] = useState({
    date: getToday(),
    invoice_no: '',
    supplier: '',
    materialId: '1',
    quantity_kg: '',
    quantity_box: '',
    remarks: '',
  });

  useEffect(() => {
    fetchPurchases();
  }, []);

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
        quantity_kg: parseFloat(formData.quantity_kg),
        quantity_box: formData.quantity_box ? parseFloat(formData.quantity_box) : null,
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Purchase entry created successfully');
        setFormData({
          date: getToday(),
          invoice_no: '',
          supplier: '',
          materialId: '1',
          quantity_kg: '',
          quantity_box: '',
          remarks: '',
        });
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">New Purchase Entry</h2>

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
              <label className="block text-sm font-medium mb-1">Invoice #</label>
              <input
                type="text"
                name="invoice_no"
                value={formData.invoice_no}
                onChange={handleInputChange}
                placeholder="Invoice number"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Supplier name"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

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
              <label className="block text-sm font-medium mb-1">Qty (kg)</label>
              <input
                type="number"
                name="quantity_kg"
                value={formData.quantity_kg}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Qty (box)</label>
              <input
                type="number"
                name="quantity_box"
                value={formData.quantity_box}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full border rounded px-3 py-2"
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
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Add Purchase'}
              </button>
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Purchase Entries</h2>

          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No purchases yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Invoice</th>
                    <th className="text-left px-4 py-2">Supplier</th>
                    <th className="text-left px-4 py-2">Material</th>
                    <th className="text-right px-4 py-2">Qty (kg)</th>
                    <th className="text-right px-4 py-2">Qty (box)</th>
                    <th className="text-left px-4 py-2">Remarks</th>
                    <th className="text-center px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{formatDate(entry.date)}</td>
                      <td className="px-4 py-2">{entry.invoice_no}</td>
                      <td className="px-4 py-2">{entry.supplier}</td>
                      <td className="px-4 py-2">{entry.material?.name || '-'}</td>
                      <td className="text-right px-4 py-2">{entry.quantity_kg}</td>
                      <td className="text-right px-4 py-2">{entry.quantity_box || '-'}</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">{entry.remarks || '-'}</td>
                      <td className="text-center px-4 py-2">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
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
