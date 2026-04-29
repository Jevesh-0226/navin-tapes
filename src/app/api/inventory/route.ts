import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/services/inventory.service';
import { createInventoryLedgerSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const size = searchParams.get('size');
    const report = searchParams.get('report');
    const current = searchParams.get('current');

    // Get current stock (latest balance for each size)
    if (current === 'true') {
      const currentStock = await inventoryService.getCurrentStock();
      return NextResponse.json({
        success: true,
        data: currentStock,
      });
    }

    // Get inventory report for date range
    if (report) {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate and endDate required for report',
          },
          { status: 400 }
        );
      }

      const reportData = await inventoryService.getInventoryReport(
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        data: reportData,
      });
    }

    // Get inventory for specific date
    if (date) {
      const inventory = await inventoryService.getInventoryByDate(
        new Date(date)
      );
      return NextResponse.json({
        success: true,
        data: inventory,
      });
    }

    // Get inventory for specific size
    if (size) {
      const inventory = await inventoryService.getInventoryBySize(
        parseInt(size, 10)
      );
      return NextResponse.json({
        success: true,
        data: inventory,
      });
    }

    // Get all inventory
    const inventory = await inventoryService.getAllInventory();

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _action } = body;

    // Special action: Initialize day inventory with all products
    if (_action === 'initialize_day') {
      const { date } = body;

      if (!date) {
        return NextResponse.json(
          {
            success: false,
            error: 'date required for initialize_day action',
          },
          { status: 400 }
        );
      }

      const inventory = await inventoryService.initializeDayInventory(
        new Date(date)
      );

      return NextResponse.json(
        {
          success: true,
          data: inventory,
          message: `Initialized ${inventory.length} inventory entries for the day`,
        },
        { status: 201 }
      );
    }

    // Special action: Aggregate production for the day
    if (_action === 'aggregate_production') {
      const { date } = body;

      if (!date) {
        return NextResponse.json(
          {
            success: false,
            error: 'date required for aggregate_production action',
          },
          { status: 400 }
        );
      }

      const inventory = await inventoryService.getInventoryByDate(
        new Date(date)
      );

      return NextResponse.json(
        {
          success: true,
          data: inventory,
          message: 'Production aggregated for the day',
        },
        { status: 200 }
      );
    }

    // Regular: Create inventory entry
    const validatedData = createInventoryLedgerSchema.parse(body);
    const inventory = await inventoryService.createInventory(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: inventory,
        message: 'Inventory entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inventory:', error);

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
        error: 'Failed to create inventory entry',
      },
      { status: 500 }
    );
  }
}
