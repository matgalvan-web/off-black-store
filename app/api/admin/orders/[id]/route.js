import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  );
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const { status } = await request.json();

  const { data: currentOrder } = await getAdmin()
    .from('orders')
    .select('status, items')
    .eq('id', id)
    .single();

  const { data, error } = await getAdmin()
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const wasConfirmed = currentOrder?.status === 'paid' || currentOrder?.status === 'shipped';
  const isNowConfirmed = status === 'paid' || status === 'shipped';

  if (isNowConfirmed && !wasConfirmed && Array.isArray(currentOrder?.items)) {
    for (const item of currentOrder.items) {
      if (!item.product_id) continue;
      const qty = item.cantidad || 1;
      const size = item.size;

      const { data: prod } = await getAdmin()
        .from('products')
        .select('stock, talles')
        .eq('id', item.product_id)
        .single();

      if (!prod) continue;

      if (size && Array.isArray(prod.talles) && prod.talles.length > 0) {
        const updatedTalles = prod.talles.map(t => {
          const nombre = typeof t === 'object' ? t.nombre : t;
          if (nombre !== size) return typeof t === 'object' ? t : { nombre: t, stock: prod.stock ?? 0 };
          const currentStock = typeof t === 'object' && typeof t.stock === 'number' ? t.stock : (prod.stock ?? 0);
          return { nombre, stock: Math.max(0, currentStock - qty) };
        });
        await getAdmin()
          .from('products')
          .update({ talles: updatedTalles, updated_at: new Date().toISOString() })
          .eq('id', item.product_id);
      } else if (typeof prod.stock === 'number') {
        await getAdmin()
          .from('products')
          .update({ stock: Math.max(0, prod.stock - qty), updated_at: new Date().toISOString() })
          .eq('id', item.product_id);
      }
    }
  }

  return Response.json({ order: data[0] });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await getAdmin()
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
