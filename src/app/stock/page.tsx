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
      // Assuming there's a material API or we can get them from some other endpoint
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

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory tracking for factory operations.</p>
        </div>
        
        <div className="flex gap-2">
           {/* Placeholder for any top-right actions like Export if needed later */}
           <div className="bg-white border border-gray-200 rounded px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
             Total Records: {data.length}
           </div>
        </div>
      </div>

      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        materials={materials} 
      />

      <div className="shadow-sm rounded-md overflow-hidden bg-white border border-gray-200">
        <StockTable data={data} loading={loading} />
      </div>

      <div className="mt-4 text-[11px] text-gray-400 flex justify-between px-1 italic">
        <span>* Opening = Previous Day Closing Balance</span>
        <span>Generated at: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
