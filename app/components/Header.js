'use client';

import { useState, useContext } from 'react';
import Image from 'next/image';
import { AuthContext } from '../context/AuthContext';

export default function Header({ cartCount, onCartClick, searchTerm, onSearchChange }) {
  const { user, setIsLoginOpen, setIsRegisterOpen, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="main-header">
      <a href="/" className="brand-logo-link">
        <Image src="/Imagenes/off-black.jpg" alt="Logo OFF-BLACK" width={50} height={50} className="brand-logo" />
      </a>
      <h1 className="brand-name">OFF-BLACK</h1>
      <nav className="sub-nav">
        <div className="search-container">
          <input
            type="text"
            placeholder="BUSCAR..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label={`Menú de usuario: ${user.name}`}
                aria-expanded={showUserMenu}
              >
                <span className="button-text-desktop">HOLA, {user.name.toUpperCase()}</span>
                <span className="button-text-mobile">{user.name.split(' ')[0].toUpperCase()}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button onClick={logout} className="logout-btn">CERRAR SESIÓN</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                className="auth-button" 
                onClick={() => setIsLoginOpen(true)}
                title="Iniciar Sesión"
              >
                <span className="button-text-desktop">INICIAR SESIÓN</span>
                <span className="button-text-mobile">SES.</span>
              </button>
              <button 
                className="auth-button register-button" 
                onClick={() => setIsRegisterOpen(true)}
                title="Registrarse"
              >
                <span className="button-text-desktop">REGISTRARSE</span>
                <span className="button-text-mobile">REG.</span>
              </button>
            </>
          )}
          <button className="cart-link" onClick={onCartClick} aria-label={`Carrito, ${cartCount} productos`}>
            <span className="button-text-desktop">CART</span>
            <span className="button-text-mobile">C</span>
            (<span>{cartCount}</span>)
          </button>
        </div>
      </nav>
    </header>
  );
}