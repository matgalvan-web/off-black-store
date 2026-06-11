'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);

  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [metodoPago, setMetodoPago] = useState('mercadopago');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validatePhone = (value) => {
    if (!value) return '';
    const digits = value.replace(/[\s\-().+]/g, '');
    if (!/^\d+$/.test(digits)) return 'Solo se permiten números, espacios, guiones y paréntesis';
    if (digits.length < 7) return 'El número es demasiado corto (mínimo 7 dígitos)';
    if (digits.length > 15) return 'El número es demasiado largo (máximo 15 dígitos)';
    return '';
  };

  const handlePhoneChange = (value) => {
    setShippingPhone(value);
    setPhoneError(validatePhone(value));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  if (!user) {
    return (
      <main className="checkout-page">
        <div className="checkout-auth-wall">
          <p>Necesitás iniciar sesión para continuar.</p>
          <button className="cart-checkout-btn" onClick={() => router.push('/')}>
            VOLVER A LA TIENDA
          </button>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-auth-wall">
          <p>Tu carrito está vacío.</p>
          <button className="cart-checkout-btn" onClick={() => router.push('/')}>
            VOLVER A LA TIENDA
          </button>
        </div>
      </main>
    );
  }

  const handleCheckout = async () => {
    if (!shippingName || !shippingAddress) {
      setMessage('Completá nombre y dirección de envío');
      return;
    }
    const phoneValidation = validatePhone(shippingPhone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
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

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items,
          total,
          shippingAddress: shipping,
          metodoPago,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setMessage('Error creando la orden: ' + orderData.error);
        setLoading(false);
        return;
      }

      const orderId = orderData.order?.id;

      if (metodoPago === 'mercadopago') {
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

        window.location.href = mpData.init_point;
      } else {
        clearCart();
        router.push(`/pago/pendiente?order_id=${orderId}`);
      }
    } catch (error) {
      setMessage('Error al procesar: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-page-header">
          <button className="cart-back-btn" onClick={() => router.push('/')}>← Volver</button>
          <h1 className="checkout-page-title">CHECKOUT</h1>
        </div>

        <div className="checkout-page-body">
          {/* Resumen del carrito */}
          <section className="checkout-summary-section">
            <h2 className="checkout-section-title">TU PEDIDO</h2>
            <div className="checkout-items-list">
              {cart.map((item, i) => (
                <div key={`${item.id}-${i}`} className="checkout-item-row">
                  <span className="checkout-item-name">
                    {item.nombre}
                    {item.color ? ` — ${item.color}` : ''}
                    {item.talleSeleccionado ? ` (T. ${item.talleSeleccionado})` : ''}
                    {' '}×{item.cantidad}
                  </span>
                  <span className="checkout-item-price">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="checkout-total-row">
              <span>TOTAL</span>
              <span className="cart-total-price">${total.toLocaleString('es-AR')}</span>
            </div>
          </section>

          {/* Datos de envío */}
          <section className="checkout-form-section">
            <h2 className="checkout-section-title">DATOS DE ENVÍO</h2>
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
                className={`checkout-input${phoneError ? ' checkout-input-error' : ''}`}
                type="tel"
                placeholder="Ej: 11 1234-5678"
                value={shippingPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              {phoneError && <span className="checkout-field-error">{phoneError}</span>}

              <label className="checkout-label">Método de pago *</label>
              <select
                className="checkout-input"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="mercadopago">MercadoPago</option>
                <option value="transferencia">Transferencia bancaria</option>
              </select>
            </div>

            {message && <div className="cart-message">{message}</div>}

            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'CONFIRMAR PEDIDO'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
