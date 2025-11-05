/**
 * RoleContext.jsx
 * Manages user role state across the application
 * Provides role information and authentication utilities
 */

import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('member');
  const [user, setUser] = useState({
    name: 'Haider Ali',
    email: 'haider@fitbuddy.com',
    avatar: null,
  });

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    role,
    setRole,
    user,
    setUser,
    logout,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
