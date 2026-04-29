import { NextRequest, NextResponse } from 'next/server';
import { inwardService } from '@/services/inward.service';
import { createInwardSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const supplier = searchParams.get('supplier');
    const material = searchParams.get('material');
    const invoice = searchParams.get('invoice');
    const summary = searchParams.get('summary');
    const qcDefects = searchParams.get('qcDefects');

    // Get QC defect summary
    if (qcDefects) {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate and endDate required for QC defects',
          },
          { status: 400 }
        );
      }

      const defectData = await inwardService.getQCDefectSummary(
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        data: defectData,
      });
    }

    // Get inward summary for date range
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

      const summaryData = await inwardService.getInwardSummary(
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
      const inward = await inwardService.getInwardByDate(new Date(date));
      return NextResponse.json({
        success: true,
        data: inward,
      });
    }

    // Get by supplier
    if (supplier) {
      const inward = await inwardService.getInwardBySupplier(
        decodeURIComponent(supplier)
      );
      return NextResponse.json({
        success: true,
        data: inward,
      });
    }

    // Get by material
    if (material) {
      const inward = await inwardService.getInwardByMaterial(
        decodeURIComponent(material)
      );
      return NextResponse.json({
        success: true,
        data: inward,
      });
    }

    // Get by invoice
    if (invoice) {
      const inward = await inwardService.getInwardByInvoice(
        decodeURIComponent(invoice)
      );
      return NextResponse.json({
        success: true,
        data: inward,
      });
    }

    // Get all
    const inward = await inwardService.getAllInward();

    return NextResponse.json({
      success: true,
      data: inward,
    });
  } catch (error) {
    console.error('Error fetching inward:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inward entries',
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

    const inward = await inwardService.createInward(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: inward,
        message: 'Inward entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inward:', error);

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
        error: 'Failed to create inward entry',
      },
      { status: 500 }
    );
  }
}
