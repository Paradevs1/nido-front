import { API_ENDPOINTS, getDefaultHeaders } from './config';

export interface RegisterHostPartTwoRequest {
  username: string;
  position_company: string;
  twitter_username?: string;
  telegram_username?: string;
  name_company: string;
  website_company?: string;
  social_media?: Array<{
    type: 'discord' | 'github' | 'youtube' | 'other';
    url: string;
  }>;
  introduction_company: string;
  logo_company?: string;
  categories_atuation: Array<{
    slug: string;
  }>;
}

export interface RegisterHostPartTwoResponse {
  success: boolean;
  message: string;
  user: any;
  token: string;
}

/**
 * Completar cadastro do Host (segunda parte)
 */
export const registerHostPartTwo = async (
  hostId: string,
  data: RegisterHostPartTwoRequest
): Promise<RegisterHostPartTwoResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.REGISTER_HOST_PART_TWO(hostId), {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error completing registration');
  }

  return response.json();
};

export interface DeadlineDetailed {
  days: number;
  hours: number;
  minutes: number;
  total_minutes: number;
  is_expired: boolean;
}

export interface CampaignPublic {
  id: string;
  title: string;
  about_project: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled' | 'waiting payment';
  total_prize_pool: number;
  deadline: number;
  start_date: string;
  end_date: string;
  content_categories: Array<{ slug: string }>;
  total_submissions: number;
  deadline_detailed?: DeadlineDetailed;
  country?: Array<{ name: string }>;
  host_username?: string;
  name_company?: string;
  logo_company?: string;
  isPrivate?: boolean;
  is_cac?: boolean;
  format_cac?: 'clicks' | 'view';
  quantity_conversion?: number;
  amount_convertion?: number;
  limit_amount_convertion?: number;
  user_amount?: number;
  payment_token?: string;
}

export interface GetAllPublicCampaignsResponse {
  message: string;
  campaigns: CampaignPublic[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllPublicCampaigns = async (
  page = 1,
  limit = 10,
  status?: 'active' | 'inactive' | 'completed' | 'cancelled' | 'waiting payment'
): Promise<GetAllPublicCampaignsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_ENDPOINTS.HOST.CAMPAIGNS_PUBLIC}?${params.toString()}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching public campaigns');
  }

  return response.json();
}

export interface HostProfile {
  id: string;
  username: string;
  user_type: 'HOST';
  email: string;
  email_verified: boolean;
  isActive: boolean;
  totalCampanhasCriadas: number;
  totalDistribuido: number;
  created_at: string;
  updated_at: string;
  position_company: string;
  telegram_username: string;
  name_company: string;
  website_company: string;
  twitter_username?: string;
  social_media: Array<{
    type: 'discord' | 'github' | 'youtube' | 'other' | string;
    url: string;
  }>;
  introduction_company: string;
  logo_company?: string;
  twitter_profile_image?: string;
  categories_atuation: Array<{
    slug: string;
  }>;
  registerCompleted: boolean;
}

export interface UpdateHostProfileRequest {
  username?: string;
  twitter_username?: string;
  twitter_profile_image?: string;
  position_company?: string;
  telegram_username?: string;
  name_company?: string;
  website_company?: string;
  social_media?: Array<{
    type: 'discord' | 'github' | 'youtube' | 'other' | string;
    url: string;
  }>;
  introduction_company?: string;
  logo_company?: string; // base64
  categories_atuation?: Array<{
    slug: string;
  }>;
}


/**
 * Buscar perfil do Host
 */
export const getHostProfile = async (): Promise<HostProfile> => {
  const response = await fetch(API_ENDPOINTS.HOST.PROFILE, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching host profile');
  }

  return response.json();
};

/**
 * Atualizar perfil do Host
 */
