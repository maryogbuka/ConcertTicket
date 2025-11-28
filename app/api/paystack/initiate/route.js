// app/api/paystack/initiate/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { amount, email, reference } = await req.json();

    // Use native fetch instead of node-fetch
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Paystack initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}