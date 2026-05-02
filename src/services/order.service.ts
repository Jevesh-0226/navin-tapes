import db from '@/lib/db';

export const orderService = {
  async getAll() {
    const orders = await db.order.findMany({
      orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
    });

    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        const sales = await db.sales.findMany({
          where: {
            po_number: order.po_number,
            customer_name: order.customer_name,
          },
          select: { quantity: true },
        });

        const delivered_quantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const status = delivered_quantity >= order.quantity ? 'COMPLETED' : 'PENDING';

        return {
          ...order,
          delivered_quantity,
          status,
        };
      })
    );

    return ordersWithDelivery;
  },

  async getByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await db.order.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
    });

    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        const sales = await db.sales.findMany({
          where: {
            po_number: order.po_number,
            customer_name: order.customer_name,
          },
          select: { quantity: true },
        });

        const delivered_quantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const status = delivered_quantity >= order.quantity ? 'COMPLETED' : 'PENDING';

        return {
          ...order,
          delivered_quantity,
          status,
        };
      })
    );

    return ordersWithDelivery;
  },

  async getById(id: number) {
    const order = await db.order.findUnique({
      where: { id },
    });

    if (!order) return null;

    const sales = await db.sales.findMany({
      where: {
        po_number: order.po_number,
        customer_name: order.customer_name,
      },
      select: { quantity: true },
    });

    const delivered_quantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const status = delivered_quantity >= order.quantity ? 'COMPLETED' : 'PENDING';

    return {
      ...order,
      delivered_quantity,
      status,
    };
  },

  async create(data: any) {
    const amount = data.quantity * data.rate;

    const order = await db.order.create({
      data: {
        date: new Date(data.date),
        po_number: data.po_number,
        customer_name: data.customer_name,
        size_mm: data.size_mm,
        colour: data.colour,
        product_type: data.product_type,
        quantity: data.quantity,
        rate: data.rate,
        amount,
      },
    });

    return order;
  },

  async update(id: number, data: any) {
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) throw new Error('Order not found');

    const date = data.date ?? existing.date;
    const quantity = data.quantity ?? existing.quantity;
    const rate = data.rate ?? existing.rate;
    const amount = quantity * rate;

    const order = await db.order.update({
      where: { id },
      data: {
        date: date instanceof Date ? date : new Date(date),
        po_number: data.po_number ?? existing.po_number,
        customer_name: data.customer_name ?? existing.customer_name,
        size_mm: data.size_mm ?? existing.size_mm,
        colour: data.colour ?? existing.colour,
        product_type: data.product_type ?? existing.product_type,
        quantity,
        rate,
        amount,
      },
    });

    return order;
  },

  async delete(id: number) {
    return db.order.delete({ where: { id } });
  },
};
