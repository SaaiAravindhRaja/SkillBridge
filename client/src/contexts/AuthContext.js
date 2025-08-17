import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // API utility handles authorization headers automatically
    }
    
    setLoading(false);
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login successful, response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors specifically
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to the server. Please check your internet connection or try again later.',
          isNetworkError: true
        };
      }
      
      // Handle other errors
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid email or password' 
      };
    }
  };

  const registerWithEmail = async (email, password, name, userType, additionalInfo) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        userType,
        additionalInfo
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  // Keep for backward compatibility
  const login = async (googleData, userType, additionalInfo) => {
    try {
      const response = await api.post('/auth/google', {
        googleId: googleData.googleId,
        email: googleData.profileObj.email,
        name: googleData.profileObj.name,
        userType,
        additionalInfo
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login, // Keep for backward compatibility
    loginWithEmail,
    registerWithEmail,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};