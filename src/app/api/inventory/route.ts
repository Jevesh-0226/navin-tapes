import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/inventory.service';
import { ZodError } from 'zod';
import { z } from 'zod';

const createStockSchema = z.object({
  date: z.string().datetime(),
  materialId: z.number().int().optional(),
  size_mm: z.number().int().optional(),
  opening_stock: z.number().default(0),
  purchase: z.number().default(0),
  production: z.number().default(0),
  sales: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const size = searchParams.get('size');
    const report = searchParams.get('report');
    const current = searchParams.get('current');

    // Get current stock
    if (current === 'true') {
      const data = await stockService.getCurrent();
      return NextResponse.json({ success: true, data });
    }

    // Get stock report for date range
    if (report) {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate and endDate required for report',
          },
          { status: 400 }
        );
      }

      const data = await stockService.getReport(
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({ success: true, data });
    }

    // Get stock for specific date
    if (date) {
      const data = await stockService.getByDate(new Date(date));
      return NextResponse.json({ success: true, data });
    }

    // Get stock for specific size
    if (size) {
      const data = await stockService.getBySize(parseInt(size, 10));
      return NextResponse.json({ success: true, data });
    }

    // Get all stock
    const data = await stockService.getAll();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createStockSchema.parse(body);
    const data = await stockService.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Stock entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stock:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create stock entry' },
      { status: 500 }
    );
  }
}
