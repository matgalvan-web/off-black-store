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

  const { data, error } = await getAdmin()
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
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
