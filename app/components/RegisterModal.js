'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RegisterModal() {
  const { isRegisterOpen, setIsRegisterOpen, register, authMessage, setAuthMessage } = useContext(AuthContext);
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
        <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setIsRegisterOpen(false)}>×</button>
          
          <h2 className="modal-title">REGISTRARSE</h2>
          
          {authMessage && (
            <div className={`auth-message ${authMessage.includes('Error') || authMessage.includes('ya está') ? 'error' : 'success'}`}>
              {authMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="NOMBRE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
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
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="CONFIRMAR CONTRASEÑA"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
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
                setTimeout(() => {
                  const { setIsLoginOpen } = useContext(AuthContext);
                  setIsLoginOpen(true);
                }, 0);
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
