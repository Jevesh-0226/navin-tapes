'use client';

import { useEffect } from 'react';

export default function DatabaseInitializer() {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Pre-fetch materials to trigger initialization if needed
        const response = await fetch('/api/material', { 
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Database initialized, materials loaded:', result.data?.length || 0);
        }
      } catch (error) {
        console.warn('Database initialization skipped:', error);
      }
    };

    // Run initialization on app startup
    initializeDatabase();
  }, []);

  return null;
}
