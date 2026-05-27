'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function PendienteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order_id');

  return (
    <div className="pago-result">
      <div className="pago-result-icon pago-pending-icon">⏳</div>
      <h1 className="pago-result-title">PAGO PENDIENTE</h1>
      <p className="pago-result-msg">Tu pago está siendo procesado. Te avisaremos cuando se confirme.</p>
      {orderId && <p className="pago-result-order">N° de orden: <strong>{orderId}</strong></p>}
      <button className="pago-result-btn" onClick={() => router.push('/')}>
        VOLVER A LA TIENDA
      </button>
    </div>
  );
}

export default function PagoPendiente() {
  return (
    <Suspense>
      <PendienteContent />
    </Suspense>
  );
}
