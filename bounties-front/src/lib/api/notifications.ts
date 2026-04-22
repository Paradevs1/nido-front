import { API_BASE_URL, getDefaultHeaders } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'JOIN_REQUEST'
  | 'JOIN_REQUEST_APPROVED'
  | 'JOIN_REQUEST_REJECTED'
  | 'MEMBER_REMOVED'
  | 'ANNOUNCEMENT_PUBLISHED';

export interface NotificationPayload {
  community_id?: string;
  community_name?: string;
  creator_id?: string;
  creator_name?: string;
  creator_avatar?: string;
  host_name?: string;
  host_logo?: string;
  announcement_id?: string;
  announcement_title?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  payload: NotificationPayload;
  read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any = null;
    try {
      const text = await response.text();
      if (text) errorData = JSON.parse(text);
    } catch { }
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export async function listNotifications(params: { page?: number; limit?: number; read?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.read !== undefined) qs.set('read', String(params.read));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/notifications${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
    unread_count: number;
  }>(res);
}

export async function getUnreadCount() {
  const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; unread_count: number }>(res);
}

export async function markAsRead(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function markAllAsRead() {
  const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean }>(res);
}
