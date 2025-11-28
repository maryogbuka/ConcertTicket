"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import TicketSection from "@/components/TicketSection";
import TicketDetailsModal from "@/components/TicketDetailsModal";

export default function EventPage() {
  const [cart, setCart] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [activeSection, setActiveSection] = useState("home");

  // Add ticket to cart
  const handleAddToCart = (ticket) => {
    setCart((prev) => {
      // merge quantity if same ticket type
      const existing = prev.find(
        (t) => t.name === ticket.name && t.type === ticket.type
      );
      if (existing) {
        return prev.map((t) =>
          t.name === ticket.name && t.type === ticket.type
            ? { ...t, quantity: t.quantity + ticket.quantity }
            : t
        );
      }
      return [...prev, ticket];
    });

    // Open modal
    setShowTicketModal(ticket);
  };

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <Navigation
        cartCount={cart.reduce((sum, t) => sum + t.quantity, 0)}
        onCartClick={() => console.log("Cart clicked!", cart)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <section id="tickets" className="py-20">
        <TicketSection onAddToCart={handleAddToCart} />
      </section>

      {showTicketModal && (
        <TicketDetailsModal
          ticket={showTicketModal}
          onClose={() => setShowTicketModal(null)}
        />
      )}
    </main>
  );
}
