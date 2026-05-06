'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { salesAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDateIndian, formatCurrency, formatIndianNumber, printTable } from '@/lib/utils';

interface Sales {
  id: number;
  date: string;
  customer_name: string;
  size_mm: number;
  quantity: number;
  rate: number;
  amount: number;
  colour?: string | null;
  product_type?: string | null;
  quantity_box?: number | null;
  po_number: string;
  dc_number?: string | null;
  remarks?: string | null;
}

export default function SalesPage() {
  const [entries, setEntries] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [formData, setFormData] = useState({
    date: getToday(),
    customer_name: '',
    size_mm: '3',
    quantity: '',
    rate: '',
    colour: '',
    product_type: '',
    quantity_box: '',
    po_number: '',
    dc_number: '',
    remarks: '',
  });

  const sizes = [3, 4, 6, 8, 10, 15, 18, 20, 25, 30, 35, 40, 45, 50, 55];
  const COLOURS = ['Black', 'White', 'Other'];
  const PRODUCT_TYPES = ['Rubber Elastic', '840 Lycra', '840 Lycra Finishing', '1120 Lycra Finishing'];

  useEffect(() => {
    fetchSalesForDate(selectedDate);
    // Cleanup: clear loading and messages when component unmounts
    return () => {
      setLoading(false);
      setError(null);
      setSuccess(null);
    };
  }, []);

  useEffect(() => {
    fetchSalesForDate(selectedDate);
  }, [selectedDate]);

  const fetchSalesForDate = async (date: string) => {
    try {
      setLoading(true);
      const response = await salesAPI.getByDate(date);
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

  // Auto-sync form date with selected filter date
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDate,
    }));
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.quantity || !formData.rate || !formData.po_number) {
      setError('Please fill all required fields, including PO Number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await salesAPI.create({
        date: formData.date,
        customer_name: formData.customer_name,
        size_mm: parseInt(formData.size_mm),
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        colour: formData.colour || null,
        product_type: formData.product_type || null,
        quantity_box: formData.quantity_box ? parseFloat(formData.quantity_box) : null,
        po_number: formData.po_number,
        dc_number: formData.dc_number || null,
        remarks: formData.remarks || null,
      });

      if (response.data?.success) {
        setSuccess('Sales entry created successfully');
        setTimeout(() => setSuccess(null), 3000);
        setFormData({
          date: getToday(),
          customer_name: '',
          size_mm: '3',
          quantity: '',
          rate: '',
          colour: '',
          product_type: '',
          quantity_box: '',
          po_number: '',
          dc_number: '',
          remarks: '',
        });
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
    setSuccess('Sales entry deleted');
    setTimeout(() => setSuccess(null), 3000);

    try {
      await salesAPI.delete(id);
    } catch (err) {
      // Revert on error
      setEntries(previousEntries);
      setError(getErrorMessage(err));
      setSuccess(null);
    }
  };

  const handlePrint = () => {
    const printData = entries.map(entry => ({
      date: formatDateIndian(new Date(entry.date)),
      customer: entry.customer_name,
      po_number: entry.po_number || '-',
      size: entry.size_mm === 0 ? 'Unsize' : `${entry.size_mm} mm`,
      quantity: entry.quantity.toFixed(2),
      rate: formatCurrency(entry.rate),
      amount: formatCurrency(entry.amount),
      colour: entry.colour || '-',
    }));

    printTable('Sales History', printData, [
      { key: 'date', label: 'Date' },
      { key: 'customer', label: 'Customer' },
      { key: 'po_number', label: 'PO #' },
      { key: 'size', label: 'Size' },
      { key: 'quantity', label: 'Qty (m)' },
      { key: 'rate', label: 'Rate' },
      { key: 'amount', label: 'Amount' },
      { key: 'colour', label: 'Colour' },
    ]);
  };

  // Filter entries for today only
  const todayEntries = entries.filter(
    e => formatDateIndian(new Date(e.date)) === formatDateIndian(new Date())
  );

  const totalAmount = todayEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalQuantity = todayEntries.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Sales" subtitle="Product distribution to customers" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Showing sales for:</p>
              <p className="text-lg font-bold text-gray-900">{formatDateIndian(new Date(selectedDate))}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
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
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
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
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border rounded px-3 py-2 bg-white"
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
              <label className="block text-sm font-medium mb-1">Quantity (meters)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
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
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
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

            <div>
              <label className="block text-sm font-medium mb-1">Colour</label>
              <select
                name="colour"
                value={formData.colour}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Select Colour</option>
                {COLOURS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type of Product</label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Select Type</option>
                {PRODUCT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Qty (box)</label>
              <input
                type="number"
                name="quantity_box"
                value={formData.quantity_box}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PO Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="po_number"
                value={formData.po_number}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="PO Number"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">DC Number</label>
              <input
                type="text"
                name="dc_number"
                value={formData.dc_number}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="DC Number"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600">Date</p>
              <p className="text-lg font-bold text-blue-900">{formatDateIndian(new Date(selectedDate))}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600">Total Quantity (meters)</p>
              <p className="text-2xl font-bold text-blue-900">{formatIndianNumber(totalQuantity)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600">Entries</p>
              <p className="text-2xl font-bold text-purple-900">{entries.length}</p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-800">Sales Entries</h2>
            {entries.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition-colors whitespace-nowrap"
              >
                🖨️ Print
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                  <col style={{ width: '8.33%' }} />
                </colgroup>
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Customer</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">PO #</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">DC #</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Type / Colour</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Size</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Qty (m)</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Box</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Rate</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 text-gray-600 tabular-nums">{formatDateIndian(new Date(entry.date))}</td>
                      <td className="px-3 py-4 text-gray-800 font-medium">{entry.customer_name}</td>
                      <td className="px-3 py-4 text-gray-700 text-xs">{entry.po_number || '-'}</td>
                      <td className="text-center px-3 py-4 text-gray-700 text-xs">{entry.dc_number || '-'}</td>
                      <td className="px-3 py-4 text-gray-700 text-xs">
                        {entry.product_type || '-'} <br/>
                        <span className="text-gray-500">{entry.colour || '-'}</span>
                      </td>
                      <td className="text-center px-3 py-4 text-gray-700">{entry.size_mm === 0 ? 'Unsize' : `${entry.size_mm} mm`}</td>
                      <td className="text-center px-3 py-4 tabular-nums font-medium text-gray-700">{entry.quantity.toFixed(2)}</td>
                      <td className="text-center px-3 py-4 tabular-nums text-gray-600">{entry.quantity_box || '-'}</td>
                      <td className="text-center px-3 py-4 tabular-nums text-gray-600">{formatCurrency(entry.rate)}</td>
                      <td className="text-center px-3 py-4 tabular-nums font-bold text-gray-900">{formatCurrency(entry.amount)}</td>
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
