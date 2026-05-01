'use client';

import { useEffect } from 'react';

export default function DatabaseInitializer() {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Call the initialization endpoint
        const response = await fetch('/api/init');
        const result = await response.json();
        
        if (result.success) {
          console.log('Database status:', result.database || result.message);
        } else {
          console.error('Initialization failed:', result.error);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  return null;
}
