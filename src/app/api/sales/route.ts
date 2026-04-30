import { NextRequest, NextResponse } from 'next/server';
import { salesService } from '@/services/sales.service';
import { ZodError } from 'zod';
import { z } from 'zod';

const createSalesSchema = z.object({
  date: z.string().datetime(),
  customer_name: z.string().min(1),
  size_mm: z.number().int().positive(),
  quantity: z.number().positive(),
  rate: z.number().positive(),
  remarks: z.string().optional(),
});

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
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales entries' },
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
