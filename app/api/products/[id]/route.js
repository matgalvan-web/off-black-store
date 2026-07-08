import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

export async function GET(request, { params }) {
  const { id } = params;
  const { data, error } = await getAdmin()
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };
  if (error) return Response.json({ error: error.message }, { status: 404, headers });
  return Response.json({ product: data }, { headers });
}
