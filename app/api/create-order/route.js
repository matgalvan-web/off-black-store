import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, items, total, shippingAddress, metodoPago } = body || {};

    if (!userId || !items) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios (userId/items)' }, { status: 400 });
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl || !serviceRole) {
      return NextResponse.json({ success: false, error: 'Configuración del servidor incompleta.' }, { status: 500 });
    }

    let supabaseUrl;
    try {
      supabaseUrl = new URL(rawUrl).origin;
    } catch (e) {
      supabaseUrl = rawUrl.replace(/\/+$/g, '');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    // Los productos son locales (no están en Supabase), así que insertamos la orden directamente
    // sin pasar por el stored procedure que requiere UUIDs de productos
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: userId,
        items,
        total: total || 0,
        shipping_address: shippingAddress || null,
        status: 'pending',
        metodo_pago: metodoPago || null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
