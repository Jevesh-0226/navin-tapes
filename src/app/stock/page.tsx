'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StockTable from '@/components/stock/StockTable';
import FilterBar from '@/components/stock/FilterBar';
import { getToday } from '@/lib/utils';

export default function StockLedgerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    date: getToday(),
    materialId: 'all',
    size_mm: 'all',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.materialId !== 'all') queryParams.append('materialId', filters.materialId);
      if (filters.size_mm !== 'all') queryParams.append('size_mm', filters.size_mm);

      const response = await fetch(`/api/stock?${queryParams.toString()}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/material');
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const rawMaterials = data.filter((item: any) => item.materialId !== null);
  const finishedProducts = data.filter((item: any) => item.size_mm !== null);

  const stats = {
    totalPurchase: rawMaterials.reduce((sum: number, item: any) => sum + (item.purchase || 0), 0),
    totalProduction: finishedProducts.reduce((sum: number, item: any) => sum + (item.production || 0), 0),
    netBalance: data.reduce((sum: number, item: any) => sum + (item.balance || 0), 0),
  };

  const getDisplayDate = () => {
    if (filters.date) {
      const date = new Date(filters.date);
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return 'Select a Date';
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-6xl px-6 py-6">
        <div className="bg-white border rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Stock Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time tracking of raw materials and finished tapes.</p>
            </div>

            <div className="bg-gray-100 px-3 py-1 rounded-md text-sm font-medium text-gray-600">
              Total Records: {data.length}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Material Inward ({getDisplayDate()})</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPurchase.toFixed(2)} kg</p>
            </div>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Tape Production ({getDisplayDate()})</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalProduction.toFixed(2)} m</p>
            </div>
          </div>

          <FilterBar
            filters={filters}
            setFilters={setFilters}
            materials={materials}
          />

          <div className="space-y-12 mt-8">
            {/* Section 1: Raw Materials */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 w-2 h-6 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Raw Material Stock</h2>
              </div>
              <StockTable data={rawMaterials} loading={loading} type="material" />
            </section>

            {/* Section 2: Finished Products */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 w-2 h-6 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Finished Product Stock (Tapes)</h2>
              </div>
              <StockTable data={finishedProducts} loading={loading} type="product" />
            </section>
          </div>

          <div className="flex justify-between mt-12 pt-6 border-t text-xs text-gray-400">
            <span>* Opening = Previous Day Closing Balance</span>
            <span>Generated at: {mounted ? new Date().toLocaleString() : 'Loading...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
