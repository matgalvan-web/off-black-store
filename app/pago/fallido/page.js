'use client';

import { useRouter } from 'next/navigation';

export default function PagoFallido() {
  const router = useRouter();

  return (
    <div className="pago-result">
      <div className="pago-result-icon pago-failure-icon">✕</div>
      <h1 className="pago-result-title">INCONVENIENTE CON EL PAGO</h1>
      <p className="pago-result-msg">
        No pudimos procesar tu pago. Tu carrito sigue guardado, podés intentarlo de nuevo.
      </p>
      <div className="pago-result-actions">
        <button className="pago-result-btn" onClick={() => router.push('/checkout')}>
          REINTENTAR PAGO
        </button>
        <button className="pago-result-btn pago-result-btn-secondary" onClick={() => router.push('/')}>
          VOLVER A LA TIENDA
        </button>
      </div>
    </div>
  );
}
