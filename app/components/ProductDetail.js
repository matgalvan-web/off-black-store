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
  const [selectedSize, setSelectedSize] = useState('');
  const router = useRouter();

  const normalizeTalles = (talles, fallbackStock) =>
    (talles || []).map(t =>
      typeof t === 'object' ? t : { nombre: t, stock: fallbackStock ?? 0 }
    );

  const tallesNorm = normalizeTalles(producto.talles, producto.stock);
  const hasTalles = tallesNorm.length > 0;

  useEffect(() => {
    setSelectedColor(
      producto.colores?.[0] || { nombre: '', imagen: producto.imagen }
    );
    const norm = normalizeTalles(producto.talles, producto.stock);
    const firstAvailable = norm.find(t => t.stock > 0);
    setSelectedSize(firstAvailable?.nombre || norm[0]?.nombre || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.id]);

  const selectedTalleObj = hasTalles ? tallesNorm.find(t => t.nombre === selectedSize) : null;
  const currentStock = hasTalles ? (selectedTalleObj?.stock ?? 0) : (producto.stock ?? 0);
  const outOfStock = hasTalles
    ? (tallesNorm.every(t => t.stock === 0) || currentStock === 0)
    : (typeof producto.stock === 'number' && producto.stock === 0);
  const lowStock = !outOfStock && currentStock > 0 && currentStock <= 3;

  const handleAddToCart = () => {
    if (outOfStock) return;
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

            {outOfStock && (
              <p className="stock-badge stock-out">SIN STOCK</p>
            )}
            {lowStock && (
              <p className="stock-badge stock-low">ÚLTIMAS {currentStock} UNIDADES{hasTalles && selectedSize ? ` (talle ${selectedSize})` : ''}</p>
            )}

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

            {hasTalles && (
              <div className="size-selection">
                <p className="size-label">Talle: <strong>{selectedSize}</strong></p>
                <div className="size-options">
                  {tallesNorm.map((talle, index) => {
                    const sinStock = talle.stock === 0;
                    return (
                      <button
                        key={index}
                        className={`size-option ${selectedSize === talle.nombre ? 'selected' : ''} ${sinStock ? 'size-option-agotado' : ''}`}
                        onClick={() => !sinStock && setSelectedSize(talle.nombre)}
                        disabled={sinStock}
                        title={sinStock ? 'Sin stock' : `Stock: ${talle.stock}`}
                      >
                        {talle.nombre}
                        {sinStock && <span className="talle-agotado-mark">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              className={`add-to-cart-button${outOfStock ? ' add-to-cart-disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={outOfStock}
              aria-disabled={outOfStock}
            >
              {outOfStock ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
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
