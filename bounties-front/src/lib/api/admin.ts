import { API_ENDPOINTS, API_BASE_URL, getDefaultHeaders } from "./config";

export interface AdminCreatorListItem {
  id?: string;
  isActive?: boolean;
  twitter_username?: string;
  twitter_followers_count?: number;
  total_earnings?: number;
  wallet_evm?: string;
  wallet_sui?: string;
  wallet_sol?: string;
}

export interface AdminCreatorInsightsListItem {
  id?: string;
  isActive?: boolean;
  twitter_username?: string;
  username_discord?: string;
  username_instagram?: string;
  username_telegram?: string;
  username_tiktok?: string;
  username_youtube?: string;
  average_views_per_post?: string;
}

export interface ProfileStats {
  total_creators: number;
  twitter: number;
  instagram: number;
  tiktok: number;
  youtube: number;
  telegram: number;
  discord: number;
}

export interface AdminCreatorsInsightsListResponse {
  creators: AdminCreatorInsightsListItem[];
  profile_stats?: ProfileStats;
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminCreatorsInsightsFilters {
  search?: string;
  average_views_per_post?: string;
  primary_language?: string;
  fluent_language?: string;
  audience_region?: string;
  content_category_list?: string;
  content_formats?: string;
  crypto_experience?: string;
  trading_experience?: string;
  main_chains?: string;
}

export interface AdminCreatorsInsightsOptionsResponse {
  average_views_per_post: string[];
  primary_language: string[];
  fluent_language: string[];
  audience_region: string[];
  content_category_list: string[];
  content_formats: string[];
  crypto_experience: string[];
  trading_experience: string[];
  main_chains: string[];
}

export interface AdminCreatorsListResponse {
  creators: AdminCreatorListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetCreatorsListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Ordenação global (MongoDB), não só da página atual */
  sortBy?: "followers" | "earnings";
  sortOrder?: "asc" | "desc";
}

/** Linha da listagem de participação em campanhas (admin). */
export interface AdminCreatorParticipationRow {
  id: string;
  username?: string;
  twitter_username?: string;
  isActive?: boolean;
  campaigns_participated: number;
}

export interface AdminCreatorsParticipationStatsResponse {
  creators: AdminCreatorParticipationRow[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminRecurringCampaignMeta {
  id: string;
  title: string;
  isPrivate?: boolean;
  created_at: string;
}

export interface AdminCreatorsRecurringResponse extends AdminCreatorsParticipationStatsResponse {
  last_campaigns: AdminRecurringCampaignMeta[];
  window_campaigns: number;
}

export async function getCreatorsParticipationStats(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<AdminCreatorsParticipationStatsResponse> {
  const { page = 1, limit = 50, search } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.CREATORS_PARTICIPATION_STATS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (search?.trim()) url.searchParams.set("search", search.trim());
  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar participação em campanhas");
  }
  return res.json();
}

export type CampaignTypeFilter = "all" | "public" | "private";

export async function getCreatorsRecurring(params: {
  page?: number;
  limit?: number;
  search?: string;
  lastN?: number;
  campaignType?: CampaignTypeFilter;
} = {}): Promise<AdminCreatorsRecurringResponse> {
  const { page = 1, limit = 50, search, lastN = 5, campaignType } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.CREATORS_RECURRING);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lastN", String(lastN));
  if (campaignType && campaignType !== "all") url.searchParams.set("campaignType", campaignType);
  if (search?.trim()) url.searchParams.set("search", search.trim());
  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar creators recorrentes");
  }
  return res.json();
}

export async function getCreatorsList(params: GetCreatorsListParams = {}): Promise<AdminCreatorsListResponse> {
  const { page = 1, limit = 50, search, sortBy, sortOrder } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.CREATORS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (search?.trim()) url.searchParams.set("search", search.trim());
  if (sortBy && sortOrder) {
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);
  }
  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar creators");
  }
  return res.json();
}

