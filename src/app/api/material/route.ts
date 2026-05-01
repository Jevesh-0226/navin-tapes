import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const data = await db.material.findMany({
      orderBy: { name: 'asc' },
    });
    console.log(`[API] Material endpoint called. Found ${data.length} materials`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API] Material endpoint error:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch materials', details: errorMessage },
      { status: 500 }
    );
  }
}
