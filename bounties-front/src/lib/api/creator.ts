import { apiClient, API_BASE_URL, getAuthToken } from './config';

export interface CreatorProfile {
  id: string;
  user_type: string;
  email: string;
  isActive: boolean;
  submittedCampaignsCount: number;
  quantity_winner: number;
  quantity_winner_dolar: number;
  tiktok_username: string;
  instagram_username?: string;
  twitter_username: string;
  twitter_display_name: string;
  twitter_profile_image: string;
  wallet_evm: string;
  wallet_sol: string;
  wallet_sui: string;
  wallet_stellar?: string;
  wallets?: Wallet[];
  description?: string;
  created_at: string;
  updated_at: string;
  // Campos do onboarding / edit profile (retornados pelo GET /api/creator/profile)
  username_youtube?: string;
  username_telegram?: string;
  username_discord?: string;
  primary_language?: string;
  fluent_language?: string;
  fluent_language_others?: string;
  audience_region?: string[];
  audience_size?: string;
  average_views_per_post?: string;
  content_category_list?: string[];
  content_formats?: string[];
  example_content_links?: string;
  crypto_experience?: string;
  trading_experience?: string;
  main_chains?: string[];
  main_chains_other?: string;
  crypto_content_specialization?: string[];
  favorite_protocols_projects?: string;
  investment_participation_style?: string;
  first_login?: boolean | null;
}

export interface CampaignWinner {
  rank: number;
  username: string;
  twitter_profile_image: string;
  amount_received: number;
  submission_twitter?: string;
  submission_tiktok?: string;
  submission_instagram?: string;
  submission_youtube?: string;
  submission_feedback?: string;
  payment_rank_generate_ai?: boolean;
}

export interface Wallet {
  id: string;
  walletType: string;
  address: string;
  isActive: boolean;
}

