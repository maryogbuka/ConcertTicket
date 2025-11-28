"use client";

import React from "react";
import { PaystackButton as RPaystackButton } from "react-paystack";

const PaystackButton = ({ amount, email, onSuccess, onClose }) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const config = {
    email,
    amount: amount * 100, // Paystack expects kobo
    publicKey,
    currency: "NGN",
  };

  const handleSuccess = (reference) => {
    onSuccess(reference);
  };

  return <RPaystackButton {...config} text="Pay Now" onSuccess={handleSuccess} onClose={onClose} className="bg-yellow-500 w-full py-3 rounded text-black font-bold" />;
};

export default PaystackButton;
