import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to authenticate token', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });
    const {
      access_token
    } = res.data;
    localStorage.setItem('token', access_token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
    localStorage.setItem('user', JSON.stringify(userRes.data));
    return userRes.data;
  };
  const registerUser = async (name, email, password, phone, role) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
      role
    });
    return res.data;
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    setUser,
    loading,
    login,
    register: registerUser,
    logout
  }}>
            {children}
        </AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);