import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HotelUser } from '@workspace/api-client-react';

interface AuthContextType {
  user: HotelUser | null;
  token: string | null;
  login: (user: HotelUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HotelUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hotel_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user) setUser(parsed.user);
        if (parsed.token) setToken(parsed.token);
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const login = (u: HotelUser, t: string) => {
    localStorage.setItem('hotel_user', JSON.stringify({ user: u, token: t }));
    setUser(u);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('hotel_user');
    setUser(null);
    setToken(null);
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
