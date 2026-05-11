'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    const savedCart = typeof window !== 'undefined' ? window.localStorage.getItem('cart') : null;
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.warn('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const addToCart = useCallback((producto) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === producto.id && item.color === producto.color);
      if (existingItem) {
        return prev.map(item =>
          item.id === producto.id && item.color === producto.color
            ? { ...item, cantidad: (item.cantidad || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    showToast(`${producto.nombre} agregado al carrito`, 'success');
  }, [showToast]);

  const removeItem = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Carrito vaciado', 'success');
  }, [showToast]);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.cantidad || 0), 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeItem,
      clearCart,
      toast,
      hideToast,
    }),
    [cart, cartCount, isCartOpen, addToCart, removeItem, clearCart, toast, hideToast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
