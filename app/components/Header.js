'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';

export default function Header({ cartCount, onCartClick, searchTerm, onSearchChange }) {
  const { user, setIsLoginOpen, setIsRegisterOpen, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="main-header">
      <Link href="/" className="brand-logo-link">
        <img src="/Imagenes/off-black.jpg" alt="Logo OFF-BLACK" className="brand-logo" />
      </Link>
      <h1 className="brand-name">OFF-BLACK</h1>
      <nav className="sub-nav">
        <div className="nav-links">
          <Link href="/historia" className="historia-link" title="Historia de la marca">
            <span className="button-text-desktop">HISTORIA</span>
            <span className="button-text-mobile">HIST.</span>
          </Link>
        </div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="BUSCAR..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`Hola ${user.name}`}
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
          <a href="#" className="cart-link" onClick={(e) => { e.preventDefault(); onCartClick(); }} title="Carrito">
            <span className="button-text-desktop">CART</span>
            <span className="button-text-mobile">C</span>
            (<span id="cart-count">{cartCount}</span>)
          </a>
        </div>
      </nav>
    </header>
  );
}