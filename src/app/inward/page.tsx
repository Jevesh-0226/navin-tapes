'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InwardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to purchase page
    router.replace('/purchase');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-600 mb-2">Redirecting to Purchase page...</p>
        <p className="text-sm text-gray-500">This page has been renamed from "Inward" to "Purchase"</p>
      </div>
    </div>
  );
}