export const updateHostProfile = async (
  data: UpdateHostProfileRequest
): Promise<HostProfile> => {
  const response = await fetch(API_ENDPOINTS.HOST.UPDATE_PROFILE, {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error updating profile');
  }

  return response.json();
};

/**
 * Buscar campanhas do Host
 */
export const getHostCampaigns = async (
  page = 1,
  limit = 10,
  category?: string
): Promise<GetAllPublicCampaignsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category) {
    params.append('type', category);
  }

  const response = await fetch(`${API_ENDPOINTS.HOST.CAMPAIGNS}?${params.toString()}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching host campaigns');
  }

  return response.json();
};

export interface CreateCampaignRequest {
  title: string;
  about_project: string;
  what_we_need: string;
  content_type: string;
  content_pillars: string;
  benefits?: string;
  requirements: string;
  submission_format: Array<{ type: 'twitter' | 'tiktok' | 'instagram' | 'youtube' | 'feedback' }>;
  content_format: Array<{ type: 'video' | 'thread' | 'post' | 'meme' | 'article' | 'other' | 'feedback' }>;
  content_categories: Array<{ slug: string }>;
  target_blockchain: string;
  official_links: Array<{ title: string; url: string; type: string }>;
  support_contact: Array<{ type: string; value: string; is_primary: boolean }>;
  original_url_shortener?: string;
  country: Array<{ name: string }>;
  start_date: string;
  end_date: string;
  timezone: string;
  payment_chain: string;
  payment_token: string;
  max_participants: number;
  winner_count: number | null;
  reward_tiers?: Array<{ position_initial: number; position_final: number; title: string; payment_amount: number }>;
  total_prize_pool: number;
  list_kols?: Array<{ userId: string; amount?: number }>;
  qtd_min_links?: number;
  qtd_max_links?: number;
  // CAC (Cost per Acquisition) fields
  is_cac?: boolean;
  format_cac?: 'clicks' | 'view';
  quantity_conversion?: number;
  amount_convertion?: number;
  limit_amount_convertion?: number;
}

/**
 * Criar nova campanha
 */
export const createCampaign = async (
  data: CreateCampaignRequest
): Promise<{ message: string; campaign: any }> => {
  const response = await fetch(API_ENDPOINTS.HOST.CAMPAIGNS, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creating campaign');
  }

  return response.json();
};

export interface HostCampaignsCount {
  campaigns_progress: number;
  campaigns_completed: number;
  total_user_submiteds: number;
}

export interface GetHostCampaignsCountResponse {
  message: string;
  campaigns_progress: number;
  campaigns_completed: number;
  total_user_submiteds: number;
}

/**
 * Buscar contagem de campanhas do Host
 */
export const getHostCampaignsCount = async (): Promise<GetHostCampaignsCountResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_CAMPAIGNS_COUNT, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching campaign count');
  }

  return response.json();
}

export interface CampaignDetails extends CampaignPublic {
  what_we_need: string;
  content_type: string;
  content_pillars: string;
  benefits?: string;
  requirements: string;
  submission_format: Array<{ type: string }>;
  content_format: Array<{ type: string }>;
  target_blockchain: string;
  official_links: Array<{ title: string; url: string; type: string }>;
  support_contact: Array<{ type: string; value: string; is_primary: boolean }>;
  country: Array<{ name: string }>;
  timezone: string;
  payment_chain: string;
  payment_token: string;
  max_participants: number;
  winner_count: number | null;
  reward_tiers: Array<{ position_initial: number; position_final: number; title: string; payment_amount: number }>;
  rewards_distributed?: boolean;
  host_username?: string;
  host_categories_atuation?: Array<{ slug: string }>;
  name_company?: string;
  logo_company?: string;
  // Private campaign fields
  list_kols?: Array<{ userId: string; amount?: number }>;
  qtd_min_links?: number;
  qtd_max_links?: number;
  // CAC (Cost per Acquisition) fields
  is_cac?: boolean;
  format_cac?: 'clicks' | 'view';
  quantity_conversion?: number;
  amount_convertion?: number;
  limit_amount_convertion?: number;
}

export interface GetCampaignByIdResponse {
  message: string;
  campaign: CampaignDetails;
}

/**
 * Buscar campanha por ID
 */
export const getCampaignById = async (id: string): Promise<GetCampaignByIdResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_CAMPAIGN_BY_ID(id), {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching campaign details');
  }

  return response.json();
}

/** Mesmo formato que GET /api/admin/campaign-metrics/:id — restrito ao host dono */
export interface HostCampaignMetricsPostKol {
  user_id: string;
  username: string;
  total_submissions: number;
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_bookmarks: number;
  submissions: string[];
  submissions_images?: string[];
  instagram_story: {
    views: number;
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface HostCampaignMetricsResponse {
  title: string;
  total_posts: number;
  total_submissions: number;
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_quotes: number;
  total_bookmarks: number;
  post_kols: HostCampaignMetricsPostKol[];
}

export const getHostCampaignMetrics = async (
  campaignId: string
): Promise<HostCampaignMetricsResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_CAMPAIGN_METRICS(campaignId), {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg =
      response.status === 403
        ? 'You do not have permission to view metrics for this campaign'
        : error.message || 'Error fetching campaign metrics';
    throw new Error(msg);
  }

  return response.json();
};

export type HostCampaignSocialPlatform = "twitter" | "tiktok" | "instagram" | "youtube";

export interface HostCampaignMetricsSummaryPostKol {
  user_id: string;
  username: string;
  total_submissions: number; // links count for campaign platforms
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_bookmarks: number;
  instagram_story: {
    views: number;
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface HostCampaignMetricsSummaryResponse {
  title: string;
  campaign_platforms: HostCampaignSocialPlatform[];
  total_posts: number;
  total_submissions: number; // creators count
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_quotes: number;
  total_bookmarks: number;
  post_kols: HostCampaignMetricsSummaryPostKol[];
}

export interface HostCampaignPlatformMetrics {
  link_count: number;
  likes: number;
  views: number;
  replies: number;
  retweets: number;
  bookmarks: number;
  quotes: number;
}

export type HostCampaignPlatformMetricsMap = Partial<
  Record<HostCampaignSocialPlatform, HostCampaignPlatformMetrics>
>;

export interface HostCampaignMetricsPlatformsPostKol {
  user_id: string;
  username: string;
  total_submissions: number; // links count for campaign platforms
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_bookmarks: number;
  instagram_story: {
    views: number;
    likes: number;
    retweets: number;
    replies: number;
  };
  platform_metrics: HostCampaignPlatformMetricsMap;
}

export interface HostCampaignMetricsPlatformsResponse {
  title: string;
  campaign_platforms: HostCampaignSocialPlatform[];
  total_posts: number;
  total_submissions: number; // creators count
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_quotes: number;
  total_bookmarks: number;
  post_kols: HostCampaignMetricsPlatformsPostKol[];
}

export const getHostCampaignMetricsSummary = async (
  campaignId: string
): Promise<HostCampaignMetricsSummaryResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_CAMPAIGN_METRICS_SUMMARY(campaignId), {
    method: "GET",
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg =
      response.status === 403
        ? "You do not have permission to view metrics for this campaign"
        : error.message || "Error fetching campaign metrics summary";
    throw new Error(msg);
  }

  return response.json();
};

export const getHostCampaignMetricsPlatforms = async (
  campaignId: string
): Promise<HostCampaignMetricsPlatformsResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_CAMPAIGN_METRICS_PLATFORMS(campaignId), {
    method: "GET",
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg =
      response.status === 403
        ? "You do not have permission to view metrics for this campaign"
        : error.message || "Error fetching campaign metrics by platforms";
    throw new Error(msg);
  }

  return response.json();
};

/**
 * Atualizar campanha
 */
export const updateCampaign = async (
  id: string,
  data: Partial<CreateCampaignRequest>
): Promise<{ message: string; campaign: CampaignDetails }> => {
  const response = await fetch(API_ENDPOINTS.HOST.UPDATE_CAMPAIGN(id), {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error updating campaign');
  }

  return response.json();
};

export interface DeleteCampaignResponse {
  message: string;
  success: boolean;
}

export const deleteCampaign = async (id: string): Promise<DeleteCampaignResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.DELETE_CAMPAIGN(id), {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error deleting campaign');
  }

  return response.json();
};

export interface CampaignSubmission {
  ordem: number;
  user_id: string;
  username: string;
  submission_twitter?: string;
  submission_tiktok?: string;
  submission_instagram?: string;
  submission_youtube?: string;
  submissions_kols?: string[]; // Array de links para campanhas privadas
  /** Proof images (Base64 data URLs) quando existirem */
  submissions_images?: string[];
  submission_feedback?: string; // Retornado por leaderboard-submits quando preenchido
  amount?: number; // Amount do list_kols para campanhas privadas
  amount_received?: number; // Valor recebido (após pagamento)
  signature?: string;
  chain?: string;
  winner?: boolean;
  date_submit: string;
  likes_twitter?: number;
  retweets_twitter?: number;
  views_twitter?: number;
  views_tiktok?: number;
  views_instagram?: number;
  views_youtube?: number;
  clicks?: number;
}

export interface GetCampaignSubmissionsResponse {
  message: string;
  format_cac?: 'clicks' | 'view';
  leaderboard?: CampaignSubmission[];
  submissions?: CampaignSubmission[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Buscar submissões de uma campanha
 */
export const getCampaignSubmissions = async (
  campaignId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetCampaignSubmissionsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_ENDPOINTS.HOST.GET_CAMPAIGN_SUBMISSIONS(campaignId)}?${params.toString()}`,
    {
      method: 'GET',
      headers: getDefaultHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching campaign submissions');
  }

  return response.json();
};

