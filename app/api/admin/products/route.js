import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const { data, error } = await getAdmin()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ products: data });
}

export async function POST(request) {
  const body = await request.json();
  const { nombre, precio, imagen, categoria, talles, colores, stock } = body;

  if (!nombre || !precio) {
    return Response.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 });
  }

  const { data, error } = await getAdmin()
    .from('products')
    .insert([{
      nombre,
      precio: Number(precio),
      imagen: imagen || '',
      descripcion: categoria || '',
      talles: talles || [],
      colores: colores || [],
      stock: Number(stock) || 0,
    }])
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data }, { status: 201 });
}
