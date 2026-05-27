'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginModal() {
  const { isLoginOpen, setIsLoginOpen, login, authMessage, setAuthMessage, setIsRegisterOpen } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authMessage) {
      const timer = setTimeout(() => setAuthMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [authMessage, setAuthMessage]);

  if (!isLoginOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
        <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Iniciar sesión">
          <button className="modal-close" onClick={() => setIsLoginOpen(false)} aria-label="Cerrar">×</button>
          
          <h2 className="modal-title">INICIAR SESIÓN</h2>
          
          {authMessage && (
            <div className={`auth-message ${authMessage.includes('Error') || authMessage.includes('incorrectos') ? 'error' : 'success'}`}>
              {authMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                aria-label="Email"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                aria-label="Contraseña"
              />
            </div>
            
            <button type="submit" className="modal-add-btn" disabled={isLoading}>
              {isLoading ? 'CARGANDO...' : 'INGRESAR'}
            </button>
          </form>
          
          <p className="auth-switch">
            ¿No tienes cuenta? 
            <button 
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
