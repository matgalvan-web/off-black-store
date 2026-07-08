'use client';

import { useContext, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedCollections from './components/FeaturedCollections';
import Productos from './components/Productos';
import ProductModal from './components/ProductModal';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { CartContext } from './context/CartContext';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeItem,
    clearCart,
    toast,
    hideToast,
  } = useContext(CartContext);

  const handleProductClick = (id) => {
    setSelectedProduct(id);
  };

  const handleAddToCart = (producto) => {
    addToCart(producto);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const showSearchResults = searchTerm.trim() !== '';

  return (
    <main>
      <Header 
        cartCount={cartCount} 
        onCartClick={handleCartClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="content-wrapper">
        {!showSearchResults && <Hero />}
        
        {!showSearchResults && (
          <FeaturedCollections onProductClick={handleProductClick} />
        )}
        

        <Productos 
          searchTerm={searchTerm} 
          onProductClick={handleProductClick}
        />
      </div>

      <Footer />

      {selectedProduct && (
        <ProductModal 
          productId={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />

      <Toast 
        message={toast.message}
        isVisible={toast.visible}
        onClose={hideToast}
        type={toast.type}
      />

      <LoginModal />
      <RegisterModal />
    </main>
  );
}