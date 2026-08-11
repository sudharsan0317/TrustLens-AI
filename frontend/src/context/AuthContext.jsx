// File: src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { loginUser, signupUser, googleOAuthLogin, logoutUser as apiLogout, microsoftOAuthLogin, verifyEmail as apiVerifyEmail, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Derived auth state: true only if we have BOTH a user object AND a valid token
  const isAuthenticated = !!user && !!localStorage.getItem('token');

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    if (data.requires_2fa) return data;
    const userData = data.user || { email, name: email.split('@')[0] };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const finalizeLogin = (data) => {
    const userData = data.user;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (fullName, email, password) => {
    const data = await signupUser(fullName, email, password);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    const userData = data.user || { email, name: fullName };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const loginWithGoogle = async (googleAccessToken) => {
    const data = await googleOAuthLogin(googleAccessToken);
    if (data.requires_2fa) return data;
    const userData = data.user || { name: 'User', email: '' };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const loginWithMicrosoft = async (msAccessToken) => {
    const data = await microsoftOAuthLogin(msAccessToken);
    if (data.requires_2fa) return data;
    const userData = data.user || { name: 'User', email: '' };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const verifyEmail = async (token) => {
    return await apiVerifyEmail(token);
  };

  const forgotPassword = async (email) => {
    return await apiForgotPassword(email);
  };

  const resetPassword = async (token, newPassword) => {
    return await apiResetPassword(token, newPassword);
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, finalizeLogin, signup, loginWithGoogle, loginWithMicrosoft, verifyEmail, forgotPassword, resetPassword, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);