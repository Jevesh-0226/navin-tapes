import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/services/inventory.service';
import { createInventoryLedgerSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inventory ID',
        },
        { status: 400 }
      );
    }

    const inventory = await inventoryService.getInventoryById(inventoryId);

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inventory entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory entry',
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
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inventory ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { _action } = body;

    // Special action: Update only delivery amount (most common)
    if (_action === 'update_delivery') {
      const { delivery } = body;

      if (delivery === undefined || delivery === null) {
        return NextResponse.json(
          {
            success: false,
            error: 'delivery amount required',
          },
          { status: 400 }
        );
      }

      const inventory = await inventoryService.updateDelivery(
        inventoryId,
        Number(delivery)
      );

      return NextResponse.json({
        success: true,
        data: inventory,
        message: 'Delivery updated and balance recalculated',
      });
    }

    // Special action: Update production aggregation (auto-sum from production table)
    if (_action === 'update_production') {
      const existing = await inventoryService.getInventoryById(inventoryId);

      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: 'Inventory entry not found',
          },
          { status: 404 }
        );
      }

      const inventory = await inventoryService.updateProductionAggregation(
        existing.date,
        existing.size_mm
      );

      return NextResponse.json({
        success: true,
        data: inventory,
        message: 'Production aggregated and balance recalculated',
      });
    }

    // Regular: Update full inventory record
    const validatedData = createInventoryLedgerSchema.partial().parse(body);

    const inventory = await inventoryService.updateInventory(
      inventoryId,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: inventory,
      message: 'Inventory entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating inventory:', error);

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
            error: 'Inventory entry not found',
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
        error: 'Failed to update inventory entry',
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
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid inventory ID',
        },
        { status: 400 }
      );
    }

    await inventoryService.deleteInventory(inventoryId);

    return NextResponse.json({
      success: true,
      message: 'Inventory entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Inventory entry not found',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete inventory entry',
      },
      { status: 500 }
    );
  }
}
