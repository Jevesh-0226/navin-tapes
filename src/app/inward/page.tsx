'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Table from '@/components/Table';
import { inwardAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface Inward {
  id: number;
  date: string;
  invoice_no: string;
  supplier: string;
  material: { id: number; name: string; created_at: string; updated_at: string } | string;
  quantity_kg: number;
  quantity_box?: number;
  packing_ok: boolean;
  winding_uneven: boolean;
  colour_shade_ok: boolean;
  dnk_og_ok: boolean;
  stain: boolean;
  strength_ok: boolean;
  stretchability_ok: boolean;
  remarks: string;
}

export default function InwardPage() {
  const [entries, setEntries] = useState<Inward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    invoice_no: '',
    supplier: '',
    material: '',
    quantity_kg: '',
    quantity_box: '',
    packing_ok: true,
    winding_uneven: false,
    colour_shade_ok: true,
    dnk_og_ok: true,
    stain: false,
    strength_ok: true,
    stretchability_ok: true,
    remarks: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await inwardAPI.getAll();
      setEntries(response.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const countQCDefects = () => {
    let count = 0;
    if (!formData.packing_ok) count++;
    if (formData.winding_uneven) count++;
    if (!formData.colour_shade_ok) count++;
    if (!formData.dnk_og_ok) count++;
    if (formData.stain) count++;
    if (!formData.strength_ok) count++;
    if (!formData.stretchability_ok) count++;
    return count;
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.invoice_no || !formData.supplier) {
      setError('Invoice and supplier are required');
      return;
    }

    try {
      const response = await inwardAPI.create({
        date: formData.date,
        invoice_no: formData.invoice_no,
        supplier: formData.supplier,
        material: formData.material,
        quantity_kg: parseFloat(formData.quantity_kg) || 0,
        quantity_box: formData.quantity_box ? parseFloat(formData.quantity_box) : undefined,
        packing_ok: formData.packing_ok,
        winding_uneven: formData.winding_uneven,
        colour_shade_ok: formData.colour_shade_ok,
        dnk_og_ok: formData.dnk_og_ok,
        stain: formData.stain,
        strength_ok: formData.strength_ok,
        stretchability_ok: formData.stretchability_ok,
        remarks: formData.remarks,
      });

      setEntries([...entries, response.data.data]);
      setSuccess('Entry added successfully');
      setFormData({
        date: getToday(),
        invoice_no: '',
        supplier: '',
        material: '',
        quantity_kg: '',
        quantity_box: '',
        packing_ok: true,
        winding_uneven: false,
        colour_shade_ok: true,
        dnk_og_ok: true,
        stain: false,
        strength_ok: true,
        stretchability_ok: true,
        remarks: '',
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
      await inwardAPI.delete(id);
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
  const totalQuantity = todayEntries.reduce((sum, e) => sum + e.quantity_kg, 0);
  const qcIssues = todayEntries.filter(e => {
    return !e.packing_ok || e.winding_uneven || !e.colour_shade_ok || !e.dnk_og_ok || 
           e.stain || !e.strength_ok || !e.stretchability_ok;
  }).length;
  const passRate = todayEntries.length > 0 ? (((todayEntries.length - qcIssues) / todayEntries.length) * 100).toFixed(0) : 0;

  return (
    <div>
      <TopBar title="Inward Entry" subtitle="Track material receipts and QC" />

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
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Add Inward Entry</h2>

            <form onSubmit={handleAddEntry} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Invoice *</label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_no}
                    onChange={e => setFormData({ ...formData, invoice_no: e.target.value })}
                    placeholder="Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Supplier *</label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity_kg}
                    onChange={e => setFormData({ ...formData, quantity_kg: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Quantity (Box)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity_box}
                    onChange={e => setFormData({ ...formData, quantity_box: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* QC Checks */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-3">QC Checks (7-point)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.packing_ok}
                      onChange={e => setFormData({ ...formData, packing_ok: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Packing ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.winding_uneven}
                      onChange={e => setFormData({ ...formData, winding_uneven: !e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Winding ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.colour_shade_ok}
                      onChange={e => setFormData({ ...formData, colour_shade_ok: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Colour ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dnk_og_ok}
                      onChange={e => setFormData({ ...formData, dnk_og_ok: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">DNK-OG ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.stain}
                      onChange={e => setFormData({ ...formData, stain: !e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">No Stain ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.strength_ok}
                      onChange={e => setFormData({ ...formData, strength_ok: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Strength ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stretchability_ok}
                      onChange={e => setFormData({ ...formData, stretchability_ok: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Stretch ✓</span>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status and Submit */}
              <div className="flex items-center justify-between">
                <div className={`text-xs font-semibold px-3 py-2 rounded ${countQCDefects() === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  QC Issues: {countQCDefects()}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md text-sm transition-colors"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Quantity</div>
              <div className="text-3xl font-bold text-slate-900">{totalQuantity.toFixed(1)} kg</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">QC Issues</div>
              <div className="text-3xl font-bold text-red-600">{qcIssues}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Pass Rate</div>
              <div className="text-3xl font-bold text-green-600">{passRate}%</div>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table
              columns={[
                { key: 'date', label: 'Date', width: '110px', align: 'left', render: (v) => formatDate(v) },
                { key: 'invoice_no', label: 'Invoice', width: '100px', align: 'left' },
                { key: 'supplier', label: 'Supplier', width: '120px', align: 'left' },
                { key: 'material', label: 'Material', width: '100px', align: 'left', render: (v) => (typeof v === 'object' ? v.name : v) },
                { key: 'quantity_kg', label: 'Qty (kg)', width: '90px', align: 'left', render: (v) => v.toFixed(1) },
                {
                  key: 'qc_status',
                  label: 'QC Status',
                  width: '100px',
                  align: 'left',
                  render: (v, row: Inward) => {
                    const hasFail = !row.packing_ok || row.winding_uneven || !row.colour_shade_ok || 
                                    !row.dnk_og_ok || row.stain || !row.strength_ok || !row.stretchability_ok;
                    return hasFail ? <span className="text-red-600 font-medium text-xs">✗ Fail</span> : <span className="text-green-600 font-medium text-xs">✓ Pass</span>;
                  },
                },
                { key: 'remarks', label: 'Remarks', width: '150px', align: 'left', render: (v) => (v ? <span className="truncate text-xs">{v}</span> : '-') },
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