export interface CampaignSubmission {
  id: string;
  campaign_id: string;
  creator_id: string;
  submission_data: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export type SubmitCampaignResponse = CampaignSubmission & {
  message?: string;
  wallet_sol?: string;
  wallet_sui?: string;
  wallet_evm?: string;
  wallet_stellar?: string;
};

export interface CampaignParticipantResponse {
  id: string;
  userId: string;
  campaignId: string;
  date_submit: string;
  amount_received: number;
  date_received?: string;
  submission_twitter: string;
  submission_tiktok: string;
  submission_instagram: string;
  submission_youtube: string;
  submissions_kols?: string[];
  submission_feedback?: string;
  submissions_images?: string[]; // Base64 data URLs
  winner: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmittedCampaign {
  campaignId: string;
  title: string;
  about_project: string;
  status: string;
  total_prize_pool: number;
  deadline: number;
  deadline_detailed: {
    days: number;
    hours: number;
    minutes: number;
    total_minutes: number;
    is_expired: boolean;
  };
  content_categories: {
    slug: string;
    description: string;
  }[];
  total_submissions: number;
  hasUserSubmitted: boolean;
  isPrivate?: boolean;
  is_cac?: boolean;
  user_amount?: number;
}

export interface SubmittedCampaignsResponse {
  campaigns: SubmittedCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Comment {
  id: string;
  userId: string;
  campaignId: string;
  comment: string;
  create_date: string;
  twitter_profile_image: string;
  logo_company: string;
  username: string;
  userIsEditOrDelete: boolean;
  is_fixed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  is_fixed?: boolean;
  totalPages: number;
}

export interface SubmitCampaignData {
  submission_data?: {
    submission_twitter?: string;
    submission_tiktok?: string;
    submission_instagram?: string;
    submission_youtube?: string;
    submissions_kols?: string[];
    submission_feedback?: string;
    submissions_images?: string[]; // Base64 data URLs — campanhas privadas
  };
  submission_twitter?: string;
  submission_tiktok?: string;
  submission_instagram?: string;
  submission_youtube?: string;
  submissions_kols?: string[];
  submission_feedback?: string;
  submissions_images?: string[]; // Base64 data URLs — campanhas privadas
}

export interface InsertWalletData {
  walletType: string;
  address: string;
}

export interface InsertWalletsData {
  wallet_evm: string;
  wallet_sol: string;
  wallet_sui: string;
  wallet_stellar?: string;
}

export interface InsertWalletsResponse {
  message: string;
  wallet_evm: string;
  wallet_sol: string;
  wallet_sui: string;
  wallet_stellar?: string;
}

export interface CommentData {
  campaignId: string;
  comment: string;
}

export interface UpdateCommentData {
  comment: string;
}

export interface UpdateProfileDescData {
  description?: string;
}

export interface TransactionCreator {
  _id?: string;
  userId?: string;
  campaignId?: string;
  signature: string;
  to?: string;
  amount?: number;
  chain?: string;
  symbol?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Campos opcionais para compatibilidade
  payment_chain?: string;
  name_campaign?: string;
}

export interface TransactionCreatorResponse {
  signature: string;
  payment_chain: string;
  name_campaign: string;
  amount?: number;
}

export type ViewTransactionsCreatorResponse = TransactionCreatorResponse[];

export interface RecentEarners {
  username: string;
  twitter_profile_image: string;
  amount_earned: number;
  description?: string;
}

export interface WelcomeInfo {
  twitter_display_name: string;
  twitter_profile_image: string;
}

export interface ShortenerResponse {
  shortURL: string;
}

export interface CreateShortUrlResponse {
  success: boolean;
  data: {
    idString: string;
    shortURL: string;
    campaignId?: string;
    userId: string;
    clicks: number;
    created_at: string;
    updated_at: string;
    _id: string;
  };
}

export interface CreateShortenerKolsResponse {
  success: boolean;
  data: {
    idString: string;
    shortURL: string;
    userId: string;
    clicks: number;
    created_at: string;
    updated_at: string;
    _id: string;
  };
}

export interface CampaignShortUrlsResponse {
  shortURL: string;
  clicks: number;
  username: string;
  campaignTitle: string;
}

export interface GetCampaignShortUrlsResponse {
  success: boolean;
  data: CampaignShortUrlsResponse[];
}

export interface UpdateProfileAfterLoginData {
  username_twitter?: string;
  username_youtube?: string;
  username_tiktok?: string;
  username_instagram?: string;
  username_telegram?: string;
  username_discord?: string;
  primary_language?: string;
  fluent_language?: string;
  fluent_language_others?: string;
  audience_region?: string[];
  average_views_per_post?: string;
  content_category_list?: Array<'technology' | 'travel' | 'finance' | 'crypto_blockchain' | 'web3' | 'gaming' | 'lifestyle' | 'education' | 'defi' | 'trading' | 'business' | 'nfts'>;
  content_formats?: string[];
  example_content_links?: string;
  audience_size?: '1k' | '1k – 5k' | '5k – 20k' | '20k – 100k' | '100k+';
  wallet_evm?: string;
  wallet_sol?: string;
  wallet_sui?: string;
  wallet_stellar?: string;
  crypto_experience?: string;
  main_chains?: string[];
  main_chains_other?: string;
  trading_experience?: string;
  crypto_content_specialization?: string[];
  favorite_protocols_projects?: string;
  investment_participation_style?: string;
}

export interface UpdateProfileData {
  description?: string;
  username_twitter?: string;
  username_youtube?: string;
  username_tiktok?: string;
  username_instagram?: string;
  username_telegram?: string;
  username_discord?: string;
  primary_language?: string;
  fluent_language?: string;
  fluent_language_others?: string;
  audience_region?: string[];
  average_views_per_post?: string;
  content_category_list?: Array<'technology' | 'beauty' | 'travel' | 'finance' | 'crypto_blockchain' | 'web3' | 'gaming' | 'fitness' | 'lifestyle' | 'education' | 'defi' | 'trading' | 'fashion' | 'food' | 'business' | 'entertainment' | 'nfts' | 'metaverse'>;
  content_formats?: string[];
  example_content_links?: string;
  audience_size?: '1k' | '1k – 5k' | '5k – 20k' | '20k – 100k' | '100k+';
  wallet_evm?: string;
  wallet_sol?: string;
  wallet_sui?: string;
  wallet_stellar?: string;
  previous_brand_collaborations?: string;
  crypto_experience?: string;
  main_chains?: string[];
  main_chains_other?: string;
  trading_experience?: string;
  crypto_content_specialization?: string[];
  favorite_protocols_projects?: string;
  investment_participation_style?: string;
}

export const creatorApi = {
  getCampaignShortUrls: async (campaignId: string): Promise<CampaignShortUrlsResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/creator/campaign-short-urls/${campaignId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GetCampaignShortUrlsResponse = await response.json();
    return data.data || [];
  },

  getTwitterInfo: async (): Promise<WelcomeInfo> => {
    const response = await apiClient.get('/api/creator/welcome');
    return response;
  },

  getRecentEarners: async (): Promise<RecentEarners[]> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    
    const response = await fetch(`${API_BASE_URL}/api/creator/get-recent-earners`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  getProfile: async (): Promise<CreatorProfile> => {
    const response = await apiClient.get('/api/creator/profile');
    return response;
  },

  submitCampaign: async (campaignId: string, data: SubmitCampaignData): Promise<SubmitCampaignResponse> => {
    const payload: any = {
      "submission_twitter": data.submission_data?.submission_twitter || data.submission_twitter || "",
      "submission_tiktok": data.submission_data?.submission_tiktok || data.submission_tiktok || "",
      "submission_instagram": data.submission_data?.submission_instagram || data.submission_instagram || "",
      "submission_youtube": data.submission_data?.submission_youtube || data.submission_youtube || ""
    };
    
    if (data.submission_data?.submissions_kols !== undefined) {
      payload.submissions_kols = data.submission_data.submissions_kols;
    } else if (data.submissions_kols !== undefined) {
      payload.submissions_kols = data.submissions_kols;
    }
    const feedback = data.submission_data?.submission_feedback ?? data.submission_feedback ?? "";
    if (feedback) {
      payload.submission_feedback = feedback;
    }

    const images = data.submission_data?.submissions_images ?? data.submissions_images;
    if (images && images.length > 0) {
      payload.submissions_images = images;
    }

    const response = await apiClient.post(`/api/creator/submit-campaign/${campaignId}`, payload);
    return response;
  },

  getSubmittedCampaigns: async (page: number = 1, limit: number = 10, category?: string): Promise<SubmittedCampaignsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (category) params.append('type', category);
    
    const response = await apiClient.get(`/api/creator/campaigns-submitted?${params.toString()}`);
    return response;
  },

  getCampaignWinners: async (campaignId: string): Promise<CampaignWinner[]> => {
    const response = await fetch(`${API_BASE_URL}/api/creator/campaign-winners/${campaignId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  validateSubmissionCampaign: async (campaignId: string): Promise<boolean> => {
    const response = await apiClient.get(`/api/creator/validate-submission-campaign/${campaignId}`);
    return response;
  },

  getCampaignSubmission: async (campaignId: string): Promise<CampaignParticipantResponse | null> => {
    try {
      console.log("creatorApi.getCampaignSubmission called with campaignId:", campaignId);
      const response = await apiClient.get(`/api/creator/get-submission/${campaignId}`);
      console.log("creatorApi.getCampaignSubmission response:", response);
      return response;
    } catch (error: any) {
      console.error("creatorApi.getCampaignSubmission error:", error);
      // Tratar erro 404 ou "Route not found"
      if (error.response?.status === 404 || 
          error.message?.includes('404') || 
          error.message?.includes('Route not found') ||
          error.message?.includes('not found')) {
        console.log("Submission not found, returning null");
        return null;
      }
      throw error;
    }
  },


  insertWallet: async (data: InsertWalletData): Promise<Wallet> => {
    const response = await apiClient.post('/api/creator/insert-wallets', data);
    return response;
  },

  insertWallets: async (data: InsertWalletsData): Promise<InsertWalletsResponse> => {
    const response = await apiClient.post('/api/creator/insert-wallets', data);
    return response;
  },

  deleteWallet: async (walletType: string): Promise<void> => {
    await apiClient.delete(`/api/creator/delete-wallet/${walletType}`);
  },

  getComments: async (campaignId: string, page: number = 1, limit: number = 10): Promise<CommentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    
    const response = await fetch(`${API_BASE_URL}/api/creator/comments/${campaignId}?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  insertComment: async (data: CommentData): Promise<Comment> => {
    const response = await apiClient.post('/api/creator/comments', data);
    return response;
  },

  updateComment: async (commentId: string, data: UpdateCommentData): Promise<Comment> => {
    const response = await apiClient.put(`/api/creator/comments/${commentId}`, data);
    return response;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/api/creator/comments/${commentId}`);
  },

  pinFixed: async (commentId: string, isFixed: boolean): Promise<Comment> => {
    const response = await apiClient.put(`/api/host/fixed-comment-host`, { commentId, is_fixed: isFixed });
    return response;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: any }> => {
    const response = await apiClient.put('/api/creator/update-profile', data);
    return response;
  },

  updateProfileAfterLogin: async (data: UpdateProfileAfterLoginData): Promise<{ message: string; user: any }> => {
    const response = await apiClient.put('/api/creator/update-profile-after-login', data);
    return response;
  },

  viewTransactionsCreator: async (): Promise<ViewTransactionsCreatorResponse> => {
    const response = await apiClient.get('/api/creator/view-transactions-creator');
    return response;
  },

  getShortenerUserCampaign: async (campaignId: string): Promise<ShortenerResponse> => {
    const response = await apiClient.get(`/api/creator/get-shortener-user-campaign/${campaignId}`);
    return response;
  },

  createShortUrl: async (campaignId: string): Promise<CreateShortUrlResponse> => {
    const response = await apiClient.post(`/api/creator/create-short-url/${campaignId}`);
    return response;
  },

  /** GET: resgata a URL encurtada do KOL para a campanha (campanhas privadas) */
  getShortenerKols: async (campaignId: string): Promise<{ shortURL: string }> => {
    const response = await apiClient.get(`/api/creator/get-shortener-kols/${campaignId}`);
    return response;
  },

  /** POST: cria URL encurtada para KOL na campanha (campanhas privadas) */
  createShortenerKols: async (campaignId: string, linkReferral: string): Promise<CreateShortenerKolsResponse> => {
    const response = await apiClient.post(`/api/creator/create-shortener-kols/${campaignId}`, { linkReferral });
    return response;
  },
};

export default creatorApi;
