import { NextRequest, NextResponse } from 'next/server';
import { expenseService } from '@/services/expense.service';
import { z } from 'zod';
import { ZodError } from 'zod';
import { getCacheHeaders, CACHE_DURATION } from '@/lib/cache-headers';

// Validation schema
const createExpenseSchema = z.object({
  date: z.coerce.date(),
  name: z.string().min(1, 'Expense name required'),
  amount: z.number().positive('Amount must be positive'),
});

export const revalidate = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let data;

    if (startDate && endDate) {
      // Get by date range
      data = await expenseService.getByDateRange(new Date(startDate), new Date(endDate));
    } else if (date) {
      // Get by specific date
      data = await expenseService.getByDate(new Date(date));
    } else {
      // Get all
      data = await expenseService.getAll();
    }

    const response = NextResponse.json({ success: true, data });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.SHORT}, s-maxage=${CACHE_DURATION.SHORT}`);
    return response;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createExpenseSchema.parse(body);

    const data = await expenseService.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Expense entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);

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
      { success: false, error: 'Failed to create expense entry' },
      { status: 500 }
    );
  }
}
