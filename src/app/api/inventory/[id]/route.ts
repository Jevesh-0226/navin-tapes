import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/inventory.service';
import { ZodError } from 'zod';
import { z } from 'zod';

const updateStockSchema = z.object({
  date: z.string().datetime().optional(),
  materialId: z.number().int().optional().nullable(),
  size_mm: z.number().int().optional().nullable(),
  opening_stock: z.number().optional(),
  purchase: z.number().optional(),
  production: z.number().optional(),
  sales: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = parseInt(id, 10);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stock ID' },
        { status: 400 }
      );
    }

    const data = await stockService.getById(stockId);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Stock entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = parseInt(id, 10);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stock ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateStockSchema.parse(body);

    const data = await stockService.update(stockId, validatedData);

    return NextResponse.json({
      success: true,
      data,
      message: 'Stock entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating stock:', error);

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
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Stock entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update stock entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = parseInt(id, 10);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stock ID' },
        { status: 400 }
      );
    }

    await stockService.delete(stockId);

    return NextResponse.json({
      success: true,
      message: 'Stock entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting stock:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete stock entry' },
      { status: 500 }
    );
  }
}
