/**
 * Garante que o cookie httpOnly bounties_token exista antes de navegar para rotas
 * protegidas pelo middleware (ex.: /admin). Sem await, o middleware vê request sem cookie.
 */
export async function persistSessionCookie(token: string): Promise<void> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw new Error('session failed');
    }
  } catch {
    if (typeof document !== 'undefined') {
      document.cookie = `bounties_token=${token}; path=/; max-age=604800; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`;
    }
  }
}
