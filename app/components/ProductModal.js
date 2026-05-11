'use client';

import { productos } from '../data/productos';

export default function ProductModal({ productId, onClose, onAddToCart }) {
  const producto = productos.find(p => p.id === productId);

  if (!producto) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-name">{producto.nombre}</h2>
        <p className="modal-price">${producto.precio.toLocaleString('es-AR')}</p>
        <button 
          className="modal-add-btn"
          onClick={() => { onAddToCart(producto); onClose(); }}
        >
          AGREGAR AL CARRITO
        </button>
      </div>
    </div>
  );
}