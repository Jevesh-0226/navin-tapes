import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { startOfDay } from 'date-fns';
import { getCacheHeaders, CACHE_DURATION } from '@/lib/cache-headers';

// Cache GET requests for 10 seconds
export const revalidate = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const materialId = searchParams.get('materialId');
    const size_mm = searchParams.get('size_mm');

    const where: any = {};

    if (date) {
      const dayStart = startOfDay(new Date(date));
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      where.date = {
        gte: dayStart,
        lt: dayEnd,
      };
    }

    if (materialId && materialId !== 'all') {
      where.materialId = parseInt(materialId, 10);
    }

    if (size_mm && size_mm !== 'all') {
      where.size_mm = parseInt(size_mm, 10);
    }

    const data = await db.stock.findMany({
      where: {
        ...where,
        OR: [
          { balance: { not: 0 } },
          { purchase: { not: 0 } },
          { production: { not: 0 } },
          { sales: { not: 0 } },
        ],
      },
      select: {
        id: true,
        date: true,
        materialId: true,
        size_mm: true,
        opening_stock: true,
        purchase: true,
        production: true,
        sales: true,
        balance: true,
        material: { select: { id: true, name: true } },
      },
      orderBy: [
        { date: 'desc' },
        { materialId: 'asc' },
        { size_mm: 'asc' },
      ],
    });

    const response = NextResponse.json({ success: true, data });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.SHORT}, s-maxage=${CACHE_DURATION.SHORT}`);
    return response;
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}
