'use client';

import { useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '../../components/ProductDetail';
import Toast from '../../components/Toast';
import { productos } from '../../data/productos';
import { CartContext } from '../../context/CartContext';

export default function ProductoPage() {
  const params = useParams();
  const [producto, setProducto] = useState(null);
  const { addToCart, toast, hideToast } = useContext(CartContext);

  useEffect(() => {
    const found = productos.find(p => p.id === parseInt(params.id));
    setProducto(found);
  }, [params.id]);

  if (!producto) {
    return <div className="loading">Cargando...</div>;
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