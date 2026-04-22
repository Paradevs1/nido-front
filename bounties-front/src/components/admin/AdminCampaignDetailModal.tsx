"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import ProofImageLightbox from "@/components/ui/ProofImageLightbox";
import {
  getCampaignMetrics,
  getCampaignStats,
  upsertInstagramStoryMetrics,
  deleteInstagramStoryMetrics,
  type CampaignMetricsResponse,
  type CampaignStatsResponse,
  type CampaignMetricsPostKol,
  type CampaignOption,
  type CampaignSocialPlatform,
} from "@/lib/api/admin";

const ALL_PLATFORMS: CampaignSocialPlatform[] = ["twitter", "tiktok", "instagram", "youtube"];

type TabId = "metrics" | "instagram_feed" | "youtube" | "tiktok" | "story" | "twitter";

type SubmissionPlatformFilter = "all" | CampaignSocialPlatform | "other";

function platformLabel(p: CampaignSocialPlatform): string {
  if (p === "twitter") return "Twitter/X";
  if (p === "instagram") return "Instagram";
  if (p === "youtube") return "YouTube";
  return "TikTok";
}

/** URLs visíveis conforme filtro (campos submission_* + links extra classificados). */
function collectSubmissionLinks(kol: CampaignMetricsPostKol, filter: SubmissionPlatformFilter): string[] {
  const pm = kol.platform_metrics;
  const extras = kol.kols_extra_links ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (u: string) => {
    const t = u.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  };
  if (filter === "all") {
    for (const pl of ALL_PLATFORMS) {
      const u = pm?.[pl]?.submission_url;
      if (u) add(u);
    }
    for (const e of extras) add(e.url);
    return out;
  }
  if (filter === "other") {
    for (const e of extras) {
      if (e.detected === "unknown") add(e.url);
    }
    return out;
  }
  const u = pm?.[filter]?.submission_url;
  if (u) add(u);
  for (const e of extras) {
    if (e.detected === filter) add(e.url);
  }
  return out;
}

function showProofImagesForFilter(filter: SubmissionPlatformFilter): boolean {
  return filter === "all" || filter === "instagram";
}

/** API legada: `post_kols` pode vir sem `user_id` — chave estável para tabela / expand */
function kolRowKey(kol: CampaignMetricsPostKol, index: number): string {
  const id = kol.user_id?.trim();
  if (id) return id;
  return `row-${index}-${kol.username ?? "user"}`;
}

