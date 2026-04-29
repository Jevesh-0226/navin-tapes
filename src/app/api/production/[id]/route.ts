import { NextRequest, NextResponse } from 'next/server';
import { productionService } from '@/services/production.service';
import { createProductionSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productionId = parseInt(id, 10);

    if (isNaN(productionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid production ID',
        },
        { status: 400 }
      );
    }

    const production = await productionService.getProductionById(productionId);

    if (!production) {
      return NextResponse.json(
        {
          success: false,
          error: 'Production entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: production,
    });
  } catch (error) {
    console.error('Error fetching production:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch production entry',
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
    const productionId = parseInt(id, 10);

    if (isNaN(productionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid production ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input (all fields optional for update)
    const validatedData = createProductionSchema.partial().parse(body);

    const production = await productionService.updateProduction(
      productionId,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: production,
      message: 'Production entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating production:', error);

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
            error: 'Production entry not found',
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
        error: 'Failed to update production entry',
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
    const productionId = parseInt(id, 10);

    if (isNaN(productionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid production ID',
        },
        { status: 400 }
      );
    }

    await productionService.deleteProduction(productionId);

    return NextResponse.json({
      success: true,
      message: 'Production entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting production:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Production entry not found',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete production entry',
      },
      { status: 500 }
    );
  }
}
