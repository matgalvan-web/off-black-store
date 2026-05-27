import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    if (!serviceRole || !rawUrl) {
      return NextResponse.json({ success: false, error: 'Faltan variables de entorno SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL' }, { status: 500 });
    }

    let supabaseUrl;
    try { supabaseUrl = new URL(rawUrl).origin; } catch (e) { supabaseUrl = rawUrl.replace(/\/+$/g, ''); }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const module = await import('../../../app/data/productos.js');
    const productos = module.productos || [];
    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay productos locales para sembrar' }, { status: 400 });
    }

    const rows = productos.map(p => ({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: p.precio || 0,
      imagen: p.imagen || '',
      colores: p.colores || [],
      talles: p.talles || [],
      stock: p.stock || 10,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin.from('products').insert(rows).select();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, inserted: data.length, rows: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
