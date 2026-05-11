'use client';

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  const register = (email, password, name) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Verificar si el email ya existe
      if (users.find(u => u.email === email)) {
        setAuthMessage('Este email ya está registrado');
        return false;
      }

      // Validar contraseña
      if (password.length < 6) {
        setAuthMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // En producción, esto debe ser hasheado
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }));
      
      setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      setAuthMessage('¡Cuenta creada exitosamente!');
      setIsRegisterOpen(false);
      
      return true;
    } catch (error) {
      setAuthMessage('Error al registrar');
      return false;
    }
  };

  const login = (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        setAuthMessage('Email o contraseña incorrectos');
        return false;
      }

      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      setAuthMessage('¡Sesión iniciada!');
      setIsLoginOpen(false);
      
      return true;
    } catch (error) {
      setAuthMessage('Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setAuthMessage('Sesión cerrada');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
