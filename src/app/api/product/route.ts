import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { StockService } from '@/services/stock.service';
import { startOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where: any = {};
    if (date) {
      const dayStart = startOfDay(new Date(date));
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      where.date = {
        gte: dayStart,
        lt: dayEnd,
      };
    }

    const data = await db.product.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, size_mm, quantity, remarks } = body;

    if (!date || !size_mm || !quantity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        date: new Date(date),
        size_mm: parseInt(size_mm),
        quantity: parseFloat(quantity),
        remarks: remarks || null,
      },
    });

    // Update stock for this size and date
    await StockService.recalculateStock(new Date(date), undefined, parseInt(size_mm));

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
