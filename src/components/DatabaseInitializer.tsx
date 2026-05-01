'use client';

import { useEffect } from 'react';

export default function DatabaseInitializer() {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Check database status first
        const statusResponse = await fetch('/api/init', { 
          cache: 'no-store'
        });
        
        const statusResult = await statusResponse.json();
        
        if (!statusResult.success || statusResult.database?.materials === 0) {
          console.log('Database not initialized, initializing...');
          // Initialize database
          const initResponse = await fetch('/api/init', { 
            method: 'POST',
            cache: 'no-store'
          });
          
          const initResult = await initResponse.json();
          if (initResult.success) {
            console.log('Database initialized:', initResult.message);
          } else {
            console.error('Database initialization failed:', initResult.error);
          }
        } else {
          console.log('Database ready:', statusResult.database);
        }
      } catch (error) {
        console.warn('Database initialization check failed:', error);
      }
    };

    // Run initialization on app startup (with delay to allow page to load)
    const timer = setTimeout(initializeDatabase, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
