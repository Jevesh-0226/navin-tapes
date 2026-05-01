import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

async function initializeIfNeeded() {
  try {
    const existingMaterials = await db.material.count();
    if (existingMaterials === 0) {
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
      console.log('Initialized materials');
    }
  } catch (error) {
    console.error('Error initializing materials:', error);
  }
}

export async function GET() {
  try {
    // Initialize if needed
    await initializeIfNeeded();

    const data = await db.material.findMany({
      orderBy: { name: 'asc' },
    });
    console.log(`[API] Material endpoint called. Found ${data.length} materials`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Material endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}
