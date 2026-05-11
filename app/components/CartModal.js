'use client';

import { useState } from 'react';

export default function CartModal({ isOpen, onClose, cart, onRemoveItem, onClearCart }) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <div className={`cart-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`cart-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">TU CARRITO</h2>
          <button className="cart-close" onClick={handleClose}>&times;</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito está vacío</p>
            <button className="cart-continue-btn" onClick={handleClose}>
              SEGUIR COMPRANDO
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                  <img src={item.imagen} alt={item.nombre} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.nombre}</h3>
                    <p className="cart-item-price">${item.precio.toLocaleString('es-AR')}</p>
                    <div className="cart-item-quantity">
                      <span>Cantidad: {item.cantidad}</span>
                    </div>
                  </div>
                  <button 
                    className="cart-item-remove" 
                    onClick={() => onRemoveItem(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>TOTAL</span>
                <span className="cart-total-price">${total.toLocaleString('es-AR')}</span>
              </div>
              <button className="cart-checkout-btn">FINALIZAR COMPRA</button>
              <button className="cart-clear-btn" onClick={onClearCart}>
                VACIAR CARRITO
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}