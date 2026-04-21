import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
/* eslint-disable react-refresh/only-export-components */

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setUser({
              ...response.data,
              name: response.data.nombre,
              role: response.data.rol?.nombre // Mapear rol de backend a frontend
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setUser({
          ...user,
          name: user.nombre,
          role: user.rol?.nombre
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error', error);
    } finally {
        setUser(null);
        localStorage.removeItem('token');
    }
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
