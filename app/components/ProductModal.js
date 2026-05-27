"use client";

import { useState, useEffect } from 'react';
import { getProductById } from '../../lib/supabaseOperations';

export default function ProductModal({ productId, onClose, onAddToCart }) {
  const [producto, setProducto] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!productId) return;

    getProductById(productId)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.product) {
          setProducto(res.product);
          setSelectedColor(res.product?.colores?.[0]?.nombre || '');
          setSelectedSize(res.product?.talles?.[0] || '');
        } else {
          setError(res.error || 'No se pudo cargar el producto.');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Error al cargar el producto.');
      });

    return () => { mounted = false; };
  }, [productId]);

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>&times;</button>
          <div className="modal-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!producto) return null;

  const handleAddToCart = () => {
    const productoConOpciones = {
      ...producto,
      colorSeleccionado: selectedColor,
      talleSeleccionado: selectedSize || null,
    };
    onAddToCart(productoConOpciones);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-name">{producto.nombre}</h2>
        <p className="modal-price">${producto.precio.toLocaleString('es-AR')}</p>
        
        {producto.colores && producto.colores.length > 0 && (
          <div className="product-colors">
            <label>COLOR:</label>
            <div className="color-options">
              {producto.colores.map((color) => (
                <button
                  key={color.nombre}
                  className={`color-option ${selectedColor === color.nombre ? 'selected' : ''}`}
                  title={color.nombre}
                  onClick={() => setSelectedColor(color.nombre)}
                  style={{ backgroundColor: color.nombre.toLowerCase() === 'negro' ? '#000' : 
                          color.nombre.toLowerCase() === 'blanco' ? '#fff' :
                          color.nombre.toLowerCase() === 'gris' ? '#888' :
                          color.nombre.toLowerCase() === 'azul' ? '#0066ff' :
                          color.nombre.toLowerCase() === 'crema' ? '#f5f1e8' :
                          color.nombre.toLowerCase() === 'marrón' ? '#8b6f47' :
                          color.nombre.toLowerCase() === 'verde' ? '#228b22' :
                          color.nombre.toLowerCase() === 'camuflado' ? '#6b8e23' : '#ccc' }}
                >
                  {color.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {producto.talles && producto.talles.length > 0 && (
          <div className="product-sizes">
            <label>TALLE:</label>
            <div className="size-options">
              {producto.talles.map((talle) => (
                <button
                  key={talle}
                  className={`size-option ${selectedSize === talle ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(talle)}
                >
                  {talle}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button 
          className="modal-add-btn"
          onClick={handleAddToCart}
        >
          AGREGAR AL CARRITO
        </button>
      </div>
    </div>
  );
}