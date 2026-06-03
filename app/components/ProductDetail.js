'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CartContext } from '../context/CartContext';
import Toast from './Toast';

export default function ProductDetail({ producto }) {
  const { addToCart, toast, hideToast } = useContext(CartContext);
  const [selectedColor, setSelectedColor] = useState(
    producto.colores?.[0] || { nombre: '', imagen: producto.imagen }
  );
  const [selectedSize, setSelectedSize] = useState(producto?.talles?.[0] || '');
  const router = useRouter();

  useEffect(() => {
    setSelectedColor(
      producto.colores?.[0] || { nombre: '', imagen: producto.imagen }
    );
    setSelectedSize(producto?.talles?.[0] || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.id]);

  const handleAddToCart = () => {
    addToCart({
      ...producto,
      imagen: selectedColor.imagen,
      color: selectedColor.nombre,
      talleSeleccionado: selectedSize || null
    });
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <>
      <div className="product-detail">
        <button className="back-button" onClick={() => router.back()}>
          ← Volver
        </button>

        <div className="product-detail-content">
          <div className="product-image-container">
            <Image
              src={selectedColor.imagen || producto.imagen}
              alt={producto.nombre}
              width={800}
              height={800}
              className="product-detail-image"
            />
          </div>

          <div className="product-info-container">
            <h1 className="product-detail-title">{producto.nombre}</h1>
            <p className="product-detail-price">{formatPrice(producto.precio)}</p>

            {producto.colores && producto.colores.length > 1 && (
              <div className="color-selection">
                <p className="color-label">Color: <strong>{selectedColor.nombre}</strong></p>
                <div className="color-options">
                  {producto.colores.map((color, index) => (
                    <button
                      key={index}
                      className={`color-option ${selectedColor.nombre === color.nombre ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color.nombre}
                    >
                      <Image src={color.imagen} alt={color.nombre} width={70} height={70} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {producto.talles && producto.talles.length > 0 && (
              <div className="size-selection">
                <p className="size-label">Talle: <strong>{selectedSize}</strong></p>
                <div className="size-options">
                  {producto.talles.map((talle, index) => (
                    <button
                      key={index}
                      className={`size-option ${selectedSize === talle ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(talle)}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={hideToast}
        type={toast.type}
      />
    </>
  );
}
