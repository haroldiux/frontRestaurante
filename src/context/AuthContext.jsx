import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de sesión al cargar
    const storedUser = localStorage.getItem('restaurant_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (role) => {
    // Simular login
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Usuario ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role, // 'admin', 'waiter', 'kitchen', 'cashier', 'client'
      online: true
    };
    setUser(newUser);
    localStorage.setItem('restaurant_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restaurant_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
