import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleAuthService } from '../services/auth';

const AuthContext = createContext(null);

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
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userEmail = localStorage.getItem('user_email');
        
        if (token && userEmail) {
          setUser({
            email: userEmail,
            token: token,
            name: userEmail.split('@')[0]
          });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, we'll use email as token
      // In production, this would be Google OAuth
      const token = email;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_email', email);
      
      const userData = {
        email: email,
        token: token,
        name: email.split('@')[0]
      };
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      setUser(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
