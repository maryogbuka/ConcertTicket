// app/api/paystack/initiate.js
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, amount, metadata = {} } = body;
    if (!email || !amount) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, amount, metadata })
    });

    const data = await initRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
