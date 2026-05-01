import { NextRequest, NextResponse } from 'next/server';
import { salesService } from '@/services/sales.service';
import { ZodError } from 'zod';
import { createSalesSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const customer = searchParams.get('customer');
    const size = searchParams.get('size');

    if (date) {
      const data = await salesService.getByDate(new Date(date));
      return NextResponse.json({ success: true, data });
    }

    if (customer) {
      const data = await salesService.getByCustomer(
        decodeURIComponent(customer)
      );
      return NextResponse.json({ success: true, data });
    }

    if (size) {
      const data = await salesService.getBySize(parseInt(size, 10));
      return NextResponse.json({ success: true, data });
    }

    const data = await salesService.getAll();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching sales:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales entries', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSalesSchema.parse(body);

    const data = await salesService.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Sales entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sales:', error);

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
      { success: false, error: 'Failed to create sales entry' },
      { status: 500 }
    );
  }
}
