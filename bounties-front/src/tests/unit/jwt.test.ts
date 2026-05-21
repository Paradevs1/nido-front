import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeJWT, isTokenExpired, getTokenExpirationTime } from '@/lib/utils/jwt';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

const NOW_SECONDS = Math.floor(Date.now() / 1000);

// ─── decodeJWT ───────────────────────────────────────────────────────────────

describe('decodeJWT', () => {
  it('should return null for null input', () => {
    expect(decodeJWT(null as any)).toBeNull();
  });

  it('should return null for an empty string', () => {
    expect(decodeJWT('')).toBeNull();
  });

  it('should return null for a token with wrong number of parts', () => {
    expect(decodeJWT('only.two')).toBeNull();
    expect(decodeJWT('a.b.c.d')).toBeNull();
  });

  it('should decode a valid token and return the payload', () => {
    const token = buildToken({ userId: 'abc', role: 'HOST', exp: NOW_SECONDS + 3600 });
    const decoded = decodeJWT(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe('abc');
    expect(decoded!.role).toBe('HOST');
  });

  it('should return null for malformed base64 payload', () => {
    const result = decodeJWT('header.!!!invalid!!!.sig');
    expect(result).toBeNull();
  });

  it('should handle URL-safe base64 (- and _ chars)', () => {
    const payload = { id: 'test-user_123' };
    const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const token = `header.${b64}.sig`;
    const decoded = decodeJWT(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe('test-user_123');
  });
});

// ─── isTokenExpired ───────────────────────────────────────────────────────────

describe('isTokenExpired', () => {
  it('should return true for null token', () => {
    expect(isTokenExpired(null)).toBe(true);
  });

  it('should return true for empty string token', () => {
    expect(isTokenExpired('')).toBe(true);
  });

  it('should return true for a malformed token', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });

  it('should return true for a token without exp claim', () => {
    const token = buildToken({ userId: 'abc' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for an already-expired token', () => {
    const token = buildToken({ exp: NOW_SECONDS - 3600 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for a token expiring within the 60s buffer', () => {
    const token = buildToken({ exp: NOW_SECONDS + 30 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return false for a valid token expiring in 1 hour', () => {
    const token = buildToken({ exp: NOW_SECONDS + 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('should return false for a token with a very distant expiry', () => {
    const token = buildToken({ exp: NOW_SECONDS + 365 * 24 * 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });
});

// ─── getTokenExpirationTime ────────────────────────────────────────────────

describe('getTokenExpirationTime', () => {
  it('should return 0 for null token', () => {
    expect(getTokenExpirationTime(null)).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(getTokenExpirationTime('')).toBe(0);
  });

  it('should return 0 for a token without exp', () => {
    const token = buildToken({ userId: 'abc' });
    expect(getTokenExpirationTime(token)).toBe(0);
  });

  it('should return 0 for an already-expired token', () => {
    const token = buildToken({ exp: NOW_SECONDS - 3600 });
    expect(getTokenExpirationTime(token)).toBe(0);
  });

  it('should return a positive number for a future token', () => {
    const token = buildToken({ exp: NOW_SECONDS + 3600 });
    const remaining = getTokenExpirationTime(token);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(3600 * 1000);
  });

  it('should return approximately 3600000ms for a token expiring in 1 hour', () => {
    const token = buildToken({ exp: NOW_SECONDS + 3600 });
    const remaining = getTokenExpirationTime(token);
    expect(remaining).toBeGreaterThan(3595 * 1000);
    expect(remaining).toBeLessThanOrEqual(3601 * 1000);
  });
});
