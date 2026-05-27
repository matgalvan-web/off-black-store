"use client";

import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProductDetail from '../../components/ProductDetail';
import Toast from '../../components/Toast';
import { CartContext } from '../../context/CartContext';
import { productos } from '../../data/productos';

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toast, hideToast } = useContext(CartContext);

  const id = params?.id;
  const pid = id && !isNaN(Number(id)) ? Number(id) : id;
  const producto = productos.find(p => String(p.id) === String(id) || p.id === pid) ?? null;

  if (!producto) {
    return (
      <div className="loading">
        <p>Producto no encontrado.</p>
        <button className="back-button" onClick={() => router.push('/')}>← Volver</button>
      </div>
    );
  }

  return (
    <>
      <ProductDetail producto={producto} onAddToCart={addToCart} />
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={hideToast}
        type={toast.type}
      />
    </>
  );
}
