/**
 * Unit tests for stellarApi client (src/lib/api/stellar.ts)
 * Validates correct URLs, HTTP methods, request bodies, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock config before importing the module under test ──────────────────────

vi.mock('@/lib/api/config', () => ({
  API_BASE_URL: 'http://localhost:3002',
  getDefaultHeaders: vi.fn(() => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  })),
}));

import { stellarApi } from '@/lib/api/stellar';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetch(body: unknown, ok = true, status = 200): void {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: vi.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

const BASE = 'http://localhost:3002/api/stellar';

// ─── createEscrow ─────────────────────────────────────────────────────────────

describe('stellarApi.createEscrow', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should POST to /escrow/create with correct body', async () => {
    mockFetch({ success: true, data: { escrowPublicKey: 'GABC', transactionHash: 'tx1', preAuthTxs: { paymentTxHash: 'ph1', refundTxHash: 'rh1', deadline: 9999 } }, message: 'created' });

    const payload = { jobId: 'job-1', hostPublicKey: 'GHOST', talentPublicKey: 'GTALENT', amount: '100' };
    const res = await stellarApi.createEscrow(payload);

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/escrow/create`);
    expect(call[1].method).toBe('POST');
    expect(JSON.parse(call[1].body)).toEqual(payload);
    expect(res.success).toBe(true);
    expect(res.data.escrowPublicKey).toBe('GABC');
  });

  it('should throw when server returns 400', async () => {
    mockFetch({ message: 'Missing required fields' }, false, 400);
    await expect(stellarApi.createEscrow({ jobId: '', hostPublicKey: '', talentPublicKey: '', amount: '' }))
      .rejects.toThrow('Missing required fields');
  });

  it('should throw a generic HTTP error when message is absent', async () => {
    mockFetch({}, false, 500);
    await expect(stellarApi.createEscrow({ jobId: 'x', hostPublicKey: 'G', talentPublicKey: 'G2', amount: '1' }))
      .rejects.toThrow('HTTP 500');
  });
});

// ─── getStatus ────────────────────────────────────────────────────────────────

describe('stellarApi.getStatus', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should GET /escrow/:jobId/status', async () => {
    const status = { publicKey: 'GABC', status: 'FUNDED', balance: '100', lockedAmount: '100' };
    mockFetch({ success: true, data: status });

    const res = await stellarApi.getStatus('job-42');

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe(`${BASE}/escrow/job-42/status`);
    expect(res.data.status).toBe('FUNDED');
  });

  it('should throw when escrow is not found (404)', async () => {
    mockFetch({ message: 'Escrow not found' }, false, 404);
    await expect(stellarApi.getStatus('ghost-job')).rejects.toThrow('Escrow not found');
  });
});

// ─── getPaymentXDR ────────────────────────────────────────────────────────────

describe('stellarApi.getPaymentXDR', () => {
  it('should GET /escrow/:jobId/payment-xdr', async () => {
    mockFetch({ success: true, data: { paymentTxXDR: 'AAAAAA==', escrowPublicKey: 'GABC' } });

    const res = await stellarApi.getPaymentXDR('job-1');

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe(`${BASE}/escrow/job-1/payment-xdr`);
    expect(res.data.paymentTxXDR).toBe('AAAAAA==');
  });
});

// ─── getRefundXDR ─────────────────────────────────────────────────────────────

describe('stellarApi.getRefundXDR', () => {
  it('should GET /escrow/:jobId/refund-xdr', async () => {
    mockFetch({ success: true, data: { refundTxXDR: 'BBBBBB==', escrowPublicKey: 'GABC', deadline: 1999999999 } });

    const res = await stellarApi.getRefundXDR('job-1');

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe(`${BASE}/escrow/job-1/refund-xdr`);
    expect(res.data.deadline).toBe(1999999999);
  });
});

// ─── release ─────────────────────────────────────────────────────────────────

describe('stellarApi.release', () => {
  it('should POST to /escrow/release with jobId and hostSignedXDR', async () => {
    mockFetch({ success: true, data: { transactionHash: 'abc123' }, message: 'released' });

    const res = await stellarApi.release('job-1', 'signed-xdr-here');

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/escrow/release`);
    expect(call[1].method).toBe('POST');
    expect(JSON.parse(call[1].body)).toEqual({ jobId: 'job-1', hostSignedXDR: 'signed-xdr-here' });
    expect(res.data.transactionHash).toBe('abc123');
  });

  it('should throw on TimeBound error from server', async () => {
    mockFetch({ message: 'tx_bad_sequence' }, false, 500);
    await expect(stellarApi.release('job-1', 'xdr')).rejects.toThrow('tx_bad_sequence');
  });
});

// ─── refund ──────────────────────────────────────────────────────────────────

describe('stellarApi.refund', () => {
  it('should POST to /escrow/refund with correct body', async () => {
    mockFetch({ success: true, data: { transactionHash: 'refund-tx' }, message: 'refunded' });

    await stellarApi.refund('job-2', 'refund-xdr');

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/escrow/refund`);
    expect(JSON.parse(call[1].body)).toEqual({ jobId: 'job-2', hostSignedXDR: 'refund-xdr' });
  });

  it('should throw when deadline has not passed', async () => {
    mockFetch({ message: 'Refund not available yet — deadline has not passed' }, false, 400);
    await expect(stellarApi.refund('job-active', 'xdr')).rejects.toThrow('not available yet');
  });
});

// ─── openDispute ─────────────────────────────────────────────────────────────

describe('stellarApi.openDispute', () => {
  it('should POST to /dispute with jobId, reason and initiator', async () => {
    mockFetch({ success: true, message: 'dispute opened' });

    await stellarApi.openDispute('job-3', 'work not delivered', 'HOST');

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/dispute`);
    expect(JSON.parse(call[1].body)).toEqual({ jobId: 'job-3', reason: 'work not delivered', initiator: 'HOST' });
  });
});

// ─── claimDispute ─────────────────────────────────────────────────────────────

describe('stellarApi.claimDispute', () => {
  it('should POST to /dispute/claim with jobId and winnerSignedXDR', async () => {
    mockFetch({ success: true, data: { transactionHash: 'claim-tx' }, message: 'claimed' });

    await stellarApi.claimDispute('job-4', 'winner-signed-xdr');

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/dispute/claim`);
    expect(JSON.parse(call[1].body)).toEqual({ jobId: 'job-4', winnerSignedXDR: 'winner-signed-xdr' });
  });
});

// ─── admin ────────────────────────────────────────────────────────────────────

describe('stellarApi.admin', () => {
  it('listDisputes should GET /admin/disputes', async () => {
    mockFetch({ success: true, data: [] });

    await stellarApi.admin.listDisputes();

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe(`${BASE}/admin/disputes`);
  });

  it('resolveDispute should POST to /admin/resolve with jobId and winner', async () => {
    mockFetch({ success: true, data: { disputeResolutionXDR: 'xdr', winnerPublicKey: 'GW', winner: 'TALENT' }, message: 'resolved' });

    await stellarApi.admin.resolveDispute('job-5', 'TALENT');

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(`${BASE}/admin/resolve`);
    expect(JSON.parse(call[1].body)).toEqual({ jobId: 'job-5', winner: 'TALENT' });
  });
});

// ─── Authorization header ─────────────────────────────────────────────────────

describe('Authorization header', () => {
  it('should include Authorization header in every request', async () => {
    mockFetch({ success: true, data: {} });
    await stellarApi.getStatus('job-auth');

    const headers = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer test-token');
  });
});
