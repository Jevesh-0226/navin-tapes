import { NextRequest, NextResponse } from 'next/server';
import { salesService } from '@/services/sales.service';
import { ZodError } from 'zod';
import { z } from 'zod';

const updateSalesSchema = z.object({
  date: z.string().datetime().optional(),
  customer_name: z.string().min(1).optional(),
  size_mm: z.number().int().positive().optional(),
  quantity: z.number().positive().optional(),
  rate: z.number().positive().optional(),
  remarks: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const salesId = parseInt(id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sales ID' },
        { status: 400 }
      );
    }

    const data = await salesService.getById(salesId);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Sales entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales entry' },
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
    const salesId = parseInt(id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sales ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSalesSchema.parse(body);

    const data = await salesService.update(salesId, validatedData);

    return NextResponse.json({
      success: true,
      data,
      message: 'Sales entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating sales:', error);

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
          { success: false, error: 'Sales entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update sales entry' },
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
    const salesId = parseInt(id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sales ID' },
        { status: 400 }
      );
    }

    await salesService.delete(salesId);

    return NextResponse.json({
      success: true,
      message: 'Sales entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sales:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete sales entry' },
      { status: 500 }
    );
  }
}
