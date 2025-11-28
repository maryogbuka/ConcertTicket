// components/EmailTemplates.js
export const generateCustomerEmail = (ticketData) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.id}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .ticket-card {
          max-width: 600px;
          margin: 20px auto;
          border: 2px solid #000;
          border-radius: 15px;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
        .ticket-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .ticket-body {
          padding: 20px;
          background: #f8f9fa;
        }
        .ticket-info {
          background: white;
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
        }
        .ticket-qr {
          text-align: center;
          margin: 20px 0;
        }
        .download-btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
        }
      </style>
    </head>
    <body>
      <div class="ticket-card">
        <div class="ticket-header">
          <h1>🎉 TICKET CONFIRMED!</h1>
          <p>You're going to the event!</p>
        </div>
        
        <div class="ticket-body">
          <div class="ticket-info">
            <h3>Event Details</h3>
            <p><strong>Event:</strong> Amazing Concert 2024</p>
            <p><strong>Date:</strong> December 25, 2024</p>
            <p><strong>Venue:</strong> City Arena</p>
          </div>
          
          <div class="ticket-info">
            <h3>Your Ticket</h3>
            <p><strong>Ticket ID:</strong> ${ticketData.id}</p>
            <p><strong>Type:</strong> ${ticketData.type} Ticket</p>
            <p><strong>Quantity:</strong> ${ticketData.quantity}</p>
          </div>
          
          <div class="ticket-qr">
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p>Scan this QR code at entrance</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/download-ticket?ticketId=${ticketData.id}&type=pdf" class="download-btn">
              📄 Download PDF Ticket
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/download-ticket?ticketId=${ticketData.id}&type=image" class="download-btn">
              🖼️ Download Image
            </a>
          </div>
        </div>
      </div>
      
      <p style="text-align: center; color: #666; margin-top: 20px;">
        Please present this ticket at the entrance. You can print it or show on your phone.
      </p>
    </body>
    </html>
  `;
};

export const generateArtistEmail = (ticketData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .notification-card {
          max-width: 600px;
          margin: 20px auto;
          border: 2px solid #28a745;
          border-radius: 15px;
          padding: 20px;
          font-family: Arial, sans-serif;
          background: #f8fff9;
        }
      </style>
    </head>
    <body>
      <div class="notification-card">
        <h2 style="color: #28a745;">🎵 NEW TICKET SALE!</h2>
        <div style="background: white; padding: 15px; border-radius: 10px; margin: 15px 0;">
          <p><strong>Ticket ID:</strong> ${ticketData.id}</p>
          <p><strong>Ticket Type:</strong> ${ticketData.type}</p>
          <p><strong>Quantity:</strong> ${ticketData.quantity}</p>
          <p><strong>Total Amount:</strong> ₦0 (Free Ticket)</p>
          <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>This ticket has been successfully reserved and confirmed.</p>
      </div>
    </body>
    </html>
  `;
};