import db from '@/lib/db';

export const orderService = {
  async getAll() {
    const orders = await db.order.findMany({
      orderBy: { created_at: 'desc' },
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

    const quantity = data.quantity ?? existing.quantity;
    const rate = data.rate ?? existing.rate;
    const amount = quantity * rate;

    const order = await db.order.update({
      where: { id },
      data: {
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