export interface Winner {
  id: string;
  user_id: string;
  user_name: string;
  username?: string;
  rank: number;
  value_amount: number;
  amount_received?: number;
  submission_twitter?: string;
  submission_tiktok?: string;
  submission_instagram?: string;
  submission_youtube?: string;
  submission_feedback?: string;
  signature?: string;
  chain?: string;
  created_at: string;
}

export interface SaveWinnersRequest {
  winners: Array<{
    user_id: string;
    rank: number;
  }>;
}

export interface SaveWinnersResponse {
  message: string;
  winners: Winner[];
}

export interface GetWinnersResponse {
  message: string;
  winners: Winner[];
}

/**
 * Salvar ganhadores da campanha
 */
export const saveWinners = async (campaignId: string, winners: SaveWinnersRequest['winners']): Promise<SaveWinnersResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.SAVE_WINNERS(campaignId), {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ winners }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error saving winners');
  }

  return response.json();
};

/**
 * Buscar ganhadores da campanha
 */
export const getWinners = async (campaignId: string): Promise<GetWinnersResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_WINNERS(campaignId), {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching winners');
  }

  return response.json();
};

export interface SuggestedRating {
  rank: number;
  username: string;
  amount_received: number;
  submission_twitter: string;
  submission_tiktok?: string;
  submission_instagram?: string;
  submission_youtube?: string;
  user_id: string;
  campaign_id: string;
  mindshare_score: number;
  views_twitter: number;
  likes_twitter: number;
  retweets_twitter: number;
  replies_twitter: number;
  quotes_twitter: number;
  bookmarks_twitter: number;
}

