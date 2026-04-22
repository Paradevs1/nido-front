import { API_BASE_URL, getDefaultHeaders } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlatformName = 'TWITTER' | 'DISCORD' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'TELEGRAM';

export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Community {
  id: string;
  name: string;
  description: string;
  rules: string;
  logo?: string | null;
  required_platforms?: PlatformName[] | null;
  host_id: string;
  members_count: number;
  /** Present when listing as CREATOR (GET /api/communities) */
  member_status?: MemberStatus | null;
  enrollment_start?: string | null;
  enrollment_end?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityDetail extends Community {
  members: CommunityMember[];
  campaigns: CommunityCampaign[];
  announcements: CommunityAnnouncement[];
}

export interface CommunityMemberCreator {
  username: string;
  twitter_username?: string;
  username_instagram?: string;
  username_tiktok?: string;
  username_youtube?: string;
  username_discord?: string;
  username_telegram?: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  creator_id: string;
  status: MemberStatus;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  creator: CommunityMemberCreator;
}

export interface CommunityAnnouncement {
  id: string;
  community_id: string;
  title: string;
  description: string;
  link?: string | null;
  image_url?: string | null;
  images?: string[] | null;
  pinned?: boolean;
  pinned_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMessage {
  id: string;
  community_id: string;
  sender_id: string;
  sender_role: 'HOST' | 'CREATOR';
  message: string;
  created_at: string;
  sender: {
    username: string;
    twitter_profile_image?: string | null;
    logo_company?: string | null;
  };
}

export interface CommunityCampaign {
  _id: string;
  id?: string;
  title: string;
  status: string;
  total_prize_pool: number;
  start_date: string;
  end_date: string;
  total_submissions?: number;
  enrollment_start?: string;
  enrollment_end?: string;
  payment_token?: string;
  max_participants?: number;
  winner_count?: number;
  [key: string]: unknown;
}

// Request types
export interface CreateCommunityRequest {
  name: string;
  description: string;
  rules: string;
  logo?: string;
  required_platforms?: PlatformName[];
  enrollment_start?: string;
  enrollment_end?: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  rules?: string;
  logo?: string;
  required_platforms?: PlatformName[];
  enrollment_start?: string;
  enrollment_end?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  link?: string;
  image_url?: string;
  images?: string[];
}

export interface UpdateAnnouncementRequest {
  title?: string;
  description?: string;
  link?: string;
  image_url?: string;
  images?: string[];
}

// Response types
export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  [key: string]: unknown;
  // The actual data key varies (members, announcements, messages, campaigns)
}

export interface AdminCommunityListItem extends Community {
  host?: {
    username: string;
    email: string;
    name_company?: string;
  };
  pending_members_count?: number;
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
    } catch {
      // ignore parse errors
    }
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    (error as any).response = { status: response.status, data: errorData };
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Community CRUD
// ---------------------------------------------------------------------------

/** Create a community (HOST) */
export async function createCommunity(data: CreateCommunityRequest) {
  const res = await fetch(`${API_BASE_URL}/api/communities`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean; message: string; data: Community }>(res);
}

/** List all communities available to join (CREATOR) */
export async function listCommunities(params: { search?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; data: Community[] }>(res);
}

/** Creator leaves a community */
export async function leaveCommunity(communityId: string) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/leave`, {
    method: 'POST',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

/** List my communities (HOST or CREATOR) */
export async function listMyCommunities() {
  const res = await fetch(`${API_BASE_URL}/api/communities/mine`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; data: Community[] }>(res);
}

/** Get community details by ID */
export async function getCommunityById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${id}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; data: CommunityDetail }>(res);
}

/** Update a community (HOST owner) */
export async function updateCommunity(id: string, data: UpdateCommunityRequest) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${id}`, {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean; message: string; data: Community }>(res);
}

/** Delete a community (HOST owner or ADMIN) */
export async function deleteCommunity(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${id}`, {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

/** Request to join a community (CREATOR) */
export async function joinCommunity(communityId: string) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/join`, {
    method: 'POST',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; message: string; data: CommunityMember }>(res);
}

