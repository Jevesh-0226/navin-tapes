import { NextRequest, NextResponse } from 'next/server';
import { productionService } from '@/services/production.service';
import { createProductionSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const operator = searchParams.get('operator');
    const size = searchParams.get('size');
    const summary = searchParams.get('summary');

    // Get production summary for date range
    if (summary) {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate and endDate required for summary',
          },
          { status: 400 }
        );
      }

      const summaryData = await productionService.getProductionSummary(
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        data: summaryData,
      });
    }

    // Get by specific date
    if (date) {
      const production = await productionService.getProductionByDate(
        new Date(date)
      );
      return NextResponse.json({
        success: true,
        data: production,
      });
    }

    // Get by operator
    if (operator) {
      const production = await productionService.getProductionByOperator(
        decodeURIComponent(operator)
      );
      return NextResponse.json({
        success: true,
        data: production,
      });
    }

    // Get by size
    if (size) {
      const production = await productionService.getProductionBySize(
        parseInt(size, 10)
      );
      return NextResponse.json({
        success: true,
        data: production,
      });
    }

    // Get all
    const production = await productionService.getAllProduction();

    return NextResponse.json({
      success: true,
      data: production,
    });
  } catch (error) {
    console.error('Error fetching production:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch production entries',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createProductionSchema.parse(body);

    const production = await productionService.createProduction(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: production,
        message: 'Production entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating production:', error);

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
        error: 'Failed to create production entry',
      },
      { status: 500 }
    );
  }
}
