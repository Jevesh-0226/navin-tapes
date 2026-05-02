import { NextRequest, NextResponse } from 'next/server';
import { salesService } from '@/services/sales.service';
import { ZodError } from 'zod';
import { createSalesSchema } from '@/lib/validation';
import { getCacheHeaders, CACHE_DURATION } from '@/lib/cache-headers';

// Cache GET requests for 10 seconds
export const revalidate = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const customer = searchParams.get('customer');
    const size = searchParams.get('size');

    let data;
    if (date) {
      data = await salesService.getByDate(new Date(date));
    } else if (customer) {
      data = await salesService.getByCustomer(decodeURIComponent(customer));
    } else if (size) {
      data = await salesService.getBySize(parseInt(size, 10));
    } else {
      data = await salesService.getAll();
    }

    const response = NextResponse.json({ success: true, data });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.SHORT}, s-maxage=${CACHE_DURATION.SHORT}`);
    return response;
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
