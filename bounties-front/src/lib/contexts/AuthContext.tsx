'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setAuthToken, removeAuthToken, getAuthToken, setTokenExpiredCallback } from '@/lib/api/config';
import { persistSessionCookie } from '@/lib/auth/persistSessionCookie';
import { syncHostAuthUserCookie } from '@/lib/auth/syncHostAuthUserCookie';
import { isTokenExpired, getTokenExpirationTime, decodeJWT } from '@/lib/utils/jwt';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'creator' | 'host' | 'admin';
  avatar?: string;
  registerCompleted?: boolean;
  /** Conta host aguardando ativação pelo admin (`inactive` no backend). */
  accountStatus?: 'active' | 'inactive';
  active_account_host?: boolean; // Flag para verificar se o host pagou os $200
  createdAt: Date;
  updatedAt: Date;
  first_login?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHostAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, token?: string) => Promise<void>;
  logout: () => void;
  setUserData: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsHostAuthenticated: (isHost: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Remove o cookie httpOnly via API route server-side.
 */
async function clearHttpOnlyCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    // Fallback: limpar cookies acessiveis por JS
    if (typeof document !== 'undefined') {
      document.cookie = 'bounties_token=; path=/; max-age=0';
      document.cookie = 'auth_user=; path=/; max-age=0';
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configurar callback para quando o token expirar
  useEffect(() => {
    setTokenExpiredCallback(() => {
      setUser(null);
      setAccessTokenState(null);
      setIsHostAuthenticated(false);
    });

    // Ouvir evento customizado de token expirado
    const handleTokenExpiredEvent = () => {
      setUser(null);
      setAccessTokenState(null);
      setIsHostAuthenticated(false);
    };

    window.addEventListener('auth:token-expired', handleTokenExpiredEvent);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpiredEvent);
    };
  }, []);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = getAuthToken();
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          // Verificar se o token está expirado
          if (isTokenExpired(storedToken)) {
            removeAuthToken();
            localStorage.removeItem('auth_user');
            localStorage.removeItem('bounties_user');

            // Limpar cookie httpOnly
            clearHttpOnlyCookie();

            setIsLoading(false);

            // Redirecionar se estiver em rota protegida
            const currentPath = window.location.pathname;
            if (currentPath.includes('/host/') || currentPath.includes('/creator/')) {
              const returnTo = `${window.location.pathname}${window.location.search || ""}`;
              setTimeout(
                () => window.location.replace(`/?returnTo=${encodeURIComponent(returnTo)}`),
                100
              );
            } else if (currentPath.startsWith('/admin')) {
              setTimeout(() => window.location.replace('/'), 100);
            }
            return;
          }

          const userData = JSON.parse(storedUser) as User;
          if (
            userData.role === 'host' &&
            !userData.accountStatus &&
            storedToken
          ) {
            const dec = decodeJWT(storedToken);
            if (dec && String(dec.status ?? '').toLowerCase() === 'inactive') {
              userData.accountStatus = 'inactive';
            } else if (!userData.accountStatus) {
              userData.accountStatus = 'active';
            }
          }
          setUser(userData);
          setAccessTokenState(storedToken);
          setIsHostAuthenticated(userData.role === 'host' || userData.role === 'admin');
          if (userData.role === 'host' || userData.role === 'admin') {
            syncHostAuthUserCookie(userData);
          }
        } catch (error) {
          removeAuthToken();
          localStorage.removeItem('auth_user');
          clearHttpOnlyCookie();

          // Redirecionar em caso de erro também
          const currentPath = window.location.pathname;
          if (currentPath.includes('/host/') || currentPath.includes('/creator/')) {
            const returnTo = `${window.location.pathname}${window.location.search || ""}`;
            setTimeout(
              () => window.location.replace(`/?returnTo=${encodeURIComponent(returnTo)}`),
              100
            );
          } else if (currentPath.startsWith('/admin')) {
            setTimeout(() => window.location.replace('/'), 100);
          }
        }
      } else {
        // Se não tem token nem usuário, mas está em rota protegida, redirecionar
        const currentPath = window.location.pathname;
        if (currentPath.includes('/host/') || currentPath.includes('/creator/')) {
          const returnTo = `${window.location.pathname}${window.location.search || ""}`;
          setTimeout(
            () => window.location.replace(`/?returnTo=${encodeURIComponent(returnTo)}`),
            100
          );
        } else if (currentPath.startsWith('/admin')) {
          setTimeout(() => window.location.replace('/'), 100);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  const login = async (userData: User, token?: string) => {
    setUser(userData);
    if (token) {
      setAccessTokenState(token);
      setAuthToken(token);
      await persistSessionCookie(token);
    }
    setIsHostAuthenticated(userData.role === 'host' || userData.role === 'admin');

    // Salvar user no localStorage (dados nao-sensiveis para UI)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      if (userData.role === 'host' || userData.role === 'admin') {
        syncHostAuthUserCookie(userData);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setAccessTokenState(null);
    setIsHostAuthenticated(false);
    removeAuthToken();

    // Remover cookie httpOnly via API route
    clearHttpOnlyCookie();

    // Remover do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      syncHostAuthUserCookie(null);

      localStorage.removeItem('updatedTwitter');
      localStorage.removeItem('updatedTiktok');
      localStorage.removeItem('updatedInstagram');
      localStorage.removeItem('click_link_twitter');
      localStorage.removeItem('click_link_tiktok');
      localStorage.removeItem('click_link_instagram');

      // Remover todas as chaves que começam com 'wagmi'
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.toLowerCase().startsWith('wagmi')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      setAuthToken(token);
    } else {
      removeAuthToken();
    }
  };

  const setUserData = (userData: User | null) => {
    setUser(userData);
    if (typeof window === 'undefined') return;
    if (userData) {
      const serialized = JSON.stringify(userData);
      localStorage.setItem('auth_user', serialized);
      if (userData.role === 'host' || userData.role === 'admin') {
        syncHostAuthUserCookie(userData);
      }
      // Manter alinhado com o fluxo Privy (onboarding grava first_login=false só no auth_user antes)
      if (localStorage.getItem('bounties_token')) {
        localStorage.setItem('bounties_user', serialized);
      }
    } else {
      localStorage.removeItem('auth_user');
      syncHostAuthUserCookie(null);
    }
  };

  // Verificar periodicamente se o token expirou
  useEffect(() => {
    // Limpar intervalos anteriores
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Se não estiver autenticado, não fazer nada
    if (!isAuthenticated) {
      return;
    }

    const checkTokenExpiration = () => {
      const token = accessToken || getAuthToken();

      if (!token) {
        logout();
        return;
      }

      if (isTokenExpired(token)) {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return;
      }

      // Calcular tempo até expiração
      const timeUntilExpiration = getTokenExpirationTime(token);

      // Se faltar menos de 5 minutos, configurar um timeout para fazer logout
      if (timeUntilExpiration > 0 && timeUntilExpiration < 5 * 60 * 1000) {
        timeoutRef.current = setTimeout(() => {
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }, timeUntilExpiration);
      }
    };

    // Verificar imediatamente
    checkTokenExpiration();

    // Verificar a cada 1 minuto
    intervalRef.current = setInterval(checkTokenExpiration, 60 * 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, accessToken]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isHostAuthenticated,
    accessToken,
    isLoading,
    login,
    logout,
    setUserData,
    setAccessToken,
    setIsHostAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Retornar valores padrão em vez de lançar erro
    return {
      user: null,
      isAuthenticated: false,
      isHostAuthenticated: false,
      accessToken: null,
      isLoading: false,
      login: async () => {},
      logout: () => {},
      setUserData: () => {},
      setAccessToken: () => {},
      setIsHostAuthenticated: () => {},
    };
  }
  return context;
}
