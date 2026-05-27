'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createOrder } from '../../lib/supabaseOperations';

export default function CartModal({ isOpen, onClose, cart, onRemoveItem, onClearCart }) {
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const { user, setIsLoginOpen, setAuthMessage } = useContext(AuthContext);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    setStep('checkout');
    setMessage('');
  };

  const handleBackToCart = () => {
    setStep('cart');
    setMessage('');
  };

  const handleCheckout = async () => {
    if (!shippingAddress || !shippingName) {
      setMessage('Completá nombre y dirección de envío');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const items = cart.map((it) => ({
        product_id: it.id,
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
        color: it.colorSeleccionado || null,
        size: it.talleSeleccionado || null,
      }));

      const shipping = {
        name: shippingName,
        address: shippingAddress,
        phone: shippingPhone,
        email: user.email,
      };

      const result = await createOrder(user.id, items, total, shipping);

      if (!result.success) {
        setMessage('Error creando la orden: ' + result.error);
        setLoading(false);
        return;
      }

      setMessage('✓ Orden creada. ID: ' + (result.order?.id || 'n/a'));
      onClearCart();
      setLoading(false);
      setStep('cart');
    } catch (error) {
      setMessage('Error creando la orden');
      setLoading(false);
    }
  };

  return (
    <div className={`cart-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`cart-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* ── PASO 1: CARRITO ── */}
        {step === 'cart' && (
          <>
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
                        {item.colorSeleccionado && (
                          <p className="cart-item-detail">Color: {item.colorSeleccionado}</p>
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
          </>
        )}

        {/* ── PASO 2: FORMULARIO DE ENVÍO ── */}
        {step === 'checkout' && (
          <>
            <div className="cart-header">
              <button className="cart-back-btn" onClick={handleBackToCart}>← Volver</button>
              <h2 className="cart-title">DATOS DE ENVÍO</h2>
              <button className="cart-close" onClick={handleClose}>&times;</button>
            </div>

            <div className="checkout-form-container">
              <div className="checkout-summary">
                <span>TOTAL A PAGAR</span>
                <span className="cart-total-price">${total.toLocaleString('es-AR')}</span>
              </div>

              <div className="checkout-form">
                <label className="checkout-label">Nombre completo *</label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                />

                <label className="checkout-label">Dirección de envío *</label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="Calle, número, ciudad"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />

                <label className="checkout-label">Teléfono (opcional)</label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="Ej: 11 1234-5678"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                />
              </div>

              {message && <div className="cart-message">{message}</div>}

              <button className="cart-checkout-btn" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Creando orden...' : 'CONFIRMAR PEDIDO'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
