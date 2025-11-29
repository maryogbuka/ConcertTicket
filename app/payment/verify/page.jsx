// app/payment/verify/page.jsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const ticketId = searchParams.get('ticketId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {reference ? (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your payment has been verified. Your tickets have been emailed to you.</p>
            <p className="text-sm text-gray-500 mb-4">Reference: {reference}</p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Home
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">No payment reference found. Please check your payment confirmation.</p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
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

export default function PaymentVerify() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentVerifyContent />
    </Suspense>
  );
}