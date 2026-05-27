import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(request, { params }) {
  const { id } = params;
  const { status } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ order: data[0] });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
