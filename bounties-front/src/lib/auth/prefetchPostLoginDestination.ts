import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from "@/lib/api/config";

type RouterLike = {
  prefetch: (href: string) => void | Promise<void>;
};

/**
 * Enquanto o overlay de redirect está visível:
 * 1) prefetch da rota Next (bundle + RSC)
 * 2) warm das APIs que a página de destino costuma chamar de imediato
 *
 * Os fetches são fire-and-forget; falhas são ignoradas (a página refaz se precisar).
 */
export function prefetchPostLoginDestination(
  router: RouterLike,
  path: string
): void {
  try {
    void router.prefetch(path);
  } catch {
    /* noop */
  }

  if (path === "/host/pending-activation") {
    return;
  }

  const headers = getDefaultHeaders();
  const publicCampaigns = API_ENDPOINTS.HOST.CAMPAIGNS_PUBLIC;

  const fire = (url: string) => {
    void fetch(url, { method: "GET", headers }).catch(() => {});
  };

  // Creator dashboard — alinhado a ExploreCampaigns (limit 8), RecentEarners, WelcomeBanner
  if (path === "/creator") {
    fire(`${publicCampaigns}?page=1&limit=8`);
    fire(`${API_BASE_URL}/api/creator/get-recent-earners`);
    fire(`${API_BASE_URL}/api/creator/welcome`);
    return;
  }

  // Host — mesma lista pública que `host/campaign/page` + perfil do header
  if (path === "/host/campaign") {
    const params = new URLSearchParams({
      page: "1",
      limit: "10",
      status: "active",
    });
    fire(`${publicCampaigns}?${params}`);
    fire(API_ENDPOINTS.HOST.PROFILE);
    return;
  }

  if (path === "/host/create") {
    fire(API_ENDPOINTS.HOST.PROFILE);
  }

  // Admin: só prefetch de rota; endpoints variam por página
}
