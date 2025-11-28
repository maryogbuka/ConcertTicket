import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { addTransaction, updateTransaction } from '../store';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, ticketType, amount = 0, reference = null, metadata = {} } = body;

    if (!name || !email || !ticketType) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const ticketId = 'TCK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const id = Date.now().toString();

    const tx = {
      id,
      ticketId,
      name,
      email,
      phone: phone || null,
      ticketType,
      amount,
      reference,
      metadata,
      status: Number(amount) === 0 ? 'issued' : 'pending',
      createdAt: new Date().toISOString()
    };

    addTransaction(tx);

    // If free ticket, generate QR and ask email sender to send
    if (Number(amount) === 0) {
      const qrData = await QRCode.toDataURL(JSON.stringify({ ticketId, name, email }));

      // send booker mail
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/sendTicket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          name,
          ticketId,
          ticketType,
          qrData,
          amount: 0,
          isArtistNotification: false
        })
      });

      // send artist notification
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/sendTicket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ARTIST_EMAIL || 'artist@example.com',
          subject: `New Ticket Issued: ${ticketId}`,
          bodyText: `${name} was issued a ${ticketType} ticket. Ticket ID: ${ticketId}`,
          isArtistNotification: true,
          ticketId,
          ticketType,
          purchaserName: name,
          purchaserEmail: email
        })
      });
    }

    return NextResponse.json({ success: true, tx });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}