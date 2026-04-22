import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isTokenExpired, getTokenExpirationTime } from '@/lib/utils/jwt';
import { getAuthToken } from '@/lib/api/config';

/**
 * Hook que verifica periodicamente se o token JWT expirou
 * e faz logout automático quando necessário
 */
export function useTokenExpirationCheck() {
  const { logout, isAuthenticated, accessToken } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        console.log('Token expirado - fazendo logout automático');
        logout();
        return;
      }

      // Calcular tempo até expiração
      const timeUntilExpiration = getTokenExpirationTime(token);
      
      // Se faltar menos de 5 minutos, configurar um timeout para fazer logout
      if (timeUntilExpiration > 0 && timeUntilExpiration < 5 * 60 * 1000) {
        timeoutRef.current = setTimeout(() => {
          console.log('Token expirou - fazendo logout automático');
          logout();
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
  }, [isAuthenticated, accessToken, logout]);
}

