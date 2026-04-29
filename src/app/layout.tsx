import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Navin Tapes Manufacturing System',
  description: 'Real-time inventory and production management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main */}
            <main className="flex-1 overflow-y-auto">{children}</main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-500">
              <p>Navin Tapes Manufacturing System • Real-Time Inventory & Production</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