/** List members of a community with optional status filter */
export async function listMembers(
  communityId: string,
  params: { status?: MemberStatus; page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/members${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    members: CommunityMember[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

/** Approve a member (HOST) */
export async function approveMember(communityId: string, memberId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/members/${memberId}/approve`,
    { method: 'PATCH', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string; data: CommunityMember }>(res);
}

/** Reject a member (HOST) */
export async function rejectMember(communityId: string, memberId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/members/${memberId}/reject`,
    { method: 'PATCH', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string; data: CommunityMember }>(res);
}

/** Remove a member (HOST or ADMIN) */
export async function removeMember(communityId: string, memberId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/members/${memberId}`,
    { method: 'DELETE', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string }>(res);
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

/** Create an announcement (HOST) */
export async function createAnnouncement(communityId: string, data: CreateAnnouncementRequest) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/announcements`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean; message: string; data: CommunityAnnouncement }>(res);
}

/** List announcements */
export async function listAnnouncements(
  communityId: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/announcements${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    announcements: CommunityAnnouncement[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

/** Update an announcement (HOST) */
export async function updateAnnouncement(
  communityId: string,
  announcementId: string,
  data: UpdateAnnouncementRequest
) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/announcements/${announcementId}`,
    { method: 'PUT', headers: getDefaultHeaders(), body: JSON.stringify(data) }
  );
  return handleResponse<{ success: boolean; message: string; data: CommunityAnnouncement }>(res);
}

/** Delete an announcement (HOST) */
export async function deleteAnnouncement(communityId: string, announcementId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/announcements/${announcementId}`,
    { method: 'DELETE', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string }>(res);
}

/** Toggle pin on an announcement (HOST) */
export async function togglePinAnnouncement(communityId: string, announcementId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/announcements/${announcementId}/pin`,
    { method: 'PATCH', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string; data: CommunityAnnouncement }>(res);
}

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------

/** Send a message in community chat */
export async function sendMessage(communityId: string, message: string) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/messages`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse<{ success: boolean; message: string; data: CommunityMessage }>(res);
}

/** List messages with pagination */
export async function listMessages(
  communityId: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/messages${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    messages: CommunityMessage[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

/** Search messages in community chat */
export async function searchMessages(
  communityId: string,
  params: { q: string; page?: number; limit?: number }
) {
  const qs = new URLSearchParams({ q: params.q });
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/messages/search?${qs.toString()}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    messages: CommunityMessage[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

/** Delete a message (HOST moderation or own message) */
export async function deleteMessage(communityId: string, messageId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/communities/${communityId}/messages/${messageId}`,
    { method: 'DELETE', headers: getDefaultHeaders() }
  );
  return handleResponse<{ success: boolean; message: string }>(res);
}

// ---------------------------------------------------------------------------
// Community Campaigns
// ---------------------------------------------------------------------------

/** Create a campaign linked to a community (HOST) */
export async function createCommunityCampaign(communityId: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/campaigns`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean; message: string; data: CommunityCampaign }>(res);
}

/** List campaigns of a community */
export async function listCommunityCampaigns(
  communityId: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/campaigns${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    campaigns: CommunityCampaign[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

// ---------------------------------------------------------------------------
// Public Member List (Creator)
// ---------------------------------------------------------------------------

export interface PublicMember {
  id: string;
  display_name: string;
  avatar: string | null;
  platforms: string[];
  is_host: boolean;
}

export async function listPublicMembers(
  communityId: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/members/public${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    members: PublicMember[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

// ---------------------------------------------------------------------------
// Export CSV (Host Enterprise)
// ---------------------------------------------------------------------------

export async function exportMembersCSV(communityId: string): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/export/members`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  if (!res.ok) {
    let errorData: any = null;
    try { errorData = await res.json(); } catch { }
    const error = new Error(errorData?.message || `Export failed: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.blob();
}

export async function exportAnalyticsCSV(communityId: string, campaignId: string): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/communities/${communityId}/export/analytics?campaign_id=${campaignId}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  if (!res.ok) {
    let errorData: any = null;
    try { errorData = await res.json(); } catch { }
    const error = new Error(errorData?.message || `Export failed: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.blob();
}

/** Trigger file download from a Blob response */
export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** List all communities (ADMIN) */
export async function adminListCommunities(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/communities${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    communities: AdminCommunityListItem[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}

/** Get community details (ADMIN) */
export async function adminGetCommunity(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/communities/${id}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{ success: boolean; data: CommunityDetail & { host?: any; pending_members_count?: number } }>(res);
}

/** List all members of a community (ADMIN) */
export async function adminListMembers(
  communityId: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/communities/${communityId}/members${query}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse<{
    success: boolean;
    members: CommunityMember[];
    total: number;
    page: number;
    totalPages: number;
  }>(res);
}
