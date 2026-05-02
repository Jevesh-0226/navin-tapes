import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCacheHeaders, CACHE_DURATION } from '@/lib/cache-headers';

// Cache materials for 5 minutes since they rarely change
export const revalidate = 300;

export async function GET() {
  try {
    const data = await db.material.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    
    const response = NextResponse.json({ success: true, data });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.LONG}, s-maxage=${CACHE_DURATION.LONG}`);
    return response;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}
