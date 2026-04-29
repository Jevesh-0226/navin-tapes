'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Table from '@/components/Table';
import { inventoryAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDate } from '@/lib/utils';

interface InventoryLedger {
  id: number;
  date: string;
  material: { id: number; name: string; created_at: string; updated_at: string } | string;
  size_mm: number;
  opening_stock: number;
  inward: number;
  production: number;
  delivery: number;
  balance: number;
}

export default function InventoryPage() {
  const [ledgers, setLedgers] = useState<InventoryLedger[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(getToday());

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
      const invRes = await inventoryAPI.getAll();
      setLedgers(invRes.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDay = async () => {
    setError(null);
    try {
      const response = await inventoryAPI.initializeDay(selectedDate);
      setLedgers(response.data.data || []);
      setSuccess('Day initialized successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAggregateProduction = async () => {
    setError(null);
    try {
      const response = await inventoryAPI.aggregateProduction(selectedDate);
      setLedgers(response.data.data || []);
      setSuccess('Production aggregated');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateDelivery = async (id: number, delivery: number) => {
    try {
      const response = await inventoryAPI.update(id, { delivery });
      setLedgers(ledgers.map(l => (l.id === id ? response.data.data : l)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const selectedDateLedgers = ledgers.filter(l => l.date === selectedDate);
  const totalBalance = selectedDateLedgers.reduce((sum, l) => sum + l.balance, 0);

  const uniqueMaterials = Array.from(new Set(selectedDateLedgers.map(l => 'All')));

  return (
    <div>
      <TopBar
        title="Stocks"
        subtitle="Daily stock tracking and delivery management"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleInitializeDay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors"
              title="Initialize day - creates entries for all products"
            >
              Initialize
            </button>
            <button
              onClick={handleAggregateProduction}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-sm transition-colors"
              title="Sum all production entries for today"
            >
              Aggregate
            </button>
          </div>
        }
      />

      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
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

          {/* Total Balance Card */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-600 mb-2">Total Stock Balance for {formatDate(selectedDate)}</div>
            <div className="text-4xl font-bold text-blue-600">{totalBalance.toLocaleString()} m</div>
            <div className="text-xs text-slate-500 mt-2">Across all products</div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th style={{ minWidth: '100px' }} className="px-5 py-3 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex justify-start items-center">Size (mm)</div>
                    </th>
                    <th style={{ minWidth: '100px' }} className="px-5 py-3 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex justify-start items-center">Opening</div>
                    </th>
                    <th style={{ minWidth: '90px' }} className="px-5 py-3 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex justify-start items-center">Inward</div>
                    </th>
                    <th style={{ minWidth: '100px' }} className="px-5 py-3 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex justify-start items-center">Production</div>
                    </th>
                    <th style={{ minWidth: '95px' }} className="px-5 py-3 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex justify-start items-center">Delivery</div>
                    </th>
                    <th style={{ minWidth: '100px' }} className="px-5 py-3 font-semibold text-slate-900 bg-blue-50 border-r border-slate-200">
                      <div className="flex justify-start items-center">Balance</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No inventory entries. Click "Initialize" to create entries for all products.
                      </td>
                    </tr>
                  ) : (
                    selectedDateLedgers.map(ledger => (
                      <tr key={ledger.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td style={{ minWidth: '100px' }} className="px-5 py-3 font-medium text-slate-900 border-r border-slate-100">
                          <div className="flex justify-start items-center">{ledger.size_mm}mm</div>
                        </td>
                        <td style={{ minWidth: '100px' }} className="px-5 py-3 text-slate-700 border-r border-slate-100">
                          <div className="flex justify-end items-center">{ledger.opening_stock.toLocaleString()}</div>
                        </td>
                        <td style={{ minWidth: '90px' }} className="px-5 py-3 text-slate-700 border-r border-slate-100">
                          <div className="flex justify-end items-center">{ledger.inward.toLocaleString()}</div>
                        </td>
                        <td style={{ minWidth: '100px' }} className="px-5 py-3 text-slate-700 border-r border-slate-100">
                          <div className="flex justify-end items-center">{ledger.production.toLocaleString()}</div>
                        </td>
                        <td style={{ minWidth: '95px' }} className="px-5 py-3 border-r border-slate-100">
                          <div className="flex justify-end items-center">
                            <input
                              type="number"
                              value={ledger.delivery}
                              onChange={e => {
                                const newVal = parseFloat(e.target.value) || 0;
                                handleUpdateDelivery(ledger.id, newVal);
                              }}
                              placeholder="0"
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-right focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </td>
                        <td style={{ minWidth: '100px' }} className="px-5 py-3 font-bold text-blue-600 bg-blue-50 border-r border-slate-200">
                          <div className="flex justify-end items-center">{ledger.balance.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-3">Formula</div>
            <div className="text-sm text-slate-600 space-y-1">
              <div><strong>Balance</strong> = Opening + Inward + Production - Delivery</div>
              <div><strong>Opening</strong> is auto-filled from previous day's balance</div>
              <div><strong>Inward</strong> is summed from inward receipts for this date</div>
              <div><strong>Production</strong> is summed from all production entries for this date and size</div>
              <div><strong>Delivery</strong> is entered here - balance auto-updates instantly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
