// app/api/download-ticket/route.js
import { NextResponse } from 'next/server';
import { generateTicketPDF } from '@/lib/ticket-generator';
import { generateTicketImage } from '@/lib/ticket-generator';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    const type = searchParams.get('type') || 'pdf';

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    if (type === 'pdf') {
      const pdfBuffer = await generateTicketPDF(ticketId);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ticket-${ticketId}.pdf"`,
        },
      });
    } else if (type === 'image') {
      const imageBuffer = await generateTicketImage(ticketId);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="ticket-${ticketId}.png"`,
        },
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to generate ticket' }, { status: 500 });
  }
}