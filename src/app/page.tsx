'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  purchaseAPI,
  productAPI,
  salesAPI,
  stockAPI,
  getErrorMessage,
} from '@/lib/api-client';
import { getToday } from '@/lib/utils';

interface DashboardStats {
  todayPurchaseCount: number;
  todayProductCount: number;
  todaySalesCount: number;
  totalStockRecords: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    todayPurchaseCount: 0,
    todayProductCount: 0,
    todaySalesCount: 0,
    totalStockRecords: 0,
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
        purchaseRes,
        productRes,
        salesRes,
        stockRes,
      ] = await Promise.all([
        purchaseAPI.getByDate(today),
        productAPI.getByDate(today),
        salesAPI.getByDate(today),
        stockAPI.getByDate(today),
      ]);

      setStats({
        todayPurchaseCount: purchaseRes.data?.data?.length || 0,
        todayProductCount: productRes.data?.data?.length || 0,
        todaySalesCount: salesRes.data?.data?.length || 0,
        totalStockRecords: stockRes.data?.data?.length || 0,
      });
    } catch (err) {
      console.error('Stats error:', err);
      // Fallback if APIs fail
      setStats({
        todayPurchaseCount: 0,
        todayProductCount: 0,
        todaySalesCount: 0,
        totalStockRecords: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      name: 'Purchase',
      description: 'Record incoming raw materials and quality checks',
      href: '/purchase',
      icon: '📦',
    },
    {
      name: 'Order',
      description: 'Customer orders and tracking',
      href: '/order',
      icon: '📝',
    },
    {
      name: 'Product',
      description: 'Log finished goods manufacturing output',
      href: '/product',
      icon: '⚙️',
    },
    {
      name: 'Sales',
      description: 'Record product distribution to customers',
      href: '/sales',
      icon: '💰',
    },
    {
      name: 'Stock',
      description: 'Track and manage daily stock balance',
      href: '/stock',
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
              href="/purchase"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Purchase
            </Link>
            <Link
              href="/order"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Order
            </Link>
            <Link
              href="/product"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Product
            </Link>
            <Link
              href="/sales"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Sales
            </Link>
            <Link
              href="/stock"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Stock
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

        {/* System Status - Excel Format Table */}
        {!loading && !error && (
          <section className="max-w-5xl mx-auto px-6 py-12">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                <div className="w-2 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Today's Activity Report</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase border-b">
                    <tr>
                      <th className="px-6 py-4 text-center border-r border-gray-200 last:border-r-0">Material Purchases</th>
                      <th className="px-6 py-4 text-center border-r border-gray-200 last:border-r-0">Tape Production</th>
                      <th className="px-6 py-4 text-center border-r border-gray-200 last:border-r-0">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    <tr>
                      <td className="px-6 py-8 text-center border-r border-gray-200 last:border-r-0">
                        <div className="text-4xl font-bold tabular-nums">{stats.todayPurchaseCount}</div>
                        <div className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest text-center">Entries Today</div>
                      </td>
                      <td className="px-6 py-8 text-center border-r border-gray-200 last:border-r-0">
                        <div className="text-4xl font-bold tabular-nums text-blue-600">{stats.todayProductCount}</div>
                        <div className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest text-center">Batches Today</div>
                      </td>
                      <td className="px-6 py-8 text-center border-r border-gray-200 last:border-r-0">
                        <div className="text-4xl font-bold tabular-nums text-green-600">{stats.todaySalesCount}</div>
                        <div className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest text-center">Sales Logged</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
