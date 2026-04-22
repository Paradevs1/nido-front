// Backend API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bounties-api.vercel.app';

export const API_ENDPOINTS = {
  // Admin endpoints (requer token ADMIN)
  ADMIN: {
    CREATORS: `${API_BASE_URL}/api/admin/creators`,
    CREATORS_INSIGHTS: `${API_BASE_URL}/api/admin/creators/insights`,
    CREATORS_PARTICIPATION_STATS: `${API_BASE_URL}/api/admin/creators/participation-stats`,
    CREATORS_RECURRING: `${API_BASE_URL}/api/admin/creators/recurring`,
    HOSTS: `${API_BASE_URL}/api/admin/hosts`,
    HOST_UPDATE_PLAN: (hostId: string) => `${API_BASE_URL}/api/admin/hosts/${hostId}/plan`,
    /** Status da conta HOST (aprovação): active | inactive */
    HOST_ACCOUNT_STATUS: (userId: string) =>
      `${API_BASE_URL}/api/admin/host/${userId}/status`,
    USER_ACTIVE: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}/active`,
    CAMPAIGNS_COUNTS: `${API_BASE_URL}/api/admin/campaigns/counts`,
    CAMPAIGNS_OPTIONS: `${API_BASE_URL}/api/admin/campaigns/options`,
    CAMPAIGN_SHORT_URLS: (campaignId: string) => `${API_BASE_URL}/api/admin/campaigns/${campaignId}/short-urls`,
    CAMPAIGN_STATS: (campaignId: string) => `${API_BASE_URL}/api/admin/campaign-stats/${campaignId}`,
    CAMPAIGN_METRICS: (campaignId: string) => `${API_BASE_URL}/api/admin/campaign-metrics/${campaignId}`,
    INSTAGRAM_STORY_METRICS: `${API_BASE_URL}/api/admin/instagram-story-metrics`,
    PAYMENTS: `${API_BASE_URL}/api/admin/payments`,
  },

  // Auth endpoints
  AUTH: {
    LOGIN_CREATOR: `${API_BASE_URL}/api/auth/login-creator`,
    LINK_ACCOUNTS_CREATOR: `${API_BASE_URL}/api/auth/link-accounts-creator`,
    SYNC_ACCOUNTS: `${API_BASE_URL}/api/auth/sync-accounts`,
    LOGIN_HOST: `${API_BASE_URL}/api/auth/login-host`,
    REGISTER_HOST: `${API_BASE_URL}/api/auth/register-host`,
    REGISTER_HOST_PART_TWO: (hostId: string) => `${API_BASE_URL}/api/auth/register-host-part-two/${hostId}`,
    RESEND_VERIFICATION_CODE: `${API_BASE_URL}/api/host/resend-verification-code`,
    VALIDATE_EMAIL_CODE: `${API_BASE_URL}/api/host/validate-email-code`,
  },

  // Host endpoints
  HOST: {
    CAMPAIGNS_PUBLIC: `${API_BASE_URL}/api/host/campaigns/public`,
    PROFILE: `${API_BASE_URL}/api/host/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/host/update-profile`,
    CAMPAIGNS: `${API_BASE_URL}/api/host/campaigns`,
    GET_CAMPAIGNS_COUNT: `${API_BASE_URL}/api/host/get-count-campaigns-by-host`,
    GET_KOLS: `${API_BASE_URL}/api/host/get-kols`,
    GET_CAMPAIGN_BY_ID: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}`,
    GET_CAMPAIGN_METRICS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/metrics`,
    GET_CAMPAIGN_METRICS_SUMMARY: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/metrics/summary`,
    GET_CAMPAIGN_METRICS_PLATFORMS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/metrics/platforms`,
    UPDATE_CAMPAIGN: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}`,
    DELETE_CAMPAIGN: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}`,
    GET_CAMPAIGN_SUBMISSIONS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/leaderboard-submits`,
    SAVE_WINNERS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/create-campaign-winners`,
    GET_WINNERS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/get-users-campaign-winners`,
    MAKE_PAYMENTS: (id: string, acceptedRank: boolean) => `${API_BASE_URL}/api/payments/send-winners/${id}?acceptedRank=${acceptedRank}`,
    GET_SUGGESTED_RATINGS: (id: string) => `${API_BASE_URL}/api/host/campaigns/${id}/generate-rank-twitter`,
    ACTIVE_ACCOUNT: `${API_BASE_URL}/api/host/active-account`,
    IS_PARABUILDERS: `${API_BASE_URL}/api/host/is-parabuilders`,
  },
  
  // Campaign endpoints
  // CAMPAIGNS: `${API_BASE_URL}/api/host/campaigns`, // Movido para HOST
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/creator`,
  
  // Payment endpoints
  PAYMENTS: {
    SEND_TOKEN: (campaignId: string) => `${API_BASE_URL}/api/payments/send/${campaignId}`,
    PAYMENT_HOST_CREATE: `${API_BASE_URL}/api/payments/payment-host-create`,
    PAYMENT_HOST_CONFIRM: `${API_BASE_URL}/api/payments/payment-host-confirm`,
    ACTIVATE_ACCOUNT_CREATE: `${API_BASE_URL}/api/payments/activate-account-create`,
    ACTIVATE_ACCOUNT_CONFIRM: `${API_BASE_URL}/api/payments/activate-account-confirm`,
    PLAN_CREATE: `${API_BASE_URL}/api/payments/plan-create`,
    PLAN_CONFIRM: `${API_BASE_URL}/api/payments/plan-confirm`,
    GET_BALANCE_EVM: `${API_BASE_URL}/api/payments/evm/balance`,
    GET_BALANCE_SOLANA: `${API_BASE_URL}/api/payments/solana/balance`,
    GET_BALANCE_STELLAR: `${API_BASE_URL}/api/payments/stellar/balance`,
    SEND_PAYMENT_KOLS: (campaignId: string) => `${API_BASE_URL}/api/payments/send-payment-kols/${campaignId}`,
    SEND_PAYMENT_KOLS_SELECTIVE: (campaignId: string) => `${API_BASE_URL}/api/payments/send-payment-kols-selective/${campaignId}`,
  },

  // Plans endpoints
  PLANS: {
    LIST: `${API_BASE_URL}/api/plans/list`,
    ME: `${API_BASE_URL}/api/plans/me`,
  },

  // Waitlist endpoints
  WAITLIST: {
    SUBMIT: `/api/waitlist/submit`,
  },
};

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bounties_token');
  }
  return null;
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bounties_token', token);
  }
};

// Helper function to remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bounties_token');
  }
};

// Default headers for API requests
export const getDefaultHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  return headers;
};

// Callback para logout quando o token expirar
let onTokenExpiredCallback: (() => void) | null = null;

/**
 * Define o callback para ser chamado quando o token expirar
 * Este callback deve ser configurado pelo AuthProvider
 */
export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpiredCallback = callback;
};

// Função removida - agora usamos apenas o componente React TokenExpiredOverlay
// que escuta o evento 'auth:token-expired' e mostra o overlay com o estilo da plataforma

// Interceptar apenas chamadas fetch para a API do Nido (nao terceiros)
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    // Determinar a URL da request ANTES de executar
    const requestUrl = typeof args[0] === 'string'
      ? args[0]
      : args[0] instanceof Request
        ? args[0].url
        : '';

    const isOurApi = requestUrl.startsWith(API_BASE_URL);

    // Para chamadas de terceiros (MetaMask, Privy, Solana RPC, etc),
    // usar o fetch original direto — sem interceptar nada
    if (!isOurApi) {
      return originalFetch(...args);
    }

    // Para NOSSA API, interceptar 401
    const response = await originalFetch(...args);

    if (response.status === 401) {
      handleTokenExpired();

      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return response;
  };

}

// Flag para evitar múltiplos redirecionamentos
let isRedirecting = false;

/**
 * Limpa toda a autenticação e redireciona para a home
 */
const handleTokenExpired = () => {
  // Evitar múltiplas execuções simultâneas
  if (isRedirecting) {
    return;
  }
  isRedirecting = true;

  
  // Limpar todos os dados de autenticação
  if (typeof window !== 'undefined') {
    // Disparar evento customizado PRIMEIRO (antes de limpar os dados)
    // Isso permite que componentes possam reagir antes do redirecionamento
    window.dispatchEvent(new CustomEvent('auth:token-expired'));

    // Chamar callback do contexto de autenticação
    if (onTokenExpiredCallback) {
      try {
        onTokenExpiredCallback();
      } catch (error) {
        console.error('Erro ao chamar callback de token expirado:', error);
      }
    }

    // Limpar localStorage
    try {
      localStorage.removeItem('bounties_token');
      localStorage.removeItem('bounties_user');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('updatedTwitter');
      localStorage.removeItem('updatedTiktok');
      localStorage.removeItem('updatedInstagram');
      localStorage.removeItem('click_link_twitter');
      localStorage.removeItem('click_link_tiktok');
      localStorage.removeItem('click_link_instagram');

      // Limpar todas as chaves que começam com 'wagmi'
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.toLowerCase().startsWith('wagmi')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }

    // Limpar cookie httpOnly via API route
    try {
      fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
      // Fallback: limpar cookies acessiveis por JS
      document.cookie = 'bounties_token=; path=/; max-age=0';
      document.cookie = 'auth_user=; path=/; max-age=0';
    } catch (error) {
      console.error('Erro ao limpar cookies:', error);
    }


  }
};

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // O interceptor global já cuida dos 401s
    // Apenas tratar outros erros aqui
    if (response.status === 401) {
      // Apenas lançar erro - o interceptor global já mostrou o overlay
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };
      (error as any).status = 401;
      throw error;
    }
    
    // Tentar pegar mensagem de erro do backend
    let errorData: any = null;
    try {
      const text = await response.text();
      if (text) {
        errorData = JSON.parse(text);
      }
    } catch {
      // Se não conseguir fazer parse, usar mensagem padrão
    }
    
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    (error as any).response = { status: response.status, data: errorData };
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

// API Client using fetch
export const apiClient = {
  get: async (url: string, options?: RequestInit) => {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${API_BASE_URL}${normalizedUrl}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
      ...options,
    });
    
    return handleResponse(response);
  },

  post: async (url: string, data?: any, options?: RequestInit) => {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${API_BASE_URL}${normalizedUrl}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
    
    return handleResponse(response);
  },

  put: async (url: string, data?: any, options?: RequestInit) => {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${API_BASE_URL}${normalizedUrl}`, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
    
    return handleResponse(response);
  },

  delete: async (url: string, options?: RequestInit) => {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${API_BASE_URL}${normalizedUrl}`, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
      ...options,
    });
    
    return handleResponse(response);
  },
};