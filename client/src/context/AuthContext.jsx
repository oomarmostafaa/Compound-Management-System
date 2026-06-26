import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, apiPrivate } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on boot
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setAccessToken(storedToken);
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            residentId: payload.residentId || null,
            staffId: payload.staffId || null
          });
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);



  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { user: userData, accessToken: newAccessToken } = response.data.data;

    setAccessToken(newAccessToken);
    localStorage.setItem('accessToken', newAccessToken);
    setUser(userData);

    return userData;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading, setAccessToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);