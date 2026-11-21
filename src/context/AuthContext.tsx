import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, fullName: string, password?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const MASTER_USER: Profile = {
  id: '5d3adecb-0882-45cb-9ab0-7acee068782e',
  email: 'elitetrader_1795040702205@test.com',
  fullName: 'Master Trader',
  preferredCurrency: 'USD',
  theme: 'dark',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const fetchProfile = async () => {
    const savedUserId = localStorage.getItem('etj_user_id');
    const savedToken = localStorage.getItem('etj_token');

    if (!savedUserId && !savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getProfile();
      if (res.profile) {
        setUser(res.profile);
        if (res.profile.theme) {
          setTheme(res.profile.theme);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.setAuth(null, null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password?: string) => {
    await api.login(email, password);
    await fetchProfile();
  };

  const register = async (email: string, fullName: string, password?: string) => {
    await api.register(email, fullName, password);
    await fetchProfile();
  };

  const logout = () => {
    api.setAuth(null, null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const res = await api.updateProfile(updates);
    if (res.profile) {
      setUser(res.profile);
      if (res.profile.theme) setTheme(res.profile.theme);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      updateProfile({ theme: nextTheme }).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
