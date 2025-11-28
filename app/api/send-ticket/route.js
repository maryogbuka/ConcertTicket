import nodemailer from "nodemailer";

export async function POST(req) {
  const { ticket, details, reference } = await req.json();

  try {

    if (ticket.type === "vip") {
  // VIP: verify payment before sending email
  if (!reference) return new Response(JSON.stringify({ status: "error", message: "Payment required" }), { status: 400 });
}

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.example.com",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: "ogbuka.maryann@olivemfb.com",
      to: details.email,
      subject: `Your ${ticket.ticketName} Ticket`,
      text: `Thank you for your purchase!\n\nTicket: ${ticket.ticketName}\nQuantity: ${ticket.quantity}\nReference: ${reference}\nEnjoy the concert!`,
    };

    await transporter.sendMail(message);

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500 });
  }
}
