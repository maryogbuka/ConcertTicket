import { Suspense } from 'react';
import PaymentVerify from './PaymentVerify';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading payment status...</p>}>
      <PaymentVerify />
    </Suspense>
  );
}
