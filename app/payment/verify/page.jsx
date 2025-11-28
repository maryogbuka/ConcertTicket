'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentVerify() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    let mounted = true;

    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      // Use setTimeout to avoid synchronous state updates
      setTimeout(() => {
        if (!mounted) return;
        
        if (reference) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      }, 0);
    };

    verifyPayment();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your tickets have been sent to your email. Redirecting to home...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">There was an issue with your payment.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-[#e74c3c] text-white px-6 py-2 rounded-lg hover:bg-[#c0392b] transition-colors"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}