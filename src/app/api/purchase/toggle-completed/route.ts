import { NextRequest, NextResponse } from 'next/server';
import { purchaseService } from '@/services/purchase.service';

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const data = await purchaseService.toggleCompleted(id);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error toggling purchase status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
