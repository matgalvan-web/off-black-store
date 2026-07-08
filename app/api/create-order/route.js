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

    // Verificar stock antes de crear la orden
    for (const item of items) {
      if (!item.product_id) continue;
      const qty = item.cantidad || 1;
      const size = item.size;

      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('id, nombre, stock, talles')
        .eq('id', item.product_id)
        .single();

      if (!prod) continue;

      if (size && Array.isArray(prod.talles) && prod.talles.length > 0) {
        const parseTalle = (t) => {
          if (typeof t === 'object') return t;
          const [n, s] = t.split(':');
          return { nombre: n.trim(), stock: s !== undefined ? Number(s) : (prod.stock ?? 0) };
        };
        const talleObj = prod.talles.map(parseTalle).find(t => t.nombre === size);
        const talleStock = talleObj ? talleObj.stock : 0;
        if (talleStock < qty) {
          return NextResponse.json({
            success: false,
            error: `Sin stock del talle ${size} para "${prod.nombre}". Stock disponible: ${talleStock}.`,
          }, { status: 400 });
        }
      } else if (typeof prod.stock === 'number' && prod.stock < qty) {
        return NextResponse.json({
          success: false,
          error: `Sin stock suficiente para "${prod.nombre}". Stock disponible: ${prod.stock}.`,
        }, { status: 400 });
      }
    }

    // Crear la orden
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
