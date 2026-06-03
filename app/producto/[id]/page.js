import ProductDetail from '../../components/ProductDetail';
import { productos } from '../../data/productos';
import { notFound } from 'next/navigation';

export default function ProductoPage({ params }) {
  const { id } = params;
  const pid = id && !isNaN(Number(id)) ? Number(id) : id;
  const producto = productos.find(p => String(p.id) === String(id) || p.id === pid) ?? null;

  if (!producto) notFound();

  return <ProductDetail producto={producto} />;
}
