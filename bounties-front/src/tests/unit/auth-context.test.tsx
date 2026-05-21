/**
 * Unit tests for AuthContext (src/lib/contexts/AuthContext.tsx)
 * Tests login, logout, token expiry, and localStorage restore.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth/persistSessionCookie', () => ({
  persistSessionCookie: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth/syncHostAuthUserCookie', () => ({
  syncHostAuthUserCookie: vi.fn(),
}));

// fetch is used by clearHttpOnlyCookie (DELETE /api/auth/session)
global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-sig`;
}

const NOW = Math.floor(Date.now() / 1000);

const VALID_TOKEN = buildToken({ exp: NOW + 3600, userId: 'u1', role: 'host' });
const EXPIRED_TOKEN = buildToken({ exp: NOW - 3600 });

const MOCK_USER = {
  id: 'u1',
  username: 'testhost',
  email: 'host@test.com',
  role: 'host' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

// ─── Baseline ─────────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should start with user = null and isAuthenticated = false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('AuthContext — login()', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should set user and isAuthenticated after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user!.email).toBe('host@test.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set isHostAuthenticated = true for host role', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });

    expect(result.current.isHostAuthenticated).toBe(true);
  });

  it('should persist user to localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });

    const stored = localStorage.getItem('auth_user');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).email).toBe('host@test.com');
  });

  it('should set accessToken when token provided', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });

    expect(result.current.accessToken).toBe(VALID_TOKEN);
  });

  it('should set isHostAuthenticated = false for creator role', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const creator = { ...MOCK_USER, role: 'creator' as const };
    await act(async () => {
      await result.current.login(creator);
    });

    expect(result.current.isHostAuthenticated).toBe(false);
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('AuthContext — logout()', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should clear user and isAuthenticated after logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isHostAuthenticated).toBe(false);
  });

  it('should clear localStorage on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login(MOCK_USER, VALID_TOKEN);
    });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('bounties_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should call DELETE /api/auth/session to clear httpOnly cookie', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.clearAllMocks();
    act(() => {
      result.current.logout();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', { method: 'DELETE' });
  });
});

// ─── token restore on init ───────────────────────────────────────────────────

describe('AuthContext — token restore on init', () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should restore user from localStorage when token is valid', async () => {
    localStorage.setItem('bounties_token', VALID_TOKEN);
    localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should NOT restore user when token is expired', async () => {
    localStorage.setItem('bounties_token', EXPIRED_TOKEN);
    localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should clear localStorage when expired token found on init', async () => {
    localStorage.setItem('bounties_token', EXPIRED_TOKEN);
    localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(localStorage.getItem('bounties_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should stay null when localStorage is empty', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});
