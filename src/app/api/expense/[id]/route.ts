import { NextRequest, NextResponse } from 'next/server';
import { expenseService } from '@/services/expense.service';
import { z } from 'zod';
import { ZodError } from 'zod';

// Validation schema
const updateExpenseSchema = z.object({
  date: z.coerce.date().optional(),
  name: z.string().min(1, 'Expense name required').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expenseId = parseInt(id, 10);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    const data = await expenseService.getById(expenseId);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Expense entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expense entry' },
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
    const expenseId = parseInt(id, 10);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input (all fields optional for update)
    const validatedData = updateExpenseSchema.parse(body);

    const data = await expenseService.update(expenseId, validatedData);

    return NextResponse.json({
      success: true,
      data,
      message: 'Expense entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating expense:', error);

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
          { success: false, error: 'Expense entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update expense entry' },
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
    const expenseId = parseInt(id, 10);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    await expenseService.delete(expenseId);

    return NextResponse.json({
      success: true,
      message: 'Expense entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete expense entry' },
      { status: 500 }
    );
  }
}
