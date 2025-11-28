import { NextResponse } from 'next/server';
import { updateTransaction } from '../store';

export async function POST(request) {
  try {
    const { id, reference } = await request.json();

    if (!id || !reference) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update transaction with Paystack reference
    updateTransaction(id, { reference, status: 'pending_payment' });

    return NextResponse.json({ 
      success: true, 
      message: 'Reference updated successfully' 
    });

  } catch (error) {
    console.error('Update reference error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}