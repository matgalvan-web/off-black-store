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
    .order('created_at', { ascending: true });

  const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };
  if (error) return Response.json({ error: error.message }, { status: 500, headers });
  return Response.json({ products: data || [] }, { headers });
}
