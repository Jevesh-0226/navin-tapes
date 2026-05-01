import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    // Check if materials already exist
    const existingMaterials = await db.material.count();
    
    if (existingMaterials > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already initialized',
        materialsCount: existingMaterials 
      });
    }

    // Create materials using upsert to avoid duplicates
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

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      materialsCreated: materials.length
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

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
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}