export interface GetSuggestedRatingsResponse {
  ranking: SuggestedRating[];
}

/**
 * Buscar ratings sugeridos para uma campanha
 */
export const getSuggestedRatings = async (campaignId: string): Promise<GetSuggestedRatingsResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.GET_SUGGESTED_RATINGS(campaignId), {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching winners');
  }

  return response.json();
};

export interface MakePaymentsResponse {
  message: string;
  success: boolean;
}

/**
 * Realizar pagamentos para os ganhadores
 */
export const makePayments = async (campaignId: string, acceptedRank: boolean): Promise<MakePaymentsResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.MAKE_PAYMENTS(campaignId, acceptedRank), {
    method: 'POST',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error making payments');
  }

  return response.json();
};

export interface PaymentKolResult {
  paymentId: string;
  signature: string;
  to: string;
}

export interface SendPaymentKolsResponse {
  success: boolean;
  message: string;
  data: PaymentKolResult[];
}

/**
 * Realizar pagamentos para os KOLs da campanha privada
 */
export const sendPaymentKols = async (campaignId: string): Promise<SendPaymentKolsResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.SEND_PAYMENT_KOLS(campaignId), {
    method: 'POST',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error sending payments to KOLs');
  }

  return response.json();
};

export interface SelectedKolForPayment {
  userId: string;
  quantity_convertion?: number; // Obrigatório quando campaign.is_cac é true
}

