import { apiClient } from './config';

export interface ContentCategory {
  slug: string;
}

export interface ContentFormat {
  type: string;
}

export interface SubmissionFormat {
  type: string;
}

export interface SupportContact {
  type: string;
  value: string;
  is_primary: boolean;
}

export interface Country {
  name: string;
}

export interface OfficialLink {
  title: string;
  url: string;
  type: string;
}

export interface DeadlineDetailed {
  days: number;
  hours: number;
  minutes: number;
  total_minutes: number;
  is_expired: boolean;
}

export interface RewardTier {
  position_initial: number;
  position_final: number;
  title: string;
  payment_amount: number;
}

export interface Campaign {
  id: string;
  host_id: string;
  title: string;
  about_project: string;
  what_we_need: string;
  content_type: string;
  content_pillars: string;
  benefits: string;
  requirements: string;
  content_format: ContentFormat[];
  submission_format: SubmissionFormat[];
  content_categories: ContentCategory[];
  target_blockchain: string;
  official_links: OfficialLink[];
  support_contact: SupportContact[];
  country: Country[];
  start_date: string;
  end_date: string;
  deadline: number;
  deadline_detailed: DeadlineDetailed;
  timezone: string;
  payment_chain: string;
  payment_token: string;
  max_participants: number;
  winner_count: number | null;
  reward_tiers: RewardTier[];
  total_prize_pool: number;
  status: string;
  payment_received: boolean;
  rewards_distributed: boolean;
  hasUserSubmitted: boolean;
  created_at: string;
  updated_at: string;
  total_submissions: number;
  host_username?: string;
  host_categories_atuation?: Array<{ slug: string }>;
  name_company?: string;
  logo_company?: string;
  original_url_shortener?: string;
  community_id?: string;
  isPrivate?: boolean;
  is_cac?: boolean;
  format_cac?: 'clicks' | 'view';
  quantity_conversion?: number;
  amount_convertion?: number;
  limit_amount_convertion?: number;
  qtd_min_links?: number;
  qtd_max_links?: number;
  list_kols?: Array<{ userId: string; username?: string; amount?: number; }>;
}

export interface CampaignDetailResponse {
  message: string;
  campaign: Campaign;
}

export interface CampaignTier {
  position_initial: number;
  position_final: number;
  payment_amount: number;
}

export interface CampaignTiersResponse {
  message: string;
  reward_tiers: CampaignTier[];
  total_prize_pool: number;
}

export interface CampaignFilters {
  category?: string;
  page?: number;
  limit?: number;
}

export interface CampaignsResponse {
  message: string;
  campaigns: Campaign[];
  total: number;
  page: number;
  totalPages: number;
}

export const campaignApi = {
  getAllCampaigns: async (filters?: CampaignFilters, signal?: AbortSignal): Promise<CampaignsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.category) params.append('type', filters.category);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    const response = await apiClient.get(
      `/api/host/campaigns/public?${params.toString()}`,
      signal ? { signal } : undefined
    );
    const raw = response as CampaignsResponse & {
      total_pages?: number;
      pagination?: { page?: number; totalPages?: number; total_pages?: number; total?: number };
    };
    const pag = raw.pagination;
    const total = raw.total ?? pag?.total ?? 0;
    const limit = filters?.limit ?? 10;
    const page = raw.page ?? pag?.page ?? 1;
    const totalPagesFromTotal = total > 0 && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 0;
    const totalPagesBackend = raw.totalPages ?? raw.total_pages ?? pag?.totalPages ?? pag?.total_pages ?? totalPagesFromTotal;
    const totalPages = Math.max(totalPagesBackend, page);
    
    return {
      message: raw.message ?? '',
      campaigns: raw.campaigns ?? [],
      total,
      page,
      totalPages,
    };
  },

  getCampaignById: async (campaignId: string): Promise<CampaignDetailResponse> => {
    const response = await apiClient.get(`/api/host/campaigns/${campaignId}`);
    return response;
  },

  getCampaignTiers: async (campaignId: string): Promise<CampaignTiersResponse> => {
    const response = await apiClient.get(`/api/host/campaigns/${campaignId}/get-campaign-tiers`);
    return response;
  },
};

export default campaignApi;
