'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentVerify() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const ticketId = searchParams.get('ticketId');

      if (!reference) {
        setStatus('error');
        return;
      }

      try {
        // Verify payment with your backend
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference, ticketId }),
        });

        if (response.ok) {
          const result = await response.json();
          setStatus(result.success ? 'success' : 'failed');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">Verifying Payment...</h1>
          <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Your tickets have been confirmed and emailed to you.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✗</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="text-gray-600 mt-2">There was an issue with your payment. Please try again.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}