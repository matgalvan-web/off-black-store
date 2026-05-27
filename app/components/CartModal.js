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
        color: it.color || null,
        size: it.talleSeleccionado || null,
      }));

      const shipping = {
        name: shippingName,
        address: shippingAddress,
        phone: shippingPhone,
        email: user.email,
      };

      // 1. Crear la orden en Supabase
      const orderResult = await createOrder(user.id, items, total, shipping);
      if (!orderResult.success) {
        setMessage('Error creando la orden: ' + orderResult.error);
        setLoading(false);
        return;
      }

      const orderId = orderResult.order?.id || 'test';

      // 2. Crear preferencia en MercadoPago y redirigir
      const mpRes = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, orderId, shippingInfo: shipping }),
      });

      const mpData = await mpRes.json();

      if (!mpRes.ok || !mpData.init_point) {
        setMessage('Error al iniciar el pago: ' + (mpData.error || 'inténtalo de nuevo'));
        setLoading(false);
        return;
      }

      onClearCart();
      window.location.href = mpData.init_point;
    } catch (error) {
      setMessage('Error al procesar: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className={`cart-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`cart-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Carrito de compras">

        {/* ── PASO 1: CARRITO ── */}
        {step === 'cart' && (
          <>
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
                      <img src={item.imagen} alt={item.nombre} className="cart-item-image" />
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
          </>
        )}

        {/* ── PASO 2: FORMULARIO DE ENVÍO ── */}
        {step === 'checkout' && (
          <>
            <div className="cart-header">
              <button className="cart-back-btn" onClick={handleBackToCart}>← Volver</button>
              <h2 className="cart-title">DATOS DE ENVÍO</h2>
              <button className="cart-close" onClick={handleClose} aria-label="Cerrar carrito">&times;</button>
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
