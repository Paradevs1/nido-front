import { API_ENDPOINTS, getDefaultHeaders } from './config';

/** Erro da API de auth com status HTTP e código opcional (ex.: EMAIL_NOT_VERIFIED). */
export class AuthApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

export interface TwitterUser {
  twitter: {
    subject: string;
    username: string;
  };
}

export interface LoginCreatorRequest {
  user: TwitterUser;
  loginMethod: 'twitter';
}

export interface LoginCreatorResponse {
  message: string;
  user: any;
  token: string;
  isNewUser: boolean;
}

export interface LoginHostRequest {
  email: string;
  password: string;
}

export interface LoginHostResponse {
  message: string;
  user: any;
  token: string;
}

export interface RegisterHostRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterHostResponse {
  message: string;
  user: any;
  token: string;
}

/**
 * Login do Creator via Twitter (Privy)
 */
export const loginCreator = async (data: LoginCreatorRequest): Promise<LoginCreatorResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN_CREATOR, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }

  return response.json();
};

/**
 * Login do Creator via Twitter (Privy)
 */
export const linkAccountsCreator = async (data: LoginCreatorRequest): Promise<LoginCreatorResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.LINK_ACCOUNTS_CREATOR, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }

  return response.json();
};

/**
 * Login do Host
 */
export const loginHost = async (data: LoginHostRequest): Promise<LoginHostResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN_HOST, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({} as { message?: string; error?: string }));
    throw new AuthApiError(
      body.message || 'Erro ao fazer login',
      response.status,
      body.error
    );
  }

  return response.json();
};

/**
 * Registro de Host (primeira parte)
 */
export const registerHost = async (data: RegisterHostRequest): Promise<RegisterHostResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.REGISTER_HOST, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao registrar host');
  }

  return response.json();
};

/**
 * Registro de Host (segunda parte - completar perfil)
 */
export const registerHostPartTwo = async (hostId: string, data: any) => {
  const response = await fetch(API_ENDPOINTS.AUTH.REGISTER_HOST_PART_TWO(hostId), {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao completar registro');
  }

  return response.json();
};


