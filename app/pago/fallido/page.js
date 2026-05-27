'use client';

import { useRouter } from 'next/navigation';

export default function PagoFallido() {
  const router = useRouter();

  return (
    <div className="pago-result">
      <div className="pago-result-icon pago-failure-icon">✕</div>
      <h1 className="pago-result-title">PAGO RECHAZADO</h1>
      <p className="pago-result-msg">Hubo un problema con el pago. Podés intentarlo de nuevo.</p>
      <button className="pago-result-btn" onClick={() => router.push('/')}>
        VOLVER A LA TIENDA
      </button>
    </div>
  );
}