export async function getCreatorsInsightsList(params: { page?: number; limit?: number } & AdminCreatorsInsightsFilters = {}): Promise<AdminCreatorsInsightsListResponse> {
  const { page = 1, limit = 50 } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.CREATORS_INSIGHTS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  const setIf = (key: string, value?: string) => {
    if (value && value.trim()) url.searchParams.set(key, value.trim());
  };
  setIf("search", params.search);
  setIf("average_views_per_post", params.average_views_per_post);
  setIf("primary_language", params.primary_language);
  setIf("fluent_language", params.fluent_language);
  setIf("audience_region", params.audience_region);
  setIf("content_category_list", params.content_category_list);
  setIf("content_formats", params.content_formats);
  setIf("crypto_experience", params.crypto_experience);
  setIf("trading_experience", params.trading_experience);
  setIf("main_chains", params.main_chains);

  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar creators insights");
  }
  return res.json();
}

export async function getCreatorsInsightsOptions(): Promise<AdminCreatorsInsightsOptionsResponse> {
  const res = await fetch(`${API_ENDPOINTS.ADMIN.CREATORS_INSIGHTS}/options`, { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao carregar opções de filtros");
  }
  return res.json();
}

export async function getAdminUserDetail(userId: string): Promise<Record<string, unknown>> {
  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) throw new Error("userId inválido");

  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao buscar detalhe do usuário");
  }
  return res.json();
}

