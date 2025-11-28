"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// Dummy functions (replace with your actual API calls)
const sendTicketEmail = async (ticket) => {
  console.log("Sending ticket email:", ticket);
  // Call your backend/email API here
  alert(`Ticket email sent for ${ticket.name}`);
};

const redirectToPaystack = async (ticket) => {
  console.log("Redirecting to Paystack for:", ticket);
  // Replace with Paystack redirect logic
  alert(`Redirecting to Paystack checkout for ${ticket.name}`);
};

const TicketDetailsModal = ({ ticket, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    if (ticket.type === "regular") {
      // Regular ticket → send email
      await sendTicketEmail(ticket);
    } else if (ticket.type === "vip") {
      // VIP ticket → redirect to Paystack
      await redirectToPaystack(ticket);
      // after successful payment, send email (simulate here)
      await sendTicketEmail(ticket);
    }

    setLoading(false);
    onClose();
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          &times;
        </button>

        {/* Modal content */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirm Your Ticket</h2>
        <div className="mb-6 space-y-2">
          <p><span className="font-bold">Name:</span> {ticket.name}</p>
          <p><span className="font-bold">Type:</span> {ticket.type.toUpperCase()}</p>
          <p><span className="font-bold">Quantity:</span> {ticket.quantity}</p>
          <p><span className="font-bold">Total Price:</span> ₦{(ticket.price * ticket.quantity).toLocaleString()}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${
            ticket.type === "vip" ? "bg-yellow-500 text-black" : "bg-[#e74c3c] text-white"
          }`}
        >
          {loading ? "Processing..." : ticket.type === "vip" ? "Proceed to Payment" : "Send Ticket"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TicketDetailsModal;
