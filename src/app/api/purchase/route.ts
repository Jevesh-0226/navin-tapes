import { NextRequest, NextResponse } from 'next/server';
import { purchaseService } from '@/services/purchase.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';
import { getCacheHeaders, CACHE_DURATION } from '@/lib/cache-headers';

// Cache GET requests for 10 seconds (will vary based on query params)
export const revalidate = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const supplier = searchParams.get('supplier');
    const material = searchParams.get('material');

    let data;
    // Get by specific date
    if (date) {
      data = await purchaseService.getByDate(new Date(date));
    } else if (supplier) {
      // Get by supplier
      data = await purchaseService.getBySupplier(decodeURIComponent(supplier));
    } else if (material) {
      // Get by material
      data = await purchaseService.getByMaterial(parseInt(material, 10));
    } else {
      // Get all
      data = await purchaseService.getAll();
    }

    const response = NextResponse.json({ success: true, data });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.SHORT}, s-maxage=${CACHE_DURATION.SHORT}`);
    return response;
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createInwardSchema.parse(body);

    const data = await purchaseService.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Purchase entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase:', error);

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
      { success: false, error: 'Failed to create purchase entry' },
      { status: 500 }
    );
  }
}
