import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  roles?: { 
    slug: string; 
    name: string;
    permissions?: { slug: string; name: string }[];
  }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permissionSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('auth_token', newToken);
  };

  const hasPermission = (permissionSlug: string) => {
    if (!user || !user.roles) return false;
    
    // Super Administrator bypass
    const isSuperAdmin = user.roles.some(role => role.slug === 'super-administrator');
    if (isSuperAdmin) return true;

    // Check if any role has the permission
    return user.roles.some(role => 
      role.permissions?.some(p => p.slug === permissionSlug)
    );
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  const checkAuth = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Check auth failed', error);
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, checkAuth, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
