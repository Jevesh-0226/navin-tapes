'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Table from '@/components/Table';
import { productionAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface Production {
  id: number;
  date: string;
  operator_name: string;
  material: { id: number; name: string; created_at: string; updated_at: string } | string;
  size_mm: number;
  tapes: number;
  meters_per_tape: number;
  total_production: number;
  needle_break: number;
  remark?: string;
}

export default function ProductionPage() {
  const [entries, setEntries] = useState<Production[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    operator_name: '',
    material: '',
    size_mm: '',
    tapes: '',
    meters_per_tape: '',
    needle_break: 0,
    remark: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const prodRes = await productionAPI.getAll();
      setEntries(prodRes.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const tapes = parseFloat(formData.tapes) || 0;
    const metersPerTape = parseFloat(formData.meters_per_tape) || 0;
    return (tapes * metersPerTape).toFixed(2);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.operator_name || !formData.size_mm) {
      setError('Operator and size are required');
      return;
    }

    try {
      const response = await productionAPI.create({
        date: formData.date,
        operator_name: formData.operator_name,
        material: formData.material,
        size_mm: parseFloat(formData.size_mm),
        tapes: parseFloat(formData.tapes) || 0,
        meters_per_tape: parseFloat(formData.meters_per_tape) || 0,
        needle_break: formData.needle_break || 0,
        remark: formData.remark || undefined,
      });

      setEntries([...entries, response.data.data]);
      setSuccess('Entry added successfully');
      setFormData({
        date: getToday(),
        operator_name: '',
        material: '',
        size_mm: '',
        tapes: '',
        meters_per_tape: '',
        needle_break: 0,
        remark: '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Delete this entry?')) return;

    setError(null);
    setLoading(true);

    try {
      await productionAPI.delete(id);
      setEntries(prevEntries => prevEntries.filter(e => e.id !== id));
      setSuccess('Entry deleted successfully');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg || 'Failed to delete entry');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayEntries = entries.filter(e => e.date === formData.date);
  const totalTapes = todayEntries.reduce((sum, e) => sum + e.tapes, 0);
  const totalProduction = todayEntries.reduce((sum, e) => sum + e.total_production, 0);
  const totalNeedleBreaks = todayEntries.reduce((sum, e) => sum + e.needle_break, 0);

  return (
    <div>
      <TopBar title="Production Entry" subtitle="Log daily production output" />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}

          {/* Entry Form */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Add Production Entry</h2>

            <form onSubmit={handleAddEntry} className="space-y-6">
              {/* Form Grid - 2 cols on mobile, 3 cols on medium+ */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Operator *</label>
                  <input
                    type="text"
                    required
                    value={formData.operator_name}
                    onChange={e => setFormData({ ...formData, operator_name: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Size (mm) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.size_mm}
                    onChange={e => setFormData({ ...formData, size_mm: e.target.value })}
                    placeholder="e.g., 12, 18.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* No. of Tapes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">No. of Tapes</label>
                  <input
                    type="number"
                    value={formData.tapes}
                    onChange={e => setFormData({ ...formData, tapes: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Meter per Tape */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Meter per Tape</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.meters_per_tape}
                    onChange={e => setFormData({ ...formData, meters_per_tape: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Needle Break */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Needle Break</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.needle_break}
                    onChange={e => setFormData({ ...formData, needle_break: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Remark Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Remark</label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="Optional remarks or notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total and Button Row */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Total (m)</label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-lg font-semibold text-blue-700">
                    {calculateTotal()}
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Tapes</div>
              <div className="text-3xl font-bold text-slate-900">{totalTapes.toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Production (m)</div>
              <div className="text-3xl font-bold text-slate-900">{totalProduction.toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Needle Breaks</div>
              <div className="text-3xl font-bold text-red-600">{totalNeedleBreaks}</div>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <Table
              columns={[
                { key: 'date', label: 'Date', width: '128px', align: 'left', render: (v) => formatDate(v) },
                { key: 'operator_name', label: 'Operator', width: '130px', align: 'left' },
                { key: 'material', label: 'Material', width: '100px', align: 'left', render: (v) => (typeof v === 'object' ? v.name : v) },
                { key: 'size_mm', label: 'Size (mm)', width: '80px', align: 'left' },
                { key: 'tapes', label: 'Tapes', width: '80px', align: 'left' },
                { key: 'meters_per_tape', label: 'm/Tape', width: '96px', align: 'left', render: (v) => v.toFixed(2) },
                { key: 'total_production', label: 'Total (m)', width: '112px', align: 'left', render: (v) => v.toLocaleString() },
                { key: 'needle_break', label: 'Break', width: '70px', align: 'left', render: (v) => (v > 0 ? v : '-') },
              ]}
              data={entries}
              loading={loading}
              empty="No entries yet."
              compact={true}
              actions={(entry) => (
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