export interface SendPaymentKolsSelectiveRequest {
  selectedKols: SelectedKolForPayment[];
}

export interface SendPaymentKolsSelectiveResponse {
  success: boolean;
  message: string;
  data: {
    payments: Array<{
      paymentId?: string;
      signature?: string;
      to: string;
      transactionHash?: string;
    }>;
    refunds: Array<{
      paymentId?: string;
      signature?: string;
      to: string;
      transactionHash?: string;
      amount: number;
    }>;
  };
}

/**
 * Realizar pagamentos seletivos para KOLs da campanha privada
 * KOLs selecionados recebem pagamento, não selecionados têm valores devolvidos ao host
 */
export const sendPaymentKolsSelective = async (
  campaignId: string,
  selectedKols: SelectedKolForPayment[]
): Promise<SendPaymentKolsSelectiveResponse> => {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.SEND_PAYMENT_KOLS_SELECTIVE(campaignId), {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ selectedKols }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Error sending selective payments to KOLs');
  }

  return response.json();
};

export interface ResendVerificationCodeRequest {
  email: string;
}

export interface ResendVerificationCodeResponse {
  message: string;
}

/**
 * Reenviar código de verificação por email
 */
export const resendVerificationCode = async (
  data: ResendVerificationCodeRequest
): Promise<ResendVerificationCodeResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.RESEND_VERIFICATION_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error resending verification code');
  }

  return response.json();
};

export interface ValidateEmailCodeRequest {
  email: string;
  code: string;
}

export interface ValidateEmailCodeResponse {
  message: string;
  email_verified: boolean;
}

/**
 * Validar código de verificação de email
 */
export const validateEmailCode = async (
  data: ValidateEmailCodeRequest
): Promise<ValidateEmailCodeResponse> => {
  const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE_EMAIL_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error validating email code');
  }

  return response.json();
};

export interface ActiveAccountResponse {
  active_account_host: boolean;
}

/**
 * Buscar status de active_account_host
 */
export const getActiveAccount = async (): Promise<ActiveAccountResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.ACTIVE_ACCOUNT, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching active account status');
  }

  return response.json();
};

export interface Kol {
  id: string;
  username: string;
  twitter_profile_image?: string | null;
}

export interface GetKolsResponse {
  message: string;
  kols: Kol[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Buscar lista de KOLs (creators) disponíveis
 */
export const getKols = async (
  usernameFilter?: string,
  page: number = 1,
  limit: number = 10
): Promise<GetKolsResponse> => {
  const params = new URLSearchParams();
  
  if (usernameFilter && usernameFilter.trim()) {
    params.append('username', usernameFilter.trim());
  }
  
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const url = `${API_ENDPOINTS.HOST.GET_KOLS}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error fetching KOLs');
  }

  return response.json();
};

export interface IsParabuildersResponse {
  isParabuilders: boolean;
}

/**
 * Verificar se o host autenticado é da Parabuilders
 */
export const isParabuilders = async (): Promise<IsParabuildersResponse> => {
  const response = await fetch(API_ENDPOINTS.HOST.IS_PARABUILDERS, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error checking Nido status');
  }

  return response.json();
};