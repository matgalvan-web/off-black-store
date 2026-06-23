import { NextResponse } from 'next/server';
import { client } from '../../../../lib/mercadopago';
import { Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const MP_STATUS_MAP = {
  approved: 'paid',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  pending: 'pending',
  in_process: 'pending',
};

export async function POST(req) {
  try {
    const { paymentId, orderId, mpStatus } = await req.json();

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    let newStatus = 'pending';
    let mpPaymentStatus = mpStatus ?? null;

    try {
      const paymentApi = new Payment(client);
      const payment = await paymentApi.get({ id: paymentId });
      newStatus = MP_STATUS_MAP[payment.status] ?? 'pending';
      mpPaymentStatus = payment.status;
    } catch {
      // Si la API falla, usar el status que MP mandó en la URL de redirección
    }

    // Si la API devolvió pending pero MP ya redirigió a éxito con approved, confiar en ese
    if (newStatus === 'pending' && mpStatus === 'approved') {
      newStatus = 'paid';
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        mp_payment_id: String(paymentId),
        mp_status: mpPaymentStatus,
      })
      .eq('id', orderId);

    return NextResponse.json({ status: newStatus });
  } catch (error) {
    console.error('Confirmar pago error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
