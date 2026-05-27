import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, items, total, shippingAddress } = body || {};

    if (!userId || !items) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios (userId/items)' }, { status: 400 });
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl || !serviceRole) {
      return NextResponse.json({ success: false, error: 'Configuración del servidor incompleta. Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL' }, { status: 500 });
    }

    let supabaseUrl;
    try {
      supabaseUrl = new URL(rawUrl).origin;
    } catch (e) {
      supabaseUrl = rawUrl.replace(/\/+$/g, '');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const insertPayload = {
      user_id: userId,
      items,
      total: total || 0,
      shipping_address: shippingAddress || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin.from('orders').insert([insertPayload]).select();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Clear cart items for user (server-side) — optional but convenient
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

    return NextResponse.json({ success: true, order: data?.[0] ?? null });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
