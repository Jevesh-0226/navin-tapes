import db from '@/lib/db';

export const expenseService = {
  // Get all expenses
  async getAll(take = 1000, skip = 0) {
    try {
      return await db.expense.findMany({
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
        orderBy: { date: 'desc' },
        take,
        skip,
      });
    } catch (error) {
      // Table doesn't exist yet - return empty array
      console.error('Expense table error:', error);
      return [];
    }
  },

  // Get expenses by date
  async getByDate(date: Date, take = 1000, skip = 0) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await db.expense.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take,
        skip,
      });
    } catch (error) {
      // Table doesn't exist yet - return empty array
      console.error('Expense table error:', error);
      return [];
    }
  },

  // Get expenses by date range
  async getByDateRange(startDate: Date, endDate: Date, take = 1000, skip = 0) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return await db.expense.findMany({
        where: {
          date: { gte: start, lte: end },
        },
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
        orderBy: { date: 'desc' },
        take,
        skip,
      });
    } catch (error) {
      // Table doesn't exist yet - return empty array
      console.error('Expense table error:', error);
      return [];
    }
  },

  // Get by ID
  async getById(id: number) {
    try {
      return await db.expense.findUnique({
        where: { id },
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
      });
    } catch (error) {
      console.error('Expense table error:', error);
      return null;
    }
  },

  // Create expense
  async create(data: any) {
    try {
      const expense = await db.expense.create({
        data: {
          date: new Date(data.date),
          name: data.name,
          amount: data.amount,
        },
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
      });

      return expense;
    } catch (error) {
      console.error('Expense table error:', error);
      throw new Error('Failed to create expense - database table may not exist yet');
    }
  },

  // Update expense
  async update(id: number, data: any) {
    try {
      const existing = await db.expense.findUnique({ where: { id } });
      if (!existing) throw new Error('Expense entry not found');

      const expense = await db.expense.update({
        where: { id },
        data: {
          ...(data.date !== undefined && { date: new Date(data.date) }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.amount !== undefined && { amount: data.amount }),
        },
        select: {
          id: true,
          date: true,
          name: true,
          amount: true,
          created_at: true,
        },
      });

      return expense;
    } catch (error) {
      console.error('Expense table error:', error);
      throw new Error('Failed to update expense - database table may not exist yet');
    }
  },

  // Delete expense
  async delete(id: number) {
    try {
      const existing = await db.expense.findUnique({ where: { id } });
      if (!existing) throw new Error('Expense entry not found');

      return await db.expense.delete({ where: { id } });
    } catch (error) {
      console.error('Expense table error:', error);
      throw new Error('Failed to delete expense - database table may not exist yet');
    }
  },

  // Get total expenses for date
  async getTotalByDate(date: Date): Promise<number> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.expense.aggregate({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
    } catch (error) {
      // Table doesn't exist yet - return 0
      console.error('Expense table error:', error);
      return 0;
    }
  },

  // Get total expenses for date range
  async getTotalByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const result = await db.expense.aggregate({
        where: {
          date: { gte: start, lte: end },
        },
        _sum: {
          amount: true,
        },
      });

      return result._sum.amount || 0;
    } catch (error) {
      // Table doesn't exist yet - return 0
      console.error('Expense table error:', error);
      return 0;
    }
  },
};
