// lib/ticket-generator.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createCanvas } from 'canvas';

export async function generateTicketPDF(ticketId) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Draw background
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Draw header
  page.drawRectangle({
    x: 20, y: height - 120, width: width - 40, height: 80,
    color: rgb(0.2, 0.4, 0.8),
  });
  
  // Draw title
  page.drawText('EVENT TICKET', {
    x: 50, y: height - 70,
    size: 24,
    font,
    color: rgb(1, 1, 1),
  });
  
  // Draw ticket info
  page.drawText(`Ticket ID: ${ticketId}`, {
    x: 50, y: height - 200,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Event: Amazing Concert 2024', {
    x: 50, y: height - 230,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date: December 25, 2024 | Venue: City Arena', {
    x: 50, y: height - 250,
    size: 10,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  
  // Add QR code placeholder text
  page.drawText('QR CODE', {
    x: 150, y: height - 400,
    size: 16,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Scan at entrance', {
    x: 140, y: height - 430,
    size: 10,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateTicketImage(ticketId) {
  const canvas = createCanvas(400, 600);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 400, 600);
  
  // Draw header
  const gradient = ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(20, 20, 360, 80);
  
  // Draw title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('EVENT TICKET', 200, 65);
  
  // Draw ticket info box
  ctx.fillStyle = 'white';
  ctx.fillRect(20, 120, 360, 200);
  ctx.strokeStyle = '#ddd';
  ctx.strokeRect(20, 120, 360, 200);
  
  // Draw ticket details
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Ticket ID: ${ticketId}`, 40, 160);
  ctx.font = '14px Arial';
  ctx.fillText('Event: Amazing Concert 2024', 40, 190);
  ctx.fillText('Date: December 25, 2024', 40, 220);
  ctx.fillText('Venue: City Arena', 40, 250);
  
  // Draw QR code placeholder
  ctx.fillStyle = '#eee';
  ctx.fillRect(125, 300, 150, 150);
  ctx.fillStyle = '#999';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE', 200, 370);
  ctx.fillText('Scan at entrance', 200, 390);
  
  const buffer = canvas.toBuffer('image/png');
  return buffer;
}