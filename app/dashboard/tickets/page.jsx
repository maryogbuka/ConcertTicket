// app/dashboard/tickets/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState([]);
  const [resendStatus, setResendStatus] = useState({});

  useEffect(() => {
    fetch('/api/tickets/list')
      .then(r => r.json())
      .then(setTickets)
      .catch(console.error);
  }, []);

  const handleResend = async (id) => {
    setResendStatus(prev => ({ ...prev, [id]: 'sending' }));
    const res = await fetch('/api/email/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: id })
    });
    const body = await res.json();
    setResendStatus(prev => ({ ...prev, [id]: body.success ? 'sent' : 'error' }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ticket Transactions (In-memory)</h1>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t.id} className="border p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold">{t.name} — {t.ticketType}</div>
                <div className="text-sm text-gray-600">TicketID: {t.ticketId} • Status: {t.status}</div>
                <div className="text-sm text-gray-600">Amount: ₦{Number(t.amount).toLocaleString()} • Created: {new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleResend(t.id)}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  {resendStatus[t.id] === 'sending' ? 'Resending...' : 'Resend Email'}
                </button>
                <a
                  href={`mailto:${t.email}?subject=Your Ticket ${t.ticketId}&body=Hello ${t.name},%0A%0AYour ticket ID is ${t.ticketId}`}
                  className="px-3 py-2 border rounded"
                >
                  Mail Booker
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
