import { createClient } from '@supabase/supabase-js';
import ProductDetail from '../../components/ProductDetail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getProduct(id) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  );
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  return error ? null : data;
}

export default async function ProductoPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();
  return <ProductDetail producto={product} />;
}
