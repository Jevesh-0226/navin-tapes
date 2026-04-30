import { NextRequest, NextResponse } from 'next/server';
import { purchaseService } from '@/services/purchase.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = parseInt(id, 10);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase ID' },
        { status: 400 }
      );
    }

    const data = await purchaseService.getById(purchaseId);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Purchase entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase entry' },
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
    const purchaseId = parseInt(id, 10);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input (all fields optional for update)
    const validatedData = createInwardSchema.partial().parse(body);

    const data = await purchaseService.update(purchaseId, validatedData);

    return NextResponse.json({
      success: true,
      data,
      message: 'Purchase entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating purchase:', error);

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
          { success: false, error: 'Purchase entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update purchase entry' },
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
    const purchaseId = parseInt(id, 10);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase ID' },
        { status: 400 }
      );
    }

    await purchaseService.delete(purchaseId);

    return NextResponse.json({
      success: true,
      message: 'Purchase entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete purchase entry' },
      { status: 500 }
    );
  }
}
