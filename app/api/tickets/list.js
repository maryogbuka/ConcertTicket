// app/api/tickets/list.js
import { NextResponse } from 'next/server';
import { getTransactions } from './store';

export async function GET() {
  return NextResponse.json(getTransactions());
}
