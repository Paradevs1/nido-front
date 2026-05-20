import { API_BASE_URL, getDefaultHeaders } from './config';

const STELLAR_BASE = `${API_BASE_URL}/api/stellar`;

export interface StellarEscrowStatus {
  publicKey: string;
  hostPublicKey: string;
  talentPublicKey: string;
  jobId: string;
  status: 'CREATED' | 'FUNDED' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';
  balance: string;
  lockedAmount: string;
  deadline?: number;
  paymentTxXDR?: string;
  refundTxXDR?: string;
  releaseTxHash?: string;
  refundCloseTxHash?: string;
  createdAt: string;
  // Dispute
  disputeReason?: string;
  disputeInitiator?: 'HOST' | 'TALENT';
  disputeWinner?: 'HOST' | 'TALENT';
  disputeResolutionXDR?: string;
  disputeClosedTxHash?: string;
}

export interface CreateEscrowPayload {
  jobId: string;
  hostPublicKey: string;
  talentPublicKey: string;
  amount: string;
  deadlineDays?: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const stellarApi = {
  createEscrow: async (payload: CreateEscrowPayload) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/create`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: { escrowPublicKey: string; transactionHash: string; preAuthTxs: { paymentTxHash: string; refundTxHash: string; deadline: number } }; message: string }>(res);
  },

  getStatus: async (jobId: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/${jobId}/status`, {
      headers: getDefaultHeaders(),
    });
    return handleResponse<{ success: boolean; data: StellarEscrowStatus }>(res);
  },

  getPaymentXDR: async (jobId: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/${jobId}/payment-xdr`, {
      headers: getDefaultHeaders(),
    });
    return handleResponse<{ success: boolean; data: { paymentTxXDR: string; escrowPublicKey: string } }>(res);
  },

  getRefundXDR: async (jobId: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/${jobId}/refund-xdr`, {
      headers: getDefaultHeaders(),
    });
    return handleResponse<{ success: boolean; data: { refundTxXDR: string; escrowPublicKey: string; deadline: number } }>(res);
  },

  release: async (jobId: string, hostSignedXDR: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/release`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ jobId, hostSignedXDR }),
    });
    return handleResponse<{ success: boolean; data: { transactionHash: string }; message: string }>(res);
  },

  refund: async (jobId: string, hostSignedXDR: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/refund`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ jobId, hostSignedXDR }),
    });
    return handleResponse<{ success: boolean; data: { transactionHash: string }; message: string }>(res);
  },

  // ─── Dispute ──────────────────────────────────────────────────────────────────

  openDispute: async (jobId: string, reason: string, initiator: 'HOST' | 'TALENT') => {
    const res = await fetch(`${STELLAR_BASE}/dispute`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ jobId, reason, initiator }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  getDisputeXDR: async (jobId: string) => {
    const res = await fetch(`${STELLAR_BASE}/escrow/${jobId}/dispute-xdr`, {
      headers: getDefaultHeaders(),
    });
    return handleResponse<{ success: boolean; data: { disputeResolutionXDR: string; winner: 'HOST' | 'TALENT'; jobId: string } }>(res);
  },

  claimDispute: async (jobId: string, winnerSignedXDR: string) => {
    const res = await fetch(`${STELLAR_BASE}/dispute/claim`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ jobId, winnerSignedXDR }),
    });
    return handleResponse<{ success: boolean; data: { transactionHash: string }; message: string }>(res);
  },

  // ─── Admin ────────────────────────────────────────────────────────────────────

  admin: {
    listDisputes: async () => {
      const res = await fetch(`${STELLAR_BASE}/admin/disputes`, {
        headers: getDefaultHeaders(),
      });
      return handleResponse<{ success: boolean; data: StellarEscrowStatus[] }>(res);
    },

    resolveDispute: async (jobId: string, winner: 'HOST' | 'TALENT') => {
      const res = await fetch(`${STELLAR_BASE}/admin/resolve`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ jobId, winner }),
      });
      return handleResponse<{ success: boolean; data: { disputeResolutionXDR: string; winnerPublicKey: string; winner: 'HOST' | 'TALENT' }; message: string }>(res);
    },
  },
};
