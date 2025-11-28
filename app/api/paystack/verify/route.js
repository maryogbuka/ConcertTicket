import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { reference } = await request.json();

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      // Update your transaction status and send tickets
      // You'll need to implement this based on your transaction storage
      
      return NextResponse.json({ 
        success: true, 
        data: data.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment verification failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}