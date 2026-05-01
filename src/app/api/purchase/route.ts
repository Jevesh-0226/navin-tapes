import { NextRequest, NextResponse } from 'next/server';
import { purchaseService } from '@/services/purchase.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const supplier = searchParams.get('supplier');
    const material = searchParams.get('material');

    // Get by specific date
    if (date) {
      const data = await purchaseService.getByDate(new Date(date));
      return NextResponse.json({ success: true, data });
    }

    // Get by supplier
    if (supplier) {
      const data = await purchaseService.getBySupplier(
        decodeURIComponent(supplier)
      );
      return NextResponse.json({ success: true, data });
    }

    // Get by material
    if (material) {
      const data = await purchaseService.getByMaterial(parseInt(material, 10));
      return NextResponse.json({ success: true, data });
    }

    // Get all
    const data = await purchaseService.getAll();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching purchase:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase entries', details: errorMessage },
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
