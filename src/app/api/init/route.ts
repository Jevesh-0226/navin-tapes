import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const maxDuration = 300; // Allow up to 5 minutes for initialization

/**
 * Manual initialization endpoint
 * POST /api/init to initialize the database
 * GET /api/init to check status
 * 
 * Usage: curl -X POST https://your-deployed-app.vercel.app/api/init
 */

export async function GET() {
  try {
    const materialsCount = await db.material.count();
    const purchaseCount = await db.purchase.count();
    const salesCount = await db.sales.count();
    const productCount = await db.product.count();

    return NextResponse.json({ 
      success: true, 
      database: {
        materials: materialsCount,
        purchases: purchaseCount,
        sales: salesCount,
        products: productCount
      },
      message: materialsCount === 0 ? 'Database not initialized. POST to /api/init to initialize.' : 'Database is initialized.'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Status check error:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to check database status', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('Starting database initialization...');

    // Check if already initialized
    const existingMaterials = await db.material.count();
    
    if (existingMaterials > 0) {
      console.log('Database already initialized');
      return NextResponse.json({ 
        success: true, 
        message: 'Database already initialized',
        materialsCount: existingMaterials 
      });
    }

    console.log('Creating materials...');
    const materials = [
      { name: "Lycra" },
      { name: "Rubber" },
      { name: "Cotton" },
      { name: "Polyester" },
      { name: "Nylon" }
    ];

    for (const material of materials) {
      await db.material.upsert({
        where: { name: material.name },
        update: {},
        create: material,
      });
    }

    console.log('Materials created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      materialsCreated: materials.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Initialization error:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database', details: errorMessage },
      { status: 500 }
    );
  }
}

