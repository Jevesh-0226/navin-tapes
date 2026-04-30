'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  inventoryAPI,
  productionAPI,
  inwardAPI,
  getErrorMessage,
} from '@/lib/api-client';
import { getToday } from '@/lib/utils';

interface DashboardStats {
  todayInventoryCount: number;
  todayProductionCount: number;
  todayInwardCount: number;
  currentStockValue: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    todayInventoryCount: 0,
    todayProductionCount: 0,
    todayInwardCount: 0,
    currentStockValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getToday();

      const [
        inventoryRes,
        productionRes,
        inwardRes,
        currentStockRes,
      ] = await Promise.all([
        inventoryAPI.getByDate(today),
        productionAPI.getByDate(today),
        inwardAPI.getByDate(today),
        inventoryAPI.getCurrentStock(),
      ]);

      const currentStock = currentStockRes.data.data || [];
      const currentStockValue = currentStock.reduce((sum: number, item: { balance: number }) => sum + item.balance, 0);

      setStats({
        todayInventoryCount: inventoryRes.data.data?.length || 0,
        todayProductionCount: productionRes.data.data?.length || 0,
        todayInwardCount: inwardRes.data.data?.length || 0,
        currentStockValue,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      name: 'Purchase Entry',
      description: 'Record incoming raw materials and quality checks',
      href: '/inward',
      icon: '📦',
    },
    {
      name: 'Production Entry',
      description: 'Log daily production output and metrics',
      href: '/production',
      icon: '⚙️',
    },
    {
      name: 'Stocks',
      description: 'Track and manage daily stock balance',
      href: '/inventory',
      icon: '📈',
    },
  ];

  const features = [
    {
      title: 'Real-time Tracking',
      description: 'Monitor inventory and production in real time',
    },
    {
      title: 'Automatic Calculations',
      description: 'Stock balance automatically updated',
    },
    {
      title: 'Minimal Manual Work',
      description: 'Streamlined workflows for efficiency',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/inward"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Inward
            </Link>
            <Link
              href="/production"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Production
            </Link>
            <Link
              href="/inventory"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Stocks
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Inventory & Production Management
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Track stock, manage production, and monitor materials in real time.
          </p>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <span>✓ Simple</span>
            <span>•</span>
            <span>✓ Accurate</span>
            <span>•</span>
            <span>✓ Real-Time</span>
          </p>
        </section>

        {/* Quick Access Cards */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickAccessCards.map((card) => (
              <Link key={card.name} href={card.href}>
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{card.description}</p>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Open →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Info Section */}
        <section className="max-w-5xl mx-auto px-6 py-12 bg-slate-50 rounded-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            What makes this system work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Status (Optional) */}
        {!loading && !error && (
          <section className="max-w-5xl mx-auto px-6 py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Today's Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.currentStockValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700">Current Stock (m)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.todayProductionCount}
                  </div>
                  <div className="text-xs text-blue-700">Production Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.todayInwardCount}
                  </div>
                  <div className="text-xs text-blue-700">Inward Receipts</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {error && (
          <section className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={loadStats}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
