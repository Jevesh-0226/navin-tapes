import { NextRequest, NextResponse } from 'next/server';
import { inwardService } from '@/services/inward.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inwardId = parseInt(id, 10);

    if (isNaN(inwardId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inward ID',
        },
        { status: 400 }
      );
    }

    const inward = await inwardService.getInwardById(inwardId);

    if (!inward) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inward entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inward,
    });
  } catch (error) {
    console.error('Error fetching inward:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inward entry',
      },
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
    const inwardId = parseInt(id, 10);

    if (isNaN(inwardId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inward ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input (all fields optional for update)
    const validatedData = createInwardSchema.partial().parse(body);

    const inward = await inwardService.updateInward(inwardId, validatedData);

    return NextResponse.json({
      success: true,
      data: inward,
      message: 'Inward entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating inward:', error);

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
          {
            success: false,
            error: 'Inward entry not found',
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update inward entry',
      },
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
    const inwardId = parseInt(id, 10);

    if (isNaN(inwardId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inward ID',
        },
        { status: 400 }
      );
    }

    await inwardService.deleteInward(inwardId);

    return NextResponse.json({
      success: true,
      message: 'Inward entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inward:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Inward entry not found',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete inward entry',
      },
      { status: 500 }
    );
  }
}