export async function setUserActive(userId: string, isActive: boolean): Promise<{ message: string; isActive: boolean }> {
  const res = await fetch(API_ENDPOINTS.ADMIN.USER_ACTIVE(userId), {
    method: "PATCH",
    headers: getDefaultHeaders(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao atualizar status ativo");
  }
  return res.json();
}

export interface AdminHostListItem {
  name_company?: string;
  email?: string;
  campaigns_created: number;
  plan_name?: string;
  duration_plan?: string | null;
  id?: string;
  /** Aprovação da conta host (backend: inactive até o admin liberar). */
  accountStatus?: "active" | "inactive";
}

export interface AdminHostsListResponse {
  hosts: AdminHostListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetHostsListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Filtro por conta host liberada ou aguardando aprovação. */
  accountStatus?: "active" | "inactive";
}

export async function getHostsList(params: GetHostsListParams = {}): Promise<AdminHostsListResponse> {
  const { page = 1, limit = 50, search, accountStatus } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.HOSTS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (search?.trim()) url.searchParams.set("search", search.trim());
  if (accountStatus === "active" || accountStatus === "inactive") {
    url.searchParams.set("accountStatus", accountStatus);
  }
  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar hosts");
  }
  const data = await res.json();
  const hosts = Array.isArray(data.hosts)
    ? data.hosts.map((row: Record<string, unknown>) => {
        const id = typeof row.id === "string" ? row.id : undefined;
        const accountStatus =
          row.accountStatus === "inactive" || row.accountStatus === "active"
            ? row.accountStatus
            : undefined;
        const fromStatus =
          row.status === "inactive" || row.status === "active"
            ? row.status
            : undefined;
        return {
          ...row,
          id: id ?? (typeof row.id === "string" ? row.id : undefined),
          accountStatus: accountStatus ?? fromStatus ?? "active",
        } as AdminHostListItem;
      })
    : [];
  return { ...data, hosts };
}

export async function updateHostAccountStatus(
  userId: string,
  status: "active" | "inactive"
): Promise<{ message: string; status: "active" | "inactive" }> {
  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) throw new Error("ID do host é obrigatório");

  const res = await fetch(API_ENDPOINTS.ADMIN.HOST_ACCOUNT_STATUS(id), {
    method: "PATCH",
    headers: getDefaultHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao atualizar status da conta host");
  }
  return res.json();
}

export interface AdminHostsCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface HostOption {
  host_id: string;
  name_company?: string;
}

export async function getHostsOptions(): Promise<HostOption[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/hosts/options`, { headers: getDefaultHeaders() });
  if (!res.ok) throw new Error("Erro ao listar options de hosts");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getHostsCounts(): Promise<AdminHostsCounts> {
  const [allRes, activeRes, inactiveRes] = await Promise.all([
    getHostsList({ page: 1, limit: 1 }),
    getHostsList({ page: 1, limit: 1, accountStatus: "active" }),
    getHostsList({ page: 1, limit: 1, accountStatus: "inactive" }),
  ]);
  return {
    total: allRes.total,
    active: activeRes.total,
    inactive: inactiveRes.total,
  };
}

export interface PlanOption {
  id: string;
  name: string;
}

export async function getPlansList(): Promise<PlanOption[]> {
  const res = await fetch(API_ENDPOINTS.PLANS.LIST, { headers: getDefaultHeaders() });
  if (!res.ok) throw new Error("Erro ao listar planos");
  const data = await res.json();
  const plans = data?.plans ?? [];
  return plans.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));
}

export async function updateHostPlan(hostId: string, planId: string): Promise<{ success: boolean; message?: string }> {
  const id = typeof hostId === "string" ? hostId.trim() : "";
  if (!id) throw new Error("ID do host é obrigatório");
  if (!planId?.trim()) throw new Error("ID do plano é obrigatório");

  const url = API_ENDPOINTS.ADMIN.HOST_UPDATE_PLAN(id);
  const res = await fetch(url, {
    method: "PATCH",
    headers: getDefaultHeaders(),
    body: JSON.stringify({ plan_id: planId.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao atualizar plano");
  }
  return res.json();
}

export interface CampaignOptionHost {
  id: string;
  username: string;
  name_company?: string;
  email?: string;
}

export interface CampaignOption {
  id: string;
  name: string;
  isPrivate?: boolean;
  country?: Array<{ name: string }>;
  host?: CampaignOptionHost;
}

export async function getCampaignsCombo(): Promise<CampaignOption[]> {
  const res = await fetch(API_ENDPOINTS.ADMIN.CAMPAIGNS_OPTIONS, { headers: getDefaultHeaders() });
  if (!res.ok) throw new Error("Erro ao listar campanhas");
  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.campaigns ?? [];
  return list.map((c: { id: string; name?: string; isPrivate?: boolean; country?: Array<{ name: string }>; host?: CampaignOptionHost }) => ({
    id: c.id,
    name: c.name ?? "",
    isPrivate: c.isPrivate,
    country: c.country,
    host: c.host,
  }));
}

export interface ShortUrlItem {
  twitter_username?: string;
  shortURL: string;
  clicks: number;
}

export interface CampaignShortUrlsResponse {
  campaignTitle: string;
  items: ShortUrlItem[];
}

export async function getCampaignShortUrls(campaignId: string): Promise<CampaignShortUrlsResponse> {
  const url = API_ENDPOINTS.ADMIN.CAMPAIGN_SHORT_URLS(campaignId);
  const res = await fetch(url, { headers: getDefaultHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Campanha não encontrada");
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar short URLs");
  }
  return res.json();
}

export interface CampaignCountsResponse {
  total: number;
  public: number;
  private: number;
}

export async function getCampaignCounts(): Promise<CampaignCountsResponse> {
  const res = await fetch(API_ENDPOINTS.ADMIN.CAMPAIGNS_COUNTS, { headers: getDefaultHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar contagens de campanhas");
  const data = await res.json();
  return {
    total: typeof data?.total === "number" ? data.total : 0,
    public: typeof data?.public === "number" ? data.public : 0,
    private: typeof data?.private === "number" ? data.private : 0,
  };
}

export interface CampaignStatsResponse {
  views_twitter: number;
  likes_twitter: number;
  retweets_twitter: number;
  replies_twitter: number;
  total_submissions: number;
  winners: Array<{ username: string; amount_received: number }>;
}

export async function getCampaignStats(campaignId: string): Promise<CampaignStatsResponse> {
  const url = API_ENDPOINTS.ADMIN.CAMPAIGN_STATS(campaignId);
  const res = await fetch(url, { headers: getDefaultHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Campanha não encontrada");
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao buscar estatísticas");
  }
  return res.json();
}

export type CampaignSocialPlatform = "twitter" | "tiktok" | "instagram" | "youtube";

export interface PlatformMetricSlice {
  submission_url?: string;
  likes: number;
  views: number;
  replies: number;
  retweets: number;
  bookmarks: number;
  quotes: number;
}

export interface KolExtraLink {
  url: string;
  detected: CampaignSocialPlatform | "unknown";
}

export interface CampaignMetricsFilteredRow {
  link_count: number;
  likes: number;
  views: number;
  replies: number;
  retweets: number;
  bookmarks: number;
  quotes: number;
}

/** Métricas agregadas multi-plataforma (admin) — ver GET /api/admin/campaign-metrics/:id */
export interface CampaignMetricsPostKol {
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
  /** Breakdown por rede (campos submission_* + métricas da API) */
  platform_metrics?: {
    twitter: PlatformMetricSlice;
    tiktok: PlatformMetricSlice;
    instagram: PlatformMetricSlice;
    youtube: PlatformMetricSlice;
  };
  /** submissions_kols com detecção por hostname */
  kols_extra_links?: KolExtraLink[];
  /** Contagem de links + métricas só das plataformas em `campaign_platforms` */
  filtered_row?: CampaignMetricsFilteredRow;
}

export interface CampaignMetricsFilteredTotals {
  total_posts: number;
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_quotes: number;
  total_bookmarks: number;
}

export interface CampaignMetricsResponse {
  title: string;
  host?: CampaignOptionHost;
  /** Plataformas configuradas em submission_format da campanha (fallback: todas) */
  campaign_platforms?: CampaignSocialPlatform[];
  total_posts: number;
  total_submissions: number;
  total_likes: number;
  total_views: number;
  total_replies: number;
  total_retweets: number;
  total_quotes: number;
  total_bookmarks: number;
  /** Totais restritos às plataformas da campanha (+ links extra só se hostname reconhecido) */
  filtered_totals?: CampaignMetricsFilteredTotals;
  post_kols: CampaignMetricsPostKol[];
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetricsResponse> {
  const url = API_ENDPOINTS.ADMIN.CAMPAIGN_METRICS(campaignId);
  const res = await fetch(url, { headers: getDefaultHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Campanha não encontrada");
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao buscar métricas da campanha");
  }
  return res.json();
}

export interface UpsertInstagramStoryMetricsBody {
  campaign_id: string;
  user_id: string;
  likes: number;
  views: number;
  retweets: number;
  replies: number;
}

export async function upsertInstagramStoryMetrics(
  body: UpsertInstagramStoryMetricsBody
): Promise<{ message?: string }> {
  const res = await fetch(API_ENDPOINTS.ADMIN.INSTAGRAM_STORY_METRICS, {
    method: "PUT",
    headers: getDefaultHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao salvar métricas de Story");
  }
  return res.json().catch(() => ({}));
}

export async function deleteInstagramStoryMetrics(
  campaign_id: string,
  user_id: string
): Promise<{ message?: string }> {
  const res = await fetch(API_ENDPOINTS.ADMIN.INSTAGRAM_STORY_METRICS, {
    method: "DELETE",
    headers: getDefaultHeaders(),
    body: JSON.stringify({ campaign_id, user_id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao remover métricas de Story");
  }
  return res.json().catch(() => ({}));
}

export type PaymentSource = "Winners" | "Active Campaign" | "Refunds" | "Plans";

export type PaymentStatus = "pending" | "confirmed" | "failed" | "error";

export interface AdminPaymentListItem {
  id: string;
  source: PaymentSource;
  created_at: string;
  updated_at?: string;
  status?: PaymentStatus | string;
  /** Nome do usuário (username) */
  user_name?: string;
  /** Nome da empresa (para hosts) */
  company_name?: string;
  /** Nome/título da campanha */
  campaign_name?: string;
  amount?: number;
  symbol?: string;
  chain?: string;
  userId?: string;
  campaignId?: string;
  to?: string;
  signature?: string;
  hostId?: string;
  walletAddressHost?: string;
  campaign_id?: string;
  user_id?: string;
  plan_id?: string;
  tax?: string;
  date?: string;
  [key: string]: unknown;
}

export interface AdminPaymentsListResponse {
  payments: AdminPaymentListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetPaymentsListParams {
  page?: number;
  limit?: number;
  userId?: string;
  campaignId?: string;
  status?: string;
  /** Busca única: usuário, empresa ou campanha */
  search?: string;
  /** Origem: Winners | Active Campaign | Refunds | Plans */
  source?: string;
  user_name?: string;
  company_name?: string;
  campaign_name?: string;
}

export async function getPaymentsList(params: GetPaymentsListParams = {}): Promise<AdminPaymentsListResponse> {
  const { page = 1, limit = 50, userId, campaignId, status, search, source, user_name, company_name, campaign_name } = params;
  const url = new URL(API_ENDPOINTS.ADMIN.PAYMENTS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (userId?.trim()) url.searchParams.set("userId", userId.trim());
  if (campaignId?.trim()) url.searchParams.set("campaignId", campaignId.trim());
  if (status?.trim()) url.searchParams.set("status", status.trim());
  if (search?.trim()) url.searchParams.set("search", search.trim());
  if (source?.trim()) url.searchParams.set("source", source.trim());
  if (user_name?.trim()) url.searchParams.set("user_name", user_name.trim());
  if (company_name?.trim()) url.searchParams.set("company_name", company_name.trim());
  if (campaign_name?.trim()) url.searchParams.set("campaign_name", campaign_name.trim());
  const res = await fetch(url.toString(), { headers: getDefaultHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Erro ao listar pagamentos");
  }
  return res.json();
}

export interface AdminDashboardCounts {
  creatorsTotal: number;
  hostsTotal: number;
  campaignsTotal: number;
  campaignsPublic: number;
  campaignsPrivate: number;
  paymentsTotal: number;
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const [creatorsRes, hostsRes, countsRes, paymentsRes] = await Promise.allSettled([
    fetch(`${API_ENDPOINTS.ADMIN.CREATORS}?page=1&limit=1`, { headers: getDefaultHeaders() }),
    fetch(`${API_ENDPOINTS.ADMIN.HOSTS}?page=1&limit=1`, { headers: getDefaultHeaders() }),
    fetch(API_ENDPOINTS.ADMIN.CAMPAIGNS_COUNTS, { headers: getDefaultHeaders() }),
    fetch(`${API_ENDPOINTS.ADMIN.PAYMENTS}?page=1&limit=1`, { headers: getDefaultHeaders() }),
  ]);

  const getTotal = (r: PromiseSettledResult<Response>) =>
    r.status === "fulfilled" && r.value.ok
      ? (async () => {
          const j = await r.value.json();
          return typeof j?.total === "number" ? j.total : 0;
        })()
      : Promise.resolve(0);

  const getCounts = (r: PromiseSettledResult<Response>) =>
    r.status === "fulfilled" && r.value.ok
      ? (async () => {
          const j = await r.value.json();
          return {
            total: typeof j?.total === "number" ? j.total : 0,
            public: typeof j?.public === "number" ? j.public : 0,
            private: typeof j?.private === "number" ? j.private : 0,
          };
        })()
      : Promise.resolve({ total: 0, public: 0, private: 0 });

  const [creatorsTotal, hostsTotal, paymentsTotal, counts] = await Promise.all([
    getTotal(creatorsRes),
    getTotal(hostsRes),
    getTotal(paymentsRes),
    getCounts(countsRes),
  ]);

  return {
    creatorsTotal,
    hostsTotal,
    campaignsTotal: counts.total,
    campaignsPublic: counts.public,
    campaignsPrivate: counts.private,
    paymentsTotal,
  };
}
