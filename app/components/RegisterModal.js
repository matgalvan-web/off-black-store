'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RegisterModal() {
  const { isRegisterOpen, setIsRegisterOpen, register, authMessage, setAuthMessage, setIsLoginOpen } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAuthMessage('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(email, password, name);
      if (success) {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
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

  if (!isRegisterOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={() => setIsRegisterOpen(false)}>
        <div
          className="modal-content register-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
        >
          <button className="modal-close" onClick={() => setIsRegisterOpen(false)} aria-label="Cerrar">×</button>

          <h2 id="register-title" className="modal-title">REGISTRARSE</h2>

          {authMessage && (
            <div
              role="alert"
              className={`auth-message ${authMessage.includes('Error') || authMessage.includes('ya está') ? 'error' : 'success'}`}
            >
              {authMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="register-name" className="sr-only">Nombre</label>
              <input
                id="register-name"
                type="text"
                placeholder="NOMBRE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="sr-only">Email</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="sr-only">Contraseña</label>
              <input
                id="register-password"
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm" className="sr-only">Confirmar contraseña</label>
              <input
                id="register-confirm"
                type="password"
                placeholder="CONFIRMAR CONTRASEÑA"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="modal-add-btn" disabled={isLoading}>
              {isLoading ? 'CARGANDO...' : 'REGISTRARSE'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta?
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
