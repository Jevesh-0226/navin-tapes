import { NextRequest, NextResponse } from 'next/server';
import { purchaseService } from '@/services/purchase.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';

// DEPRECATED: Use /api/purchase instead
// This endpoint is maintained for backward compatibility

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const supplier = searchParams.get('supplier');
    const material = searchParams.get('material');
    const invoice = searchParams.get('invoice');

    // Get by specific date
    if (date) {
      const purchase = await purchaseService.getPurchaseByDate(new Date(date));
      return NextResponse.json({
        success: true,
        data: purchase,
      });
    }

    // Get by supplier
    if (supplier) {
      const purchase = await purchaseService.getPurchaseBySupplier(
        decodeURIComponent(supplier)
      );
      return NextResponse.json({
        success: true,
        data: purchase,
      });
    }

    // Get by material
    if (material) {
      const purchase = await purchaseService.getPurchaseByMaterial(
        parseInt(material, 10)
      );
      return NextResponse.json({
        success: true,
        data: purchase,
      });
    }

    // Get by invoice
    if (invoice) {
      const purchase = await purchaseService.getPurchaseByInvoice(
        decodeURIComponent(invoice)
      );
      return NextResponse.json({
        success: true,
        data: purchase,
      });
    }

    // Get all
    const purchase = await purchaseService.getAllPurchase();

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch purchase entries',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createInwardSchema.parse(body);

    const purchase = await purchaseService.createPurchase(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: purchase,
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
        error: 'Failed to create purchase entry',
      },
      { status: 500 }
    );
  }
}
