'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { getToday, formatDateIndian, formatCurrency, printTable } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api-client';
import { handleEnterNavigation } from '@/lib/form-nav';

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
  
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [formData, setFormData] = useState({
    date: getToday(),
    name: '',
    amount: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExpensesByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const fetchExpensesByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/expense?date=${encodeURIComponent(date)}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setEntries(result.data);
      } else {
        setEntries([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          name: formData.name,
          amount: parseFloat(formData.amount),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(editingId ? 'Expense updated' : 'Expense added');
        setTimeout(() => setSuccess(null), 3000);
        setFormData({ date: selectedDate, name: '', amount: '' });
        setEditingId(null);
        fetchExpensesByDate(selectedDate);
      } else {
        setError(result.error || 'Failed to save');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const response = await fetch(`/api/expense/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setEntries(entries.filter(e => e.id !== id));
        setSuccess('Deleted');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handlePrint = () => {
    const printData = entries.map(entry => ({
      date: formatDateIndian(entry.date),
      name: entry.name,
      amount: formatCurrency(entry.amount),
    }));
    printTable(`Expense Report - ${formatDateIndian(selectedDate)}`, printData, [
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Expense' },
      { key: 'amount', label: 'Amount' },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar title="Daily Expense" subtitle="Track and manage business expenses" />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">View Date</p>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="text-xl font-bold text-slate-900 border-none focus:ring-0 p-0 cursor-pointer bg-transparent w-full" 
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{entries.length} Entries</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* New Expense Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Expense' : 'New Expense Entry'}</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight">Record business expenditure</p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{success}</div>}

            <form onSubmit={handleSubmit} onKeyDown={handleEnterNavigation} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Expense Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Office Supplies" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all outline-none text-slate-900" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleInputChange} 
                  placeholder="0.00" 
                  step="0.01" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all outline-none font-semibold text-slate-900" 
                  required 
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
                >
                  {loading ? 'Processing...' : editingId ? 'Update Entry' : 'Add Expense'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingId(null); setFormData({ date: selectedDate, name: '', amount: '' }); }} 
                    className="px-6 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Expense History Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Expense History</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{formatDateIndian(selectedDate)}</p>
              </div>
              {entries.length > 0 && (
                <button 
                  onClick={handlePrint} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-bold transition-all shadow-sm flex items-center gap-2 uppercase tracking-widest"
                >
                  Print Report
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="py-20 text-center px-6">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-widest">No Records Found</h3>
                <p className="text-slate-400 text-sm mt-2">No expense entries have been logged for this date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                      <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.map(entry => (
                      <tr key={entry.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium tabular-nums">{formatDateIndian(entry.date)}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{entry.name}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 tabular-nums text-base">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(entry)} 
                              className="text-slate-900 hover:underline font-bold text-[10px] uppercase tracking-widest"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(entry.id)} 
                              className="text-red-600 hover:underline font-bold text-[10px] uppercase tracking-widest"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
