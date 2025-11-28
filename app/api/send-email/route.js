

// app/api/send-email/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  return NextResponse.json({ 
    message: 'Email API is working!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Missing: to, subject, html' },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SMTP credentials missing in .env',
          tip: 'Set SMTP_USER and SMTP_PASS'
        },
        { status: 500 }
      );
    }

    console.log("📡 Creating Gmail transporter...");

    // FIXED HERE 👇
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    await transporter.verify();
    console.log("📬 Transporter verified");

    const mailOptions = {
      from: `"Lloyd Section Tickets" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      id: result.messageId,
    });

  } catch (error) {
    console.error("❌ Email send error:", error.message);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
