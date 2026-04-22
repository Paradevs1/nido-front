import { API_ENDPOINTS, getDefaultHeaders } from './config';

export interface PaymentHostCreateRequest {
  walletAddress: string;
  campaignId: string;
  chain: string;
  symbol: string;
}

export interface PaymentHostCreateResponse {
  data: {
    paymentId: string;
    destinationAddress: string;
    amount: number;
    chain: string;
    token: string;
    tokenContractAddress?: string; // Endereço do contrato do token (para EVM) ou mint address (para Solana)
    message: string;
  };
}

export interface PaymentHostConfirmRequest {
  paymentId: string;
  taxId: string;
  campaignId: string;
  chain: string;
  symbol: string;
}

export interface PaymentHostConfirmResponse {
  data: {
    paymentId: string;
    success: boolean;
    message: string;
  };
}

/**
 * Criar entrada de pagamento do host
 */
export const paymentHostCreate = async (
  data: PaymentHostCreateRequest
): Promise<PaymentHostCreateResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.PAYMENT_HOST_CREATE, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Erro ao criar pagamento');
  }

  return response.json();
};

/**
 * Confirmar transação de pagamento do host
 */
export const paymentHostConfirm = async (
  data: PaymentHostConfirmRequest
): Promise<PaymentHostConfirmResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.PAYMENT_HOST_CONFIRM, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Erro ao confirmar pagamento');
  }

  return response.json();
};

/**
 * Enviar tokens para ganhadores
 */
export const sendTokenToWinners = async (campaignId: string) => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.SEND_TOKEN(campaignId), {
    method: 'POST',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Erro ao enviar tokens');
  }

  return response.json();
};

export interface ActivateAccountCreateRequest {
  walletAddress: string;
  chain: string;
  symbol: string;
}

export interface ActivateAccountCreateResponse {
  data: {
    paymentId: string;
    destinationAddress: string;
    amount: number;
    chain: string;
    token: string;
    tokenContractAddress?: string;
    message: string;
  };
}

export interface ActivateAccountConfirmRequest {
  paymentId: string;
  taxId: string;
  chain: string;
  symbol: string;
}

export interface ActivateAccountConfirmResponse {
  paymentId: string;
  success: boolean;
  message: string;
}

/**
 * Criar entrada de pagamento para ativação de conta host ($200)
 */
export const activateAccountCreate = async (
  data: ActivateAccountCreateRequest
): Promise<ActivateAccountCreateResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.ACTIVATE_ACCOUNT_CREATE, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Erro ao criar pagamento de ativação');
  }

  return response.json();
};

/**
 * Confirmar transação de pagamento de ativação de conta host
 */
export const activateAccountConfirm = async (
  data: ActivateAccountConfirmRequest
): Promise<ActivateAccountConfirmResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.ACTIVATE_ACCOUNT_CONFIRM, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Error confirming activation payment');
  }

  const result = await response.json();
  
  if (result.success === false) {
    throw new Error(result.message || 'Error confirming activation payment');
  }

  return result;
};

/**
 * Buscar saldo de Stellar USDC
 */
export const getStellarBalance = async (publicKey: string): Promise<{ balance: number }> => {
  const response = await fetch(`${API_ENDPOINTS.PAYMENTS.GET_BALANCE_STELLAR}?publicKey=${publicKey}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching Stellar balance');
  }

  return response.json();
};
