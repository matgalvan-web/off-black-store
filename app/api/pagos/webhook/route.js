import { NextResponse } from 'next/server';
import { client } from '../../../../lib/mercadopago';
import { Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

const MP_STATUS_MAP = {
  approved: 'paid',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  refunded: 'cancelled',
  pending: 'pending',
  in_process: 'pending',
};

export async function POST(req) {
  try {
    const { type, data } = await req.json();

    if (type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentApi = new Payment(client);
    const payment = await paymentApi.get({ id: data.id });

    const orderId = payment.external_reference;
    const newStatus = MP_STATUS_MAP[payment.status] ?? 'pending';

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseAdmin();
    await supabase
      .from('orders')
      .update({
        status: newStatus,
        mp_payment_id: String(data.id),
        mp_status: payment.status,
      })
      .eq('id', orderId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
