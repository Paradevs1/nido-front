/**
 * Utilitários para trabalhar com JWT (JSON Web Tokens)
 */

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodifica um token JWT sem validar a assinatura
 * (a validação da assinatura é feita no backend)
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Verifica se um token JWT está expirado
 * @param token - O token JWT a ser verificado
 * @returns true se o token está expirado, false caso contrário
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp está em segundos, Date.now() está em milissegundos
  const currentTime = Date.now() / 1000;
  
  // Adiciona um buffer de 60 segundos para evitar race conditions
  return decoded.exp < currentTime + 60;
}

/**
 * Obtém o tempo restante até o token expirar (em milissegundos)
 * @param token - O token JWT
 * @returns Tempo em milissegundos até a expiração, ou 0 se já expirou
 */
export function getTokenExpirationTime(token: string | null): number {
  if (!token) {
    return 0;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Date.now() / 1000;
  const timeUntilExpiration = (decoded.exp - currentTime) * 1000;

  return Math.max(0, timeUntilExpiration);
}

