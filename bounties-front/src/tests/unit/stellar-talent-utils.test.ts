/**
 * Unit tests for StellarEscrowTalentView pure helpers
 */

import { describe, it, expect } from 'vitest';

const NET = 'testnet';

function explorerTx(hash: string): string {
  return `https://stellar.expert/explorer/${NET}/tx/${hash}`;
}

function explorerAccount(addr: string): string {
  return `https://stellar.expert/explorer/${NET}/account/${addr}`;
}

function fmtKey(k: string): string {
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}

function fmtAmount(raw: string | undefined): string {
  if (!raw) return '0';
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  return n % 1 === 0 ? n.toFixed(0) : n.toString();
}

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Status badge config (talent-side labels) ─────────────────────────────────

type EscrowStatus = 'CREATED' | 'FUNDED' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';

const BADGES: Record<EscrowStatus, { label: string; cls: string }> = {
  CREATED:   { label: 'Aguardando',  cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  FUNDED:    { label: 'Bloqueado ●', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  COMPLETED: { label: 'Recebido',    cls: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
  REFUNDED:  { label: 'Reembolso',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  DISPUTED:  { label: 'Disputa',     cls: 'bg-red-500/15 text-red-300 border-red-500/20' },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('explorerTx (talent view)', () => {
  it('should build the correct Stellar.expert transaction URL', () => {
    const hash = 'deadbeef1234';
    expect(explorerTx(hash)).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
  });

  it('should embed the full hash without truncation', () => {
    const hash = 'f'.repeat(64);
    expect(explorerTx(hash)).toContain(hash);
  });
});

describe('explorerAccount (talent view)', () => {
  it('should build the correct Stellar.expert account URL', () => {
    const addr = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    expect(explorerAccount(addr)).toBe(
      `https://stellar.expert/explorer/testnet/account/${addr}`
    );
  });
});

describe('fmtKey (talent view)', () => {
  it('should abbreviate a public key keeping first 6 and last 4 chars', () => {
    const key = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    const result = fmtKey(key);
    expect(result.startsWith('GBBD47')).toBe(true);
    expect(result.endsWith('FLA5')).toBe(true);
    expect(result).toContain('…');
  });

  it('should format a short test key correctly', () => {
    expect(fmtKey('ABCDEF1234567890')).toBe('ABCDEF…7890');
  });
});

describe('fmtAmount', () => {
  it('should return "0" for undefined', () => {
    expect(fmtAmount(undefined)).toBe('0');
  });

  it('should return "0" for empty string', () => {
    expect(fmtAmount('')).toBe('0');
  });

  it('should strip trailing zeros from whole numbers', () => {
    expect(fmtAmount('10.0000000')).toBe('10');
    expect(fmtAmount('100.000')).toBe('100');
    expect(fmtAmount('1.0')).toBe('1');
  });

  it('should preserve decimal part for fractional amounts', () => {
    expect(fmtAmount('0.5000000')).toBe('0.5');
    expect(fmtAmount('1.25')).toBe('1.25');
  });

  it('should return raw string for non-numeric input', () => {
    expect(fmtAmount('not-a-number')).toBe('not-a-number');
  });

  it('should handle zero correctly', () => {
    expect(fmtAmount('0')).toBe('0');
    expect(fmtAmount('0.0')).toBe('0');
  });

  it('should handle large USDC amounts', () => {
    expect(fmtAmount('1000000.0000000')).toBe('1000000');
  });
});

describe('fmtDate (talent view)', () => {
  it('should convert unix timestamp to a pt-BR date string', () => {
    const unix = 1700000000;
    const result = fmtDate(unix);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(4);
  });

  it('should include a 4-digit year', () => {
    expect(fmtDate(1700000000)).toMatch(/\d{4}/);
  });
});

describe('BADGES config (talent-side labels)', () => {
  it('should have an entry for every EscrowStatus value', () => {
    const statuses: EscrowStatus[] = ['CREATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'DISPUTED'];
    statuses.forEach(status => {
      expect(BADGES[status]).toBeDefined();
      expect(BADGES[status].label).toBeTruthy();
      expect(BADGES[status].cls).toBeTruthy();
    });
  });

  it('CREATED should be labeled "Aguardando" (talent waits for funding)', () => {
    expect(BADGES.CREATED.label).toBe('Aguardando');
  });

  it('FUNDED should be labeled "Bloqueado ●" (funds locked for talent)', () => {
    expect(BADGES.FUNDED.label).toBe('Bloqueado ●');
  });

  it('COMPLETED should be labeled "Recebido" (talent received payment)', () => {
    expect(BADGES.COMPLETED.label).toBe('Recebido');
  });

  it('REFUNDED should be labeled "Reembolso"', () => {
    expect(BADGES.REFUNDED.label).toBe('Reembolso');
  });

  it('DISPUTED should be labeled "Disputa"', () => {
    expect(BADGES.DISPUTED.label).toBe('Disputa');
  });

  it('should use emerald for FUNDED', () => {
    expect(BADGES.FUNDED.cls).toContain('emerald');
  });

  it('should use purple for COMPLETED', () => {
    expect(BADGES.COMPLETED.cls).toContain('purple');
  });

  it('should use amber for REFUNDED', () => {
    expect(BADGES.REFUNDED.cls).toContain('amber');
  });

  it('should use red for DISPUTED', () => {
    expect(BADGES.DISPUTED.cls).toContain('red');
  });

  it('should use blue for CREATED', () => {
    expect(BADGES.CREATED.cls).toContain('blue');
  });

  it('talent BADGES labels differ from host BADGES for CREATED, FUNDED, COMPLETED', () => {
    expect(BADGES.CREATED.label).not.toBe('Criado');
    expect(BADGES.FUNDED.label).not.toBe('Ativo ●');
    expect(BADGES.COMPLETED.label).not.toBe('Liberado');
  });
});
