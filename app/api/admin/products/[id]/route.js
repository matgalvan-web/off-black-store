import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { nombre, precio, imagen, categoria, talles, colores, stock } = body;

  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (precio !== undefined) updates.precio = Number(precio);
  if (imagen !== undefined) updates.imagen = imagen;
  if (categoria !== undefined) updates.descripcion = categoria;
  if (talles !== undefined) updates.talles = talles;
  if (colores !== undefined) updates.colores = colores;
  if (stock !== undefined) updates.stock = Number(stock);
  updates.updated_at = new Date().toISOString();

  const { data, error } = await getAdmin()
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await getAdmin()
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
