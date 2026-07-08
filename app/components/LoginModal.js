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
        <div
          className="modal-content login-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
        >
          <button className="modal-close" onClick={() => setIsLoginOpen(false)} aria-label="Cerrar">×</button>

          <h2 id="login-title" className="modal-title">INICIAR SESIÓN</h2>

          {authMessage && (
            <div
              role="alert"
              className={`auth-message ${authMessage.includes('Error') || authMessage.includes('incorrectos') ? 'error' : 'success'}`}
            >
              {authMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="sr-only">Contraseña</label>
              <input
                id="login-password"
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
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
