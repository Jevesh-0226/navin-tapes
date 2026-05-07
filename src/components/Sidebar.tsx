'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Purchase', href: '/purchase' },
  { label: 'Order', href: '/order' },
  { label: 'Product', href: '/product' },
  { label: 'Sales', href: '/sales' },
  { label: 'Stock', href: '/stock' },
  { label: 'Expense', href: '/expense' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/">
          <div className="text-lg font-semibold tracking-tight text-slate-900">
            Navin Tapes
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigationItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors border-l-4 ${isActive
                  ? 'bg-slate-100 text-slate-900 font-bold border-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
                }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50 mx-4 mb-4 rounded-lg">
        <div className="text-xs text-slate-600">
          <div className="font-semibold text-slate-900 mb-1">Today</div>
          <div>{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>
    </aside>
  );
}
