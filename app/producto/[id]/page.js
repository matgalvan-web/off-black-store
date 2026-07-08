import ProductDetail from '../../components/ProductDetail';
import { getProductById } from '../../../lib/supabaseOperations';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductoPage({ params }) {
  const { id } = params;
  const result = await getProductById(id);

  if (!result.success || !result.product) notFound();

  return <ProductDetail producto={result.product} />;
}
