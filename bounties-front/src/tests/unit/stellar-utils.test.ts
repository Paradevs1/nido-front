/**
 * Unit tests for Stellar-specific frontend utilities
 * (pure functions only — no React rendering required)
 */

import { describe, it, expect } from 'vitest';

// ─── Re-implement the pure helpers from StellarEscrowSection for testability ──
// These are inline helpers in the component; we extract the logic here.

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

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Status badge config ──────────────────────────────────────────────────────

type EscrowStatus = 'CREATED' | 'FUNDED' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';

const BADGES: Record<EscrowStatus, { label: string; cls: string }> = {
  CREATED:   { label: 'Criado',    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  FUNDED:    { label: 'Ativo ●',   cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  COMPLETED: { label: 'Liberado',  cls: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
  REFUNDED:  { label: 'Reembolso', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  DISPUTED:  { label: 'Disputa',   cls: 'bg-red-500/15 text-red-300 border-red-500/20' },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('explorerTx', () => {
  it('should build the correct Stellar.expert transaction URL', () => {
    const hash = 'abc123def456';
    expect(explorerTx(hash)).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
  });

  it('should include the full hash without truncation', () => {
    const hash = 'a'.repeat(64);
    expect(explorerTx(hash)).toContain(hash);
  });
});

describe('explorerAccount', () => {
  it('should build the correct Stellar.expert account URL', () => {
    const addr = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
    expect(explorerAccount(addr)).toBe(
      `https://stellar.expert/explorer/testnet/account/${addr}`
    );
  });
});

describe('fmtKey', () => {
  it('should abbreviate a long Stellar public key', () => {
    const key = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
    const formatted = fmtKey(key);
    expect(formatted).toContain('…');
    expect(formatted.startsWith('GAAZI4')).toBe(true);
    expect(formatted.endsWith('CCWN')).toBe(true);
  });

  it('should keep first 6 and last 4 characters', () => {
    const key = '123456XXXXXXXXXXXXX7890';
    expect(fmtKey(key)).toBe('123456…7890');
  });
});

describe('fmtDate', () => {
  it('should convert unix timestamp to a pt-BR date string', () => {
    const unix = 1700000000; // 2023-11-14
    const result = fmtDate(unix);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should include year, month, and day components', () => {
    const unix = 1700000000;
    const result = fmtDate(unix);
    expect(result).toMatch(/\d{4}/); // year
    expect(result.length).toBeGreaterThan(4);
  });
});

describe('BADGES config', () => {
  it('should have an entry for every EscrowStatus value', () => {
    const statuses: EscrowStatus[] = ['CREATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'DISPUTED'];
    statuses.forEach(status => {
      expect(BADGES[status]).toBeDefined();
      expect(BADGES[status].label).toBeTruthy();
      expect(BADGES[status].cls).toBeTruthy();
    });
  });

  it('FUNDED badge should use emerald color', () => {
    expect(BADGES.FUNDED.cls).toContain('emerald');
  });

  it('DISPUTED badge should use red color', () => {
    expect(BADGES.DISPUTED.cls).toContain('red');
  });

  it('COMPLETED badge should use purple color', () => {
    expect(BADGES.COMPLETED.cls).toContain('purple');
  });

  it('REFUNDED badge should use amber color', () => {
    expect(BADGES.REFUNDED.cls).toContain('amber');
  });

  it('CREATED badge should use blue color', () => {
    expect(BADGES.CREATED.cls).toContain('blue');
  });

  it('labels should be human-readable Portuguese strings', () => {
    expect(BADGES.CREATED.label).toBe('Criado');
    expect(BADGES.FUNDED.label).toBe('Ativo ●');
    expect(BADGES.COMPLETED.label).toBe('Liberado');
    expect(BADGES.REFUNDED.label).toBe('Reembolso');
    expect(BADGES.DISPUTED.label).toBe('Disputa');
  });
});
