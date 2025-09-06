// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/auth'; // Adjust to your backend URL

interface User {
  _id: string;
  phoneNumber: string;
  userType: 'Consumer' | 'Manufacturer' | 'FarmerUnion' | 'Laboratory';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  unionName?: string;
  labName?: string;
  email?: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        await refreshTokens();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      await logout();
      return false;
    }
  };

  const login = (userData: User, accessToken: string, refreshTokenValue: string) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshTokenValue);
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    refreshTokens,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};