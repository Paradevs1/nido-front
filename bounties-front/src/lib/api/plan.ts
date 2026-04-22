import { API_ENDPOINTS, getDefaultHeaders } from './config';
import { setAuthToken } from './config';

export interface PlanItem {
  id: string;
  name: 'BASIC' | 'CORE' | 'ENTERPRISE';
  duration_months: number | null;
}

export interface ListPlansResponse {
  message: string;
  plans: PlanItem[];
}

export interface GetMyPlanResponse {
  message: string;
  plan: PlanItem;
  is_active: boolean;
  expires_at: string | null;
}

/**
 * Listar todos os planos disponíveis (público)
 */
export const listPlans = async (): Promise<ListPlansResponse> => {
  const response = await fetch(API_ENDPOINTS.PLANS.LIST, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao listar planos');
  }

  return response.json();
};

/**
 * Recuperar o plano atual do host autenticado
 */
export const getMyPlan = async (): Promise<GetMyPlanResponse> => {
  const response = await fetch(API_ENDPOINTS.PLANS.ME, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao recuperar plano');
  }

  return response.json();
};

export interface PlanCreateRequest {
  chain: string;
  symbol: string;
}

export interface PlanCreateResponse {
  success: boolean;
  data: {
    destinationAddress: string;
    token: string;
    amount: number;
    message: string;
  };
}

/**
 * Gerar dados para pagamento do plano CORE (destino, valor, token)
 */
export const planCreate = async (
  data: PlanCreateRequest
): Promise<PlanCreateResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.PLAN_CREATE, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Erro ao gerar pagamento do plano');
  }

  return response.json();
};

export interface PlanConfirmRequest {
  taxId: string;
  chain: string;
  symbol: string;
}

export interface PlanConfirmResponse {
  success: boolean;
  data: {
    isValidTransaction: boolean;
    message: string;
    token?: string;
    expiresAt?: string | null;
  };
}

/**
 * Confirmar pagamento do plano CORE (valida on-chain e ativa o plano).
 * Se o backend retornar `token`, atualiza o token no localStorage.
 */
export const planConfirm = async (
  data: PlanConfirmRequest
): Promise<PlanConfirmResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.PLAN_CONFIRM, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Erro ao confirmar pagamento do plano');
  }

  const result = await response.json();

  if (result.success && result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
};
