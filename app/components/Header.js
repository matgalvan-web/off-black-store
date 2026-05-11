'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header({ cartCount, onCartClick, searchTerm, onSearchChange }) {
  return (
    <header className="main-header">
      <Link href="/" className="brand-logo-link">
        <img src="/Imagenes/off-black.jpg" alt="Logo OFF-BLACK" className="brand-logo" />
      </Link>
      <h1 className="brand-name">OFF-BLACK</h1>
      <nav className="sub-nav">
        <div className="nav-links">
          <Link href="#productos">SHOP</Link>
          <Link href="#">ARCHIVE</Link>
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
          <button className="auth-button">INICIAR SESIÓN</button>
          <button className="auth-button register-button">REGISTRARSE</button>
          <a href="#" className="cart-link" onClick={(e) => { e.preventDefault(); onCartClick(); }}>
            CART (<span id="cart-count">{cartCount}</span>)
          </a>
        </div>
      </nav>
    </header>
  );
}