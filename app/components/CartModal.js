'use client';

import { useState, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

export default function CartModal({ isOpen, onClose, cart, onRemoveItem, onClearCart }) {
  const [isClosing, setIsClosing] = useState(false);
  const { user, setIsLoginOpen, setAuthMessage } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setStep('cart');
      setMessage('');
      onClose();
    }, 300);
  };

  const handleGoToCheckout = () => {
    if (!user) {
      setAuthMessage('Necesitás iniciar sesión para crear una orden');
      setIsLoginOpen(true);
      return;
    }
    handleClose();
    router.push('/checkout');
  };

  return (
    <div className={`cart-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`cart-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Carrito de compras">

        <div className="cart-header">
          <h2 className="cart-title">TU CARRITO</h2>
          <button className="cart-close" onClick={handleClose} aria-label="Cerrar carrito">&times;</button>
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
                  <Image src={item.imagen} alt={item.nombre} width={80} height={80} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.nombre}</h3>
                    <p className="cart-item-price">${item.precio.toLocaleString('es-AR')}</p>
                    {item.color && (
                      <p className="cart-item-detail">Color: {item.color}</p>
                    )}
                    {item.talleSeleccionado && (
                      <p className="cart-item-detail">Talle: {item.talleSeleccionado}</p>
                    )}
                    <div className="cart-item-quantity">
                      <span>Cantidad: {item.cantidad}</span>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => onRemoveItem(index)}
                    aria-label={`Eliminar ${item.nombre} del carrito`}
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
              <button className="cart-checkout-btn" onClick={handleGoToCheckout}>
                FINALIZAR COMPRA
              </button>
              <button className="cart-clear-btn" onClick={onClearCart}>
                VACIAR CARRITO
              </button>
              {message && <div className="cart-message">{message}</div>}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
