'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StockTable from '@/components/stock/StockTable';
import FilterBar from '@/components/stock/FilterBar';

export default function StockLedgerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
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

  const stats = {
    totalPurchase: data.reduce((sum: number, item: any) => sum + (item.purchase || 0), 0),
    totalSales: data.reduce((sum: number, item: any) => sum + (item.sales || 0), 0),
    netBalance: data.reduce((sum: number, item: any) => sum + (item.balance || 0), 0),
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-6xl px-6 py-6">
        <div className="bg-white border rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Stock</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time inventory tracking for factory operations.</p>
            </div>

            <div className="bg-gray-100 px-3 py-1 rounded-md text-sm font-medium text-gray-600">
              Total Records: {data.length}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Purchase Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPurchase.toFixed(2)}</p>
            </div>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Sales Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.netBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <FilterBar
            filters={filters}
            setFilters={setFilters}
            materials={materials}
          />

          <div className="mt-4 border rounded-md overflow-hidden bg-white">
            <StockTable data={data} loading={loading} />
          </div>

          <div className="flex justify-between mt-6 text-xs text-gray-400">
            <span>* Opening = Previous Day Closing Balance</span>
            <span>Generated at: {mounted ? new Date().toLocaleString() : 'Loading...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
