import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { StockService } from '@/services/stock.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    // Get product info before deletion to recalculate stock
    const product = await db.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({
      where: { id }
    });

    // Recalculate stock after deletion
    await StockService.recalculateStock(product.date, undefined, product.size_mm);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
