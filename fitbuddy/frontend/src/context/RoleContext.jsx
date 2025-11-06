/**
 * RoleContext.jsx
 * Manages user role state across the application
 * Provides role information and authentication utilities
 */

import { createContext, useContext, useState, useEffect } from 'react';
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
  
  // Initialize state from localStorage if available
  const getInitialUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log('Initial user loaded from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    return null;
  };

  const initialUser = getInitialUser();
  const [role, setRole] = useState(initialUser?.role || 'member');
  const [user, setUser] = useState(initialUser);

  // Update role and user when localStorage changes or on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('User loaded in useEffect:', parsedUser);
          setUser(parsedUser);
          setRole(parsedUser.role || 'member');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

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
