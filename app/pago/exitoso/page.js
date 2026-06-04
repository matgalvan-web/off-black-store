'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ExitosoContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order_id') || params.get('external_reference');
  const paymentId = params.get('payment_id');

  useEffect(() => {
    if (!paymentId || !orderId) return;
    fetch('/api/pagos/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId }),
    });
  }, [paymentId, orderId]);

  return (
    <div className="pago-result">
      <div className="pago-result-icon pago-success-icon">✓</div>
      <h1 className="pago-result-title">¡PAGO APROBADO!</h1>
      <p className="pago-result-msg">Tu orden fue procesada correctamente.</p>
      {orderId && <p className="pago-result-order">N° de orden: <strong>{orderId}</strong></p>}
      <button className="pago-result-btn" onClick={() => router.push('/')}>
        VOLVER A LA TIENDA
      </button>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense>
      <ExitosoContent />
    </Suspense>
  );
}