function PlatformBreakdownTable({
  postKols,
  platform,
  emptyHint,
}: {
  postKols: CampaignMetricsPostKol[];
  platform: CampaignSocialPlatform;
  emptyHint: string;
}) {
  const rows = postKols.filter((kol) => {
    const sl = kol.platform_metrics?.[platform];
    const hasField = !!(sl?.submission_url?.trim());
    const hasExtra = (kol.kols_extra_links ?? []).some((l) => l.detected === platform);
    return hasField || hasExtra;
  });
  if (rows.length === 0) {
    return <p className="text-white/50 text-sm py-6">{emptyHint}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-3 py-2 text-white/80 font-semibold">@</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Links</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Views</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Likes</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Resp.</th>
            <th className="px-3 py-2 text-white/80 font-semibold">RT</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Marks</th>
            <th className="px-3 py-2 text-white/80 font-semibold">Quotes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((kol, rowIndex) => {
            const rowKey = kolRowKey(kol, rowIndex);
            const sl = kol.platform_metrics?.[platform];
            const extras = (kol.kols_extra_links ?? []).filter((l) => l.detected === platform);
            const urls: string[] = [];
            if (sl?.submission_url?.trim()) urls.push(sl.submission_url.trim());
            for (const e of extras) {
              if (!urls.includes(e.url)) urls.push(e.url);
            }
            return (
              <tr key={rowKey} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-3 py-2 text-white font-medium align-top">
                  {kol.username ? `@${kol.username}` : "—"}
                </td>
                <td className="px-3 py-2 text-white/80 align-top">
                  <ul className="space-y-1">
                    {urls.map((u) => (
                      <li key={u}>
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-primary)] text-xs break-all hover:underline"
                        >
                          {u}
                        </a>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-2 text-white/80">{sl?.views ?? 0}</td>
                <td className="px-3 py-2 text-white/80">{sl?.likes ?? 0}</td>
                <td className="px-3 py-2 text-white/80">{sl?.replies ?? 0}</td>
                <td className="px-3 py-2 text-white/80">{sl?.retweets ?? 0}</td>
                <td className="px-3 py-2 text-white/80">{sl?.bookmarks ?? 0}</td>
                <td className="px-3 py-2 text-white/80">{sl?.quotes ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function parseNonNegativeInt(v: string): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export default function AdminCampaignDetailModal({
  campaign,
  onClose,
}: {
  campaign: CampaignOption;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("metrics");
  const [metrics, setMetrics] = useState<CampaignMetricsResponse | null>(null);
  const [stats, setStats] = useState<CampaignStatsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [expandedKols, setExpandedKols] = useState<Set<string>>(new Set());
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionPlatformFilter>("all");
  const [showGlobalTotals, setShowGlobalTotals] = useState(false);

  const [storyUserId, setStoryUserId] = useState("");
  const [storyLikes, setStoryLikes] = useState("0");
  const [storyViews, setStoryViews] = useState("0");
  const [storyRetweets, setStoryRetweets] = useState("0");
  const [storyReplies, setStoryReplies] = useState("0");
  const [storySaving, setStorySaving] = useState(false);
  const [storyMessage, setStoryMessage] = useState<string | null>(null);
  const [storyErr, setStoryErr] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const m = await getCampaignMetrics(campaign.id);
      setMetrics(m);
    } catch (e) {
      setMetrics(null);
      setMetricsError(e instanceof Error ? e.message : "Erro ao carregar métricas");
    } finally {
      setMetricsLoading(false);
    }
  }, [campaign.id]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const s = await getCampaignStats(campaign.id);
      setStats(s);
    } catch (e) {
      setStats(null);
      setStatsError(e instanceof Error ? e.message : "Erro ao carregar estatísticas Twitter");
    } finally {
      setStatsLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => {
    void loadMetrics();
    void loadStats();
  }, [loadMetrics, loadStats]);

  const applyKolToStoryForm = useCallback((kol: CampaignMetricsPostKol | undefined) => {
    if (!kol) {
      setStoryUserId("");
      setStoryLikes("0");
      setStoryViews("0");
      setStoryRetweets("0");
      setStoryReplies("0");
      return;
    }
    setStoryUserId(kol.user_id?.trim() ?? "");
    const st = kol.instagram_story;
    setStoryLikes(String(st?.likes ?? 0));
    setStoryViews(String(st?.views ?? 0));
    setStoryRetweets(String(st?.retweets ?? 0));
    setStoryReplies(String(st?.replies ?? 0));
  }, []);

  useEffect(() => {
    if (!metrics?.post_kols?.length) {
      applyKolToStoryForm(undefined);
      return;
    }
    const withUserId = metrics.post_kols.filter((k) => k.user_id?.trim());
    if (withUserId.length === 0) {
      applyKolToStoryForm(undefined);
      return;
    }
    const match = withUserId.find((k) => k.user_id === storyUserId);
    if (storyUserId && match) return;
    applyKolToStoryForm(withUserId[0]);
  }, [metrics, storyUserId, applyKolToStoryForm]);

  const toggleExpand = (userId: string) => {
    setExpandedKols((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const onStoryParticipantChange = (userId: string) => {
    setStoryMessage(null);
    setStoryErr(null);
    const kol = metrics?.post_kols.find((k) => k.user_id === userId);
    applyKolToStoryForm(kol);
  };

  const handleStorySave = async () => {
    if (!storyUserId.trim()) {
      setStoryErr("Selecione um participante.");
      return;
    }
    setStorySaving(true);
    setStoryErr(null);
    setStoryMessage(null);
    try {
      await upsertInstagramStoryMetrics({
        campaign_id: campaign.id,
        user_id: storyUserId.trim(),
        likes: parseNonNegativeInt(storyLikes),
        views: parseNonNegativeInt(storyViews),
        retweets: parseNonNegativeInt(storyRetweets),
        replies: parseNonNegativeInt(storyReplies),
      });
      setStoryMessage("Métricas de Instagram Story salvas.");
      await loadMetrics();
    } catch (e) {
      setStoryErr(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setStorySaving(false);
    }
  };

  const handleStoryDelete = async () => {
    if (!storyUserId.trim()) return;
    if (!window.confirm("Zerar métricas de Instagram Story para este participante?")) return;
    setStorySaving(true);
    setStoryErr(null);
    setStoryMessage(null);
    try {
      await deleteInstagramStoryMetrics(campaign.id, storyUserId.trim());
      setStoryMessage("Métricas de Story removidas.");
      setStoryLikes("0");
      setStoryViews("0");
      setStoryRetweets("0");
      setStoryReplies("0");
      await loadMetrics();
    } catch (e) {
      setStoryErr(e instanceof Error ? e.message : "Erro ao remover");
    } finally {
      setStorySaving(false);
    }
  };

  const fmt = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString("pt-BR") : "0";

  const storyParticipants = metrics?.post_kols.filter((k) => k.user_id?.trim()) ?? [];
  const storyFormAvailable = storyParticipants.length > 0;

  const selectedStoryKol = useMemo(
    () => metrics?.post_kols.find((k) => k.user_id === storyUserId && storyUserId.trim()),
    [metrics, storyUserId]
  );
  const storyProofImages = selectedStoryKol?.submissions_images ?? [];

  const campaignPlatforms = useMemo((): CampaignSocialPlatform[] => {
    if (metrics?.campaign_platforms?.length) return metrics.campaign_platforms;
    return ALL_PLATFORMS;
  }, [metrics?.campaign_platforms]);

  const filterOptions = useMemo((): SubmissionPlatformFilter[] => {
    return ["all", ...campaignPlatforms, "other"];
  }, [campaignPlatforms]);

  const visibleTabs = useMemo(() => {
    const p = campaignPlatforms;
    const items: { id: TabId; label: string }[] = [{ id: "metrics", label: "Métricas (campanha)" }];
    if (p.includes("instagram")) items.push({ id: "instagram_feed", label: "Instagram (post)" });
    if (p.includes("youtube")) items.push({ id: "youtube", label: "YouTube" });
    if (p.includes("tiktok")) items.push({ id: "tiktok", label: "TikTok" });
    if (p.includes("instagram")) items.push({ id: "story", label: "Instagram Story (manual)" });
    if (p.includes("twitter")) items.push({ id: "twitter", label: "Twitter + vencedores" });
    return items;
  }, [campaignPlatforms]);

  const displayTotals = useMemo(() => {
    if (!metrics) return null;
    if (showGlobalTotals || !metrics.filtered_totals) {
      return {
        total_posts: metrics.total_posts,
        total_likes: metrics.total_likes,
        total_views: metrics.total_views,
        total_replies: metrics.total_replies,
        total_retweets: metrics.total_retweets,
        total_quotes: metrics.total_quotes,
        total_bookmarks: metrics.total_bookmarks,
      };
    }
    return metrics.filtered_totals;
  }, [metrics, showGlobalTotals]);

  useEffect(() => {
    const ids = new Set(visibleTabs.map((t) => t.id));
    if (!ids.has(tab)) setTab("metrics");
  }, [visibleTabs, tab]);

  const tabBtn = (id: TabId, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
        tab === id
          ? "bg-white/10 text-white border border-b-0 border-white/15"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 p-5 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {campaign.name || "Sem título"}
            </h2>
            {campaign.host && (
              <p className="text-white/60 text-sm mt-1">
                Host: <span className="text-white/80 font-medium">{campaign.host.name_company || campaign.host.username}</span>
                {campaign.host.email && (
                  <span className="text-white/40 ml-1.5">({campaign.host.email})</span>
                )}
              </p>
            )}
            <p className="text-white/50 text-xs mt-1 font-mono break-all">ID: {campaign.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-2 border-b border-white/10 shrink-0 flex-wrap">
          {visibleTabs.map((t) => tabBtn(t.id, t.label))}
        </div>

        <div className="overflow-y-auto flex-1 p-5 min-h-0">
          {tab === "metrics" && (
            <div className="space-y-6">
              {metricsLoading ? (
                <p className="text-white/60 text-center py-8">Carregando métricas agregadas...</p>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {metricsError}
                </div>
              ) : metrics ? (
                <>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{metrics.title}</h3>
                    {metrics.host && (
                      <p className="text-white/50 text-xs mb-1">
                        Host: <span className="text-white/70">{metrics.host.name_company || metrics.host.username}</span>
                      </p>
                    )}
                    <p className="text-white/50 text-xs mb-2">
                      Plataformas desta campanha:{" "}
                      <span className="text-white/75">{campaignPlatforms.map(platformLabel).join(" · ")}</span>
                    </p>
                    {metrics.filtered_totals ? (
                      <label className="flex items-center gap-2 text-white/55 text-xs mb-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showGlobalTotals}
                          onChange={(e) => setShowGlobalTotals(e.target.checked)}
                          className="rounded border-white/30"
                        />
                        Mostrar totais globais (todas as redes e links não classificados)
                      </label>
                    ) : null}
                    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {[
                        ["Posts (links)", displayTotals?.total_posts ?? 0],
                        ["Participantes", metrics.total_submissions],
                        ["Views (total)", displayTotals?.total_views ?? 0],
                        ["Likes (total)", displayTotals?.total_likes ?? 0],
                        ["Respostas", displayTotals?.total_replies ?? 0],
                        ["Retweets", displayTotals?.total_retweets ?? 0],
                        ["Quotes", displayTotals?.total_quotes ?? 0],
                        ["Bookmarks", displayTotals?.total_bookmarks ?? 0],
                      ].map(([label, val]) => (
                        <div key={String(label)} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <dt className="text-white/50 text-xs">{label}</dt>
                          <dd className="text-white font-medium mt-1">{fmt(val as number)}</dd>
                        </div>
                      ))}
                    </dl>
                    {!showGlobalTotals && metrics.filtered_totals ? (
                      <p className="text-white/35 text-xs mt-2 max-w-3xl">
                        Totais da campanha ignoram links que não batem com as plataformas acima (ex.: shorteners
                        genéricos aparecem em &quot;Outros&quot; no detalhe e não entram nestes números).
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Por creator</h4>
                    <p className="text-white/45 text-xs mb-2">
                      Na linha expandida, filtre links por rede. Imagens de prova aparecem em{" "}
                      <strong className="text-white/70">Tudo</strong> ou{" "}
                      <strong className="text-white/70">Instagram</strong>.
                    </p>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className="text-white/50 text-xs shrink-0">Filtro do detalhe:</span>
                      {filterOptions.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setSubmissionFilter(f)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            submissionFilter === f
                              ? "bg-[var(--color-primary)] text-black"
                              : "bg-white/10 text-white/80 hover:bg-white/15"
                          }`}
                        >
                          {f === "all" ? "Tudo" : f === "other" ? "Outros" : platformLabel(f)}
                        </button>
                      ))}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                      <table className="w-full text-left text-sm min-w-[720px]">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-3 py-2 text-white/80 font-semibold">@</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Links</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Views</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Likes</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Resp.</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">RT</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Marks</th>
                            <th className="px-3 py-2 text-white/80 font-semibold">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.post_kols.map((kol, rowIndex) => {
                            const rowKey = kolRowKey(kol, rowIndex);
                            const open = expandedKols.has(rowKey);
                            const imgCount = kol.submissions_images?.length ?? 0;
                            const linkCountAll = kol.submissions?.length ?? 0;
                            const fr = showGlobalTotals || !kol.filtered_row ? null : kol.filtered_row;
                            const linkCountRow = fr?.link_count ?? kol.total_submissions;
                            const vRow = fr?.views ?? kol.total_views;
                            const lkRow = fr?.likes ?? kol.total_likes;
                            const rpRow = fr?.replies ?? kol.total_replies;
                            const rtRow = fr?.retweets ?? kol.total_retweets;
                            const bmRow = fr?.bookmarks ?? kol.total_bookmarks;
                            const filteredUrls = collectSubmissionLinks(kol, submissionFilter);
                            const showImages = showProofImagesForFilter(submissionFilter) && imgCount > 0;
                            return (
                              <Fragment key={rowKey}>
                                <tr className="border-b border-white/5 hover:bg-white/5">
                                  <td className="px-3 py-2 text-white font-medium">
                                    {kol.username ? `@${kol.username}` : "—"}
                                    <span className="block text-[10px] text-white/40 font-mono truncate max-w-[200px]">
                                      {kol.user_id}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-white/80">{fmt(linkCountRow)}</td>
                                  <td className="px-3 py-2 text-white/80">{fmt(vRow)}</td>
                                  <td className="px-3 py-2 text-white/80">{fmt(lkRow)}</td>
                                  <td className="px-3 py-2 text-white/80">{fmt(rpRow)}</td>
                                  <td className="px-3 py-2 text-white/80">{fmt(rtRow)}</td>
                                  <td className="px-3 py-2 text-white/80">{fmt(bmRow)}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleExpand(rowKey)}
                                      className="text-[var(--color-primary)] hover:underline text-xs font-medium cursor-pointer"
                                    >
                                      {open ? "Ocultar" : "Links / imagens"}
                                      {(linkCountAll > 0 || imgCount > 0) && (
                                        <span className="text-white/40">
                                          {" "}
                                          ({linkCountAll} · {imgCount} img)
                                        </span>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                                {open && (
                                  <tr className="bg-black/20">
                                    <td colSpan={8} className="px-3 py-3">
                                      {filteredUrls.length > 0 ? (
                                        <div className="mb-3">
                                          <p className="text-white/50 text-xs mb-1">
                                            URLs{" "}
                                            {submissionFilter === "all"
                                              ? "(todas)"
                                              : submissionFilter === "other"
                                                ? "(outros / não classificados)"
                                                : `(${platformLabel(submissionFilter)})`}
                                          </p>
                                          <ul className="space-y-1">
                                            {filteredUrls.map((url) => (
                                              <li key={url}>
                                                <a
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-[var(--color-primary)] text-xs break-all hover:underline"
                                                >
                                                  {url}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : (
                                        <p className="text-white/40 text-xs mb-3">
                                          Nenhum link neste filtro para este creator.
                                        </p>
                                      )}
                                      {showImages ? (
                                        <div>
                                          <p className="text-white/50 text-xs mb-2">
                                            Proof images ({imgCount}) — enviadas pelo creator (Instagram Story etc.)
                                          </p>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {kol.submissions_images!.map((src, i) => (
                                              <ProofImageLightbox
                                                key={i}
                                                src={src}
                                                alt={`Proof ${i + 1}`}
                                                className="block w-full rounded-lg overflow-hidden border border-white/10 bg-gray-900 aspect-square"
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      ) : imgCount > 0 &&
                                        submissionFilter !== "all" &&
                                        submissionFilter !== "instagram" ? (
                                        <p className="text-white/40 text-xs">
                                          {imgCount} imagem(ns) de prova ocultas neste filtro — use &quot;Tudo&quot; ou
                                          &quot;Instagram&quot;.
                                        </p>
                                      ) : (
                                        <p className="text-white/40 text-xs">Nenhuma imagem anexada nesta submissão.</p>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {metrics.post_kols.length === 0 && (
                      <p className="text-white/50 text-sm py-4">Nenhum participante nesta campanha.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {tab === "instagram_feed" && (
            <div className="space-y-3">
              {metricsLoading ? (
                <p className="text-white/60 text-center py-8">Carregando…</p>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {metricsError}
                </div>
              ) : metrics ? (
                <>
                  <p className="text-white/55 text-sm">
                    Métricas do campo <strong className="text-white">submission_instagram</strong> e links extra
                    detectados como Instagram. Story (manual) permanece na aba dedicada.
                  </p>
                  <PlatformBreakdownTable
                    postKols={metrics.post_kols}
                    platform="instagram"
                    emptyHint="Nenhum link Instagram nesta campanha."
                  />
                </>
              ) : null}
            </div>
          )}

          {tab === "youtube" && (
            <div className="space-y-3">
              {metricsLoading ? (
                <p className="text-white/60 text-center py-8">Carregando…</p>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {metricsError}
                </div>
              ) : metrics ? (
                <>
                  <p className="text-white/55 text-sm">
                    Métricas do campo <strong className="text-white">submission_youtube</strong> e links extra
                    detectados como YouTube.
                  </p>
                  <PlatformBreakdownTable
                    postKols={metrics.post_kols}
                    platform="youtube"
                    emptyHint="Nenhum link YouTube nesta campanha."
                  />
                </>
              ) : null}
            </div>
          )}

          {tab === "tiktok" && (
            <div className="space-y-3">
              {metricsLoading ? (
                <p className="text-white/60 text-center py-8">Carregando…</p>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {metricsError}
                </div>
              ) : metrics ? (
                <>
                  <p className="text-white/55 text-sm">
                    Métricas do campo <strong className="text-white">submission_tiktok</strong> e links extra
                    detectados como TikTok.
                  </p>
                  <PlatformBreakdownTable
                    postKols={metrics.post_kols}
                    platform="tiktok"
                    emptyHint="Nenhum link TikTok nesta campanha."
                  />
                </>
              ) : null}
            </div>
          )}

          {tab === "twitter" && (
            <div>
              {statsLoading ? (
                <p className="text-white/60 text-center py-8">Carregando estatísticas Twitter...</p>
              ) : statsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {statsError}
                </div>
              ) : stats ? (
                <>
                  <dl className="space-y-3 text-sm mb-6">
                    <div>
                      <dt className="text-white/50">Submissões</dt>
                      <dd className="text-white font-medium">
                        {typeof stats.total_submissions === "number"
                          ? stats.total_submissions.toLocaleString("pt-BR")
                          : "0"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/50">Views (Twitter)</dt>
                      <dd className="text-white">
                        {typeof stats.views_twitter === "number"
                          ? stats.views_twitter.toLocaleString("pt-BR")
                          : "0"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/50">Likes</dt>
                      <dd className="text-white">
                        {typeof stats.likes_twitter === "number"
                          ? stats.likes_twitter.toLocaleString("pt-BR")
                          : "0"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/50">Retweets</dt>
                      <dd className="text-white">
                        {typeof stats.retweets_twitter === "number"
                          ? stats.retweets_twitter.toLocaleString("pt-BR")
                          : "0"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/50">Respostas</dt>
                      <dd className="text-white">
                        {typeof stats.replies_twitter === "number"
                          ? stats.replies_twitter.toLocaleString("pt-BR")
                          : "0"}
                      </dd>
                    </div>
                  </dl>
                  {stats.winners && stats.winners.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-3">Vencedores</h3>
                      <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-3 py-2 text-white/80 font-semibold">@</th>
                              <th className="px-3 py-2 text-white/80 font-semibold">Valor recebido</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.winners.map((w, i) => (
                              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                <td className="px-3 py-2 text-white font-medium">
                                  {w.username ? `@${w.username}` : "—"}
                                </td>
                                <td className="px-3 py-2 text-white/80">
                                  {typeof w.amount_received === "number"
                                    ? w.amount_received.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {tab === "story" && (
            <div className="max-w-xl space-y-4">
              <p className="text-white/60 text-sm">
                Ajuste manual das métricas de <strong className="text-white">Instagram Story</strong> por participante.
                Os totais da aba &quot;Métricas&quot; são atualizados após salvar.
              </p>
              {metricsLoading && !metrics ? (
                <p className="text-white/50 text-sm">Carregando lista de participantes...</p>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {metricsError}
                </div>
              ) : metrics && metrics.post_kols.length === 0 ? (
                <p className="text-white/50 text-sm">Nenhum participante para editar.</p>
              ) : metrics && metrics.post_kols.length > 0 && !storyFormAvailable ? (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
                  O endpoint <code className="text-xs bg-black/30 px-1 rounded">GET /api/admin/campaign-metrics/:id</code>{" "}
                  não está retornando <code className="text-xs bg-black/30 px-1 rounded">user_id</code> em cada item de{" "}
                  <code className="text-xs bg-black/30 px-1 rounded">post_kols</code>. Sem isso, o PUT de Instagram Story
                  não pode ser usado a partir desta tela. Ajuste no backend (com sua aprovação) ou informe o{" "}
                  <code className="text-xs bg-black/30 px-1 rounded">user_id</code> por outro meio.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Participante</label>
                    <select
                      value={storyUserId}
                      onChange={(e) => onStoryParticipantChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
                    >
                      {storyParticipants.map((k) => (
                        <option key={k.user_id} value={k.user_id}>
                          @{k.username || (k.user_id?.slice(0, 8) ?? "?")}…
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedStoryKol && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white/50 text-xs mb-2">
                        Proof images (mesmas da aba Métricas)
                      </p>
                      {storyProofImages.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {storyProofImages.map((src, i) => (
                            <ProofImageLightbox
                              key={i}
                              src={src}
                              alt={`Proof ${i + 1}`}
                              className="block w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-gray-900 hover:ring-2 hover:ring-[var(--color-primary)]/50 transition-all"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/35 text-xs">
                          Nenhuma imagem anexada nesta submissão.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-1">Views</label>
                      <input
                        type="number"
                        min={0}
                        value={storyViews}
                        onChange={(e) => setStoryViews(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">Likes</label>
                      <input
                        type="number"
                        min={0}
                        value={storyLikes}
                        onChange={(e) => setStoryLikes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">
                        Compartilhamentos (campo legado no DB)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={storyRetweets}
                        onChange={(e) => setStoryRetweets(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">
                        Respostas / comentários (Story)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={storyReplies}
                        onChange={(e) => setStoryReplies(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                  </div>
                  {storyErr && (
                    <p className="text-red-400 text-sm">{storyErr}</p>
                  )}
                  {storyMessage && (
                    <p className="text-emerald-400 text-sm">{storyMessage}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="white"
                      className="cursor-pointer"
                      disabled={storySaving || !storyUserId}
                      onClick={() => void handleStorySave()}
                    >
                      {storySaving ? "Salvando..." : "Salvar Story"}
                    </Button>
                    <button
                      type="button"
                      disabled={storySaving || !storyUserId}
                      onClick={() => void handleStoryDelete()}
                      className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer"
                    >
                      Zerar Story
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
