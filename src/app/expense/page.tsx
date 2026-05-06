'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { getToday, formatDateIndian, formatCurrency, printTable } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api-client';

interface Expense {
  id: number;
  date: string;
  name: string;
  amount: number;
  created_at?: string;
}

export default function ExpensePage() {
  const [entries, setEntries] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: getToday(),
    name: '',
    amount: '',
  });
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExpensesByDate(getToday());
  }, []);

  useEffect(() => {
    fetchExpensesByDate(selectedDate);
  }, [selectedDate]);

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const fetchExpensesByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      // Format the date properly for the API
      const response = await fetch(`/api/expense?date=${encodeURIComponent(date)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setEntries(result.data);
        setError(null);
      } else {
        setEntries([]);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(getErrorMessage(err));
      setEntries([]);
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

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchExpensesByDate(date);
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

    if (!formData.date || !formData.name || !formData.amount) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = editingId ? `/api/expense/${editingId}` : '/api/expense';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          name: formData.name,
          amount: parseFloat(formData.amount),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingId ? 'Expense updated successfully' : 'Expense created successfully');
        setTimeout(() => setSuccess(null), 3000);
        setFormData({
          date: getToday(),
          name: '',
          amount: '',
        });
        setEditingId(null);
        // Refetch data
        await fetchExpensesByDate(selectedDate);
      } else {
        setError(result.error || 'Failed to save expense');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: expense.date.split('T')[0],
      name: expense.name,
      amount: expense.amount.toString(),
    });
    setEditingId(expense.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({
      date: getToday(),
      name: '',
      amount: '',
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const previousEntries = entries;
    setEntries(entries.filter(e => e.id !== id));
    setSuccess('Expense deleted');
    setTimeout(() => setSuccess(null), 3000);

    try {
      const response = await fetch(`/api/expense/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!result.success) {
        // Revert on error
        setEntries(previousEntries);
        setError(result.error || 'Failed to delete expense');
        setSuccess(null);
      }
    } catch (err) {
      // Revert on error
      setEntries(previousEntries);
      setError(getErrorMessage(err));
      setSuccess(null);
    }
  };

  const handlePrint = () => {
    const printData = entries.map(entry => ({
      date: formatDateIndian(entry.date),
      name: entry.name,
      amount: formatCurrency(entry.amount),
    }));

    printTable('Expense Report', printData, [
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Expense Name' },
      { key: 'amount', label: 'Amount' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Daily Expense" subtitle="Track daily expenses" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {editingId ? 'Edit Expense' : 'New Expense Entry'}
          </h2>

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
              <label className="block text-sm font-medium mb-1 text-gray-700">Expense Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Office Supplies"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600">Showing expenses for:</p>
              <p className="text-lg font-bold text-blue-900">{formatDateIndian(new Date(selectedDate))}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">Total Expenses</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-800">Expense History</h2>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No expenses recorded for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Expense Name</th>
                    <th className="text-right px-6 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 tabular-nums">{formatDateIndian(entry.date)}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{entry.name}</td>
                      <td className="text-right px-6 py-4 tabular-nums font-bold text-gray-800">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="text-center px-6 py-4 space-x-3">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                        >
                          Edit
                        </button>
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
