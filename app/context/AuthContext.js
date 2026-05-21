'use client';

import { createContext, useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../../lib/supabaseOperations';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Email válido con un solo @ obligatorio
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
  const passwordPattern = /^.{6,}$/;
  const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/;

  const isValidEmail = (email) => emailPattern.test(email.trim());
  const isValidPassword = (password) => passwordPattern.test(password);
  const isValidName = (name) => namePattern.test(name.trim());

  // Check logged in user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const register = async (email, password, name) => {
    try {
      // Validate name
      if (!isValidName(name)) {
        setAuthMessage('El nombre debe tener entre 2 y 50 letras y espacios');
        return false;
      }

      // Validate email
      if (!isValidEmail(email)) {
        setAuthMessage('Ingresa un email válido');
        return false;
      }

      // Validate password
      if (!isValidPassword(password)) {
        setAuthMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      const result = await registerUser(name, email, password);

      if (!result.success) {
        if (result.error?.includes('already registered')) {
          setAuthMessage('Este email ya está registrado');
        } else {
          setAuthMessage('Error al registrar: ' + result.error);
        }
        return false;
      }

      const loginResult = await loginUser(email, password);
      if (loginResult.success) {
        setUser(loginResult.user);
        setAuthMessage('¡Cuenta creada exitosamente y sesión iniciada!');
        setIsRegisterOpen(false);
        return true;
      }

      setAuthMessage('Cuenta creada, pero no se pudo iniciar sesión: ' + loginResult.error);
      return false;
    } catch (error) {
      setAuthMessage('Error al registrar');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      // Validate email
      if (!isValidEmail(email)) {
        setAuthMessage('Email no válido');
        return false;
      }

      // Validate password format
      if (password.length < 6) {
        setAuthMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      const result = await loginUser(email, password);

      if (!result.success) {
        setAuthMessage(result.error || 'Email o contraseña incorrectos');
        return false;
      }

      setUser(result.user);
      setAuthMessage('¡Sesión iniciada!');
      setIsLoginOpen(false);
      
      return true;
    } catch (error) {
      setAuthMessage('Error al iniciar sesión');
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setAuthMessage('Sesión cerrada');
    } catch (error) {
      setAuthMessage('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoginOpen,
        setIsLoginOpen,
        isRegisterOpen,
        setIsRegisterOpen,
        login,
        register,
        logout,
        authMessage,
        setAuthMessage,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
