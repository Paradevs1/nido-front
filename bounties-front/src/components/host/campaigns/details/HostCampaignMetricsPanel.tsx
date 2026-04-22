"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomSelect from "@/components/ui/CustomSelect";
import { getMyPlan } from "@/lib/api/plan";
import {
  getHostCampaignMetrics,
  getHostCampaignMetricsPlatforms,
  getHostCampaignMetricsSummary,
  type HostCampaignMetricsPlatformsPostKol,
  type HostCampaignMetricsPlatformsResponse,
  type HostCampaignMetricsSummaryResponse,
  type HostCampaignMetricsPostKol,
  type HostCampaignMetricsResponse,
} from "@/lib/api/host";

type HostLinkPlatform = "all" | "instagram" | "youtube" | "tiktok" | "twitter";
type DetectedHostPlatform = Exclude<HostLinkPlatform, "all">;

function detectPlatform(url: string): DetectedHostPlatform | null {
  const u = String(url ?? "").trim();
  if (!u) return null;
  const lower = u.toLowerCase();
  try {
    const href = u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
    const parsed = new URL(href);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "twitter.com" || host === "x.com" || host.endsWith(".twitter.com")) return "twitter";
    if (host.includes("instagram.com") || host.includes("instagr.am")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host === "youtu.be" || host.includes("youtube.com")) return "youtube";
  } catch {
    // ignore
  }
  if (/twitter\.com|(^|\.)x\.com\b/i.test(lower)) return "twitter";
  if (/instagram\.com|instagr\.am/i.test(lower)) return "instagram";
  if (/tiktok\.com/i.test(lower)) return "tiktok";
  if (/youtube\.com|youtu\.be/i.test(lower)) return "youtube";
  return null;
}

function platformLabel(p: HostLinkPlatform): string {
  switch (p) {
    case "all":
      return "All";
    case "twitter":
      return "Twitter/X";
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default: {
      // Ensures this function stays exhaustive when HostLinkPlatform changes.
      const _exhaustive: never = p;
      return _exhaustive;
    }
  }
}

function kolRowKey(kol: HostCampaignMetricsPostKol, index: number): string {
  return kol.user_id?.trim() || `row-${index}-${kol.username ?? "u"}`;
}

export default function HostCampaignMetricsPanel({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(true);
  const [planChecked, setPlanChecked] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [data, setData] = useState<HostCampaignMetricsResponse | null>(null);
  const [metricsSummary, setMetricsSummary] = useState<HostCampaignMetricsSummaryResponse | null>(null);
  const [metricsPlatforms, setMetricsPlatforms] = useState<HostCampaignMetricsPlatformsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkFilter, setLinkFilter] = useState<HostLinkPlatform>("all");
  const [creatorSearch, setCreatorSearch] = useState("");
  const [campaignPlatforms, setCampaignPlatforms] = useState<DetectedHostPlatform[]>([
    "instagram",
    "youtube",
    "tiktok",
    "twitter",
  ]);
  const [showAdvancedKpis, setShowAdvancedKpis] = useState(false);
  const [networkCreatorId, setNetworkCreatorId] = useState<string>("all");
  const [linksModal, setLinksModal] = useState<{
    username: string;
    links: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPlanChecked(false);
    getMyPlan()
      .then((r) => {
        if (cancelled) return;
        const name = String(r?.plan?.name ?? "").toUpperCase();
        const active = Boolean(r?.is_active);
        setIsEnterprise(name === "ENTERPRISE" && active);
      })
      .catch(() => {
        if (!cancelled) setIsEnterprise(false);
      })
      .finally(() => {
        if (!cancelled) setPlanChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  type ChartMetric =
    | "links"
    | "views"
    | "likes"
    | "replies"
    | "retweets"
    | "story_views"
    | "story_likes"
    | "story_replies"
    | "story_shares";

  const [chartMetric, setChartMetric] = useState<ChartMetric>("views");
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");
  const [creatorsPage, setCreatorsPage] = useState(1);
  const CREATOR_PAGE_SIZE = 5;

  const chartColors = {
    a: "rgba(249, 115, 22, 0.95)", // orange-500
    b: "rgba(59, 130, 246, 0.85)", // blue-500
    grid: "rgba(255,255,255,0.08)",
    axis: "rgba(255,255,255,0.55)",
    tick: "rgba(255,255,255,0.65)",
    tooltipBg: "rgba(10, 20, 30, 0.95)",
    tooltipBorder: "rgba(255,255,255,0.12)",
  } as const;

  const refresh = () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);

    setMetricsSummary(null);
    setMetricsPlatforms(null);

    Promise.allSettled([
      getHostCampaignMetrics(campaignId)
        .then(setData)
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Failed to load metrics");
        }),
      getHostCampaignMetricsSummary(campaignId)
        .then((r) => {
          setMetricsSummary(r);
          setCampaignPlatforms((r.campaign_platforms ?? []) as DetectedHostPlatform[]);
        })
        .catch(() => {
          // não bloqueia a página se falhar apenas a análise dos gráficos
        }),
      getHostCampaignMetricsPlatforms(campaignId).then(setMetricsPlatforms).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !campaignId) return;
    if (!planChecked || !isEnterprise) return;
    refresh();
  }, [open, campaignId, planChecked, isEnterprise]);

  const fmt = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString("en-US") : "0";

  const closeLinksModal = () => setLinksModal(null);

  const metricLabel = (m: ChartMetric): string => {
    switch (m) {
      case "links":
        return "Links";
      case "views":
        return "Views";
      case "likes":
        return "Likes";
      case "replies":
        return "Replies";
      case "retweets":
        return "Retweets";
      case "story_views":
        return "Story views";
      case "story_likes":
        return "Story likes";
      case "story_replies":
        return "Story replies";
      case "story_shares":
        return "Story shares";
      default:
        return m;
    }
  };

  const getMetricValue = (kol: HostCampaignMetricsPostKol, metric: ChartMetric): number => {
    switch (metric) {
      case "links":
        return Number(kol.total_submissions ?? 0) || 0;
      case "views":
        return Number(kol.total_views ?? 0) || 0;
      case "likes":
        return Number(kol.total_likes ?? 0) || 0;
      case "replies":
        return Number(kol.total_replies ?? 0) || 0;
      case "retweets":
        return Number(kol.total_retweets ?? 0) || 0;
      case "story_views":
        return Number(kol.instagram_story?.views ?? 0) || 0;
      case "story_likes":
        return Number(kol.instagram_story?.likes ?? 0) || 0;
      case "story_replies":
        return Number(kol.instagram_story?.replies ?? 0) || 0;
      case "story_shares":
        return Number(kol.instagram_story?.retweets ?? 0) || 0;
      default:
        return 0;
    }
  };

  const countLinksForFilter = (kol: HostCampaignMetricsPostKol, filter: HostLinkPlatform): number => {
    const links = kol.submissions ?? [];
    if (filter === "all") return links.length;
    return links.reduce((acc, url) => acc + (detectPlatform(url) === filter ? 1 : 0), 0);
  };

  const getMetricValueForChartFilter = (
    kol: HostCampaignMetricsPostKol,
    metric: ChartMetric,
    filter: HostLinkPlatform
  ): number => {
    // A API só separa "submissions" por plataforma (links). Para métricas de views/likes/replies/retweets
    // não existe quebra por plataforma; então aplicamos o filtro apenas quando fizer sentido.
    if (metric === "links") return countLinksForFilter(kol, filter);

    const isStoryMetric =
      metric === "story_views" ||
      metric === "story_likes" ||
      metric === "story_replies" ||
      metric === "story_shares";

    // instagram_story é específico do Instagram.
    if (isStoryMetric && filter !== "all" && filter !== "instagram") return 0;

    return getMetricValue(kol, metric);
  };

  const getMetricValueForPlatformsChartFilter = (
    kol: HostCampaignMetricsPlatformsPostKol,
    metric: ChartMetric,
    filter: HostLinkPlatform
  ): number => {
    const isStoryMetric =
      metric === "story_views" ||
      metric === "story_likes" ||
      metric === "story_replies" ||
      metric === "story_shares";

    if (isStoryMetric) {
      // Story metrics existem apenas para Instagram.
      if (filter !== "all" && filter !== "instagram") return 0;
      switch (metric) {
        case "story_views":
          return Number(kol.instagram_story?.views ?? 0) || 0;
        case "story_likes":
          return Number(kol.instagram_story?.likes ?? 0) || 0;
        case "story_replies":
          return Number(kol.instagram_story?.replies ?? 0) || 0;
        case "story_shares":
          return Number(kol.instagram_story?.retweets ?? 0) || 0;
        default:
          return 0;
      }
    }

    if (filter === "all") {
      return getMetricValue({
        total_submissions: kol.total_submissions,
        total_views: kol.total_views,
        total_likes: kol.total_likes,
        total_replies: kol.total_replies,
        total_retweets: kol.total_retweets,
        instagram_story: kol.instagram_story,
      } as HostCampaignMetricsPostKol, metric);
    }

    const platformKey = filter as DetectedHostPlatform;
    const pm = kol.platform_metrics?.[platformKey];
    switch (metric) {
      case "links":
        return Number(pm?.link_count ?? 0) || 0;
      case "views":
        return Number(pm?.views ?? 0) || 0;
      case "likes":
        return Number(pm?.likes ?? 0) || 0;
      case "replies":
        return Number(pm?.replies ?? 0) || 0;
      case "retweets":
        return Number(pm?.retweets ?? 0) || 0;
      default:
        return 0;
    }
  };

  const platformCounts = (() => {
    const counts: Record<HostLinkPlatform, number> = {
      all: 0,
      instagram: 0,
      youtube: 0,
      tiktok: 0,
      twitter: 0,
    };
    if (!data?.post_kols?.length) return counts;
    for (const kol of data.post_kols) {
      for (const url of kol.submissions ?? []) {
        const p = detectPlatform(url);
        if (p) counts[p] += 1;
        counts.all += 1;
      }
    }
    return counts;
  })();

  const storyTotals = (() => {
    let views = 0;
    let likes = 0;
    let retweets = 0;
    let replies = 0;
    for (const kol of data?.post_kols ?? []) {
      views += Number(kol.instagram_story?.views ?? 0) || 0;
      likes += Number(kol.instagram_story?.likes ?? 0) || 0;
      retweets += Number(kol.instagram_story?.retweets ?? 0) || 0;
      replies += Number(kol.instagram_story?.replies ?? 0) || 0;
    }
    return { views, likes, retweets, replies };
  })();

  const creators = useMemo(() => {
    const items =
      data?.post_kols?.map((k, idx) => ({
        key: kolRowKey(k, idx),
        id: k.user_id?.trim() || "",
        username: k.username?.trim() || "",
      })) ?? [];
    // ensure stable keys + unique by key
    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.key)) return false;
      seen.add(it.key);
      return true;
    });
  }, [data]);

  const creatorOptions = useMemo(
    () =>
      creators.map((c) => ({
        value: c.key,
        label: c.username ? `@${c.username}` : c.key,
      })),
    [creators]
  );

  useEffect(() => {
    // initialize compare picks once data arrives
    if (!creators.length) return;
    setCompareA((prev) => prev || creators[0].key);
    setCompareB((prev) => prev || creators[Math.min(1, creators.length - 1)].key);
  }, [creators]);

  useEffect(() => {
    // When platform-aware metrics are available, prefer user_id-based selections.
    if (!metricsPlatforms?.post_kols?.length) return;
    setCompareA((prev) => prev || metricsPlatforms.post_kols[0].user_id);
    setCompareB((prev) => prev || metricsPlatforms.post_kols[Math.min(1, metricsPlatforms.post_kols.length - 1)].user_id);
  }, [metricsPlatforms?.post_kols]);

  const compareCreatorOptions = useMemo(() => {
    if (metricsPlatforms?.post_kols?.length) {
      return metricsPlatforms.post_kols.map((k) => ({
        value: k.user_id,
        label: k.username ? `@${k.username}` : k.user_id,
      }));
    }
    return creatorOptions;
  }, [metricsPlatforms?.post_kols, creatorOptions]);

  const networkCreatorOptions = useMemo(() => {
    const base = [{ value: "all", label: "All creators" }];
    if (!metricsPlatforms?.post_kols?.length) return base;
    return base.concat(
      metricsPlatforms.post_kols.map((k) => ({
        value: k.user_id,
        label: k.username ? `@${k.username}` : k.user_id,
      }))
    );
  }, [metricsPlatforms?.post_kols]);

  const networkCards = useMemo(() => {
    const rows = metricsPlatforms?.post_kols ?? [];
    if (!rows.length) return [];

    const creatorRow =
      networkCreatorId === "all" ? null : rows.find((r) => r.user_id === networkCreatorId) ?? null;

    const pick = (pl: DetectedHostPlatform) => {
      if (creatorRow) {
        const m = creatorRow.platform_metrics?.[pl];
        return {
          link_count: Number(m?.link_count ?? 0) || 0,
          views: Number(m?.views ?? 0) || 0,
          likes: Number(m?.likes ?? 0) || 0,
          replies: Number(m?.replies ?? 0) || 0,
        };
      }

      return rows.reduce(
        (acc, r) => {
          const m = r.platform_metrics?.[pl];
          acc.link_count += Number(m?.link_count ?? 0) || 0;
          acc.views += Number(m?.views ?? 0) || 0;
          acc.likes += Number(m?.likes ?? 0) || 0;
          acc.replies += Number(m?.replies ?? 0) || 0;
          return acc;
        },
        { link_count: 0, views: 0, likes: 0, replies: 0 }
      );
    };

    const labelMap: Record<DetectedHostPlatform, string> = {
      instagram: "Instagram",
      youtube: "YouTube",
      tiktok: "TikTok",
      twitter: "Twitter/X",
    };

    return (campaignPlatforms.length ? campaignPlatforms : (["instagram", "youtube", "tiktok", "twitter"] as DetectedHostPlatform[]))
      .map((pl) => ({ platform: pl, label: labelMap[pl], ...pick(pl) }))
      .filter((c) => true);
  }, [metricsPlatforms?.post_kols, networkCreatorId, campaignPlatforms]);

  const normalizedCreatorSearch = creatorSearch.trim().replace(/^@+/, "").toLowerCase();

  const filteredPostKols = useMemo(() => {
    const list = data?.post_kols ?? [];
    if (!normalizedCreatorSearch) return list;
    return list.filter((k) => (k.username ?? "").toLowerCase().includes(normalizedCreatorSearch));
  }, [data?.post_kols, normalizedCreatorSearch]);

  const totalCreatorPages = filteredPostKols.length
    ? Math.max(1, Math.ceil(filteredPostKols.length / CREATOR_PAGE_SIZE))
    : 1;
  const safeCreatorsPage = Math.min(Math.max(1, creatorsPage), totalCreatorPages);

  useEffect(() => {
    setCreatorsPage((p) => Math.min(p, totalCreatorPages));
  }, [totalCreatorPages]);

  useEffect(() => {
    setCreatorsPage(1);
  }, [linkFilter]);

  useEffect(() => {
    setCreatorsPage(1);
  }, [normalizedCreatorSearch]);

  const pagedPostKols = useMemo(() => {
    const start = (safeCreatorsPage - 1) * CREATOR_PAGE_SIZE;
    return filteredPostKols.slice(start, start + CREATOR_PAGE_SIZE);
  }, [filteredPostKols, safeCreatorsPage]);

  const rankingData = useMemo(() => {
    if (metricsPlatforms?.post_kols?.length) {
      const list = metricsPlatforms.post_kols.map((k, idx) => ({
        key: k.user_id?.trim() || `row-${idx}-${k.username ?? "u"}`,
        name: k.username ? `@${k.username}` : "—",
        value: getMetricValueForPlatformsChartFilter(k, chartMetric, linkFilter),
      }));

      return list.sort((a, b) => b.value - a.value);
    }

    if (metricsSummary?.post_kols?.length && linkFilter === "all") {
      const list = metricsSummary.post_kols.map((k, idx) => ({
        key: k.user_id?.trim() || `row-${idx}-${k.username ?? "u"}`,
        name: k.username ? `@${k.username}` : "—",
        value: getMetricValue({
          total_submissions: k.total_submissions,
          total_views: k.total_views,
          total_likes: k.total_likes,
          total_replies: k.total_replies,
          total_retweets: k.total_retweets,
          instagram_story: k.instagram_story,
        } as HostCampaignMetricsPostKol, chartMetric),
      }));
      return list.sort((a, b) => b.value - a.value);
    }

    const list =
      data?.post_kols?.map((k, idx) => ({
        key: kolRowKey(k, idx),
        name: k.username ? `@${k.username}` : "—",
        value: getMetricValueForChartFilter(k, chartMetric, linkFilter),
      })) ?? [];
    return list.sort((a, b) => b.value - a.value);
  }, [metricsPlatforms, data, chartMetric, linkFilter]);

  const compareData = useMemo(() => {
    const metrics: Array<{ id: ChartMetric; label: string }> = [
      { id: "links", label: "Links" },
      { id: "views", label: "Views" },
      { id: "likes", label: "Likes" },
      { id: "replies", label: "Replies" },
      { id: "retweets", label: "Retweets" },
      { id: "story_views", label: "Story views" },
      { id: "story_likes", label: "Story likes" },
      { id: "story_replies", label: "Story replies" },
      { id: "story_shares", label: "Story shares" },
    ];

    if (metricsPlatforms?.post_kols?.length) {
      const a = metricsPlatforms.post_kols.find((k) => k.user_id === compareA);
      const b = metricsPlatforms.post_kols.find((k) => k.user_id === compareB);
      if (!a || !b) return [];

      const aName = a.username ? `@${a.username}` : "A";
      const bName = b.username ? `@${b.username}` : "B";

      return metrics.map((m) => ({
        metric: m.label,
        a: getMetricValueForPlatformsChartFilter(a, m.id, linkFilter),
        b: getMetricValueForPlatformsChartFilter(b, m.id, linkFilter),
        aName,
        bName,
      }));
    }

    if (metricsSummary?.post_kols?.length && linkFilter === "all") {
      const a = metricsSummary.post_kols.find((k) => k.user_id === compareA);
      const b = metricsSummary.post_kols.find((k) => k.user_id === compareB);
      if (!a || !b) return [];

      const aName = a.username ? `@${a.username}` : "A";
      const bName = b.username ? `@${b.username}` : "B";

      return metrics.map((m) => ({
        metric: m.label,
        a: getMetricValue({
          total_submissions: a.total_submissions,
          total_views: a.total_views,
          total_likes: a.total_likes,
          total_replies: a.total_replies,
          total_retweets: a.total_retweets,
          instagram_story: a.instagram_story,
        } as HostCampaignMetricsPostKol, m.id),
        b: getMetricValue({
          total_submissions: b.total_submissions,
          total_views: b.total_views,
          total_likes: b.total_likes,
          total_replies: b.total_replies,
          total_retweets: b.total_retweets,
          instagram_story: b.instagram_story,
        } as HostCampaignMetricsPostKol, m.id),
        aName,
        bName,
      }));
    }

    if (!data?.post_kols?.length) return [];
    const a = data.post_kols.find((k, idx) => kolRowKey(k, idx) === compareA);
    const b = data.post_kols.find((k, idx) => kolRowKey(k, idx) === compareB);
    if (!a || !b) return [];

    const aName = a.username ? `@${a.username}` : "A";
    const bName = b.username ? `@${b.username}` : "B";

    return metrics.map((m) => ({
      metric: m.label,
      a: getMetricValueForChartFilter(a, m.id, linkFilter),
      b: getMetricValueForChartFilter(b, m.id, linkFilter),
      aName,
      bName,
    }));
  }, [metricsPlatforms, data, compareA, compareB, linkFilter]);

  // Enterprise-only gate: não renderizar Analytics para BASIC.
  if (!planChecked) {
    return null;
  }
  if (!isEnterprise) {
    return null;
  }

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold">Analytics</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Performance dashboard for this campaign. Explore totals, creators, and comparisons.
            </p>
          </div>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 border-t border-white/10">
          {loading && <p className="text-gray-400 py-6 text-center text-sm">Loading…</p>}
          {error && (
            <p className="text-red-400 py-4 text-sm border border-red-500/30 rounded-xl px-4 bg-red-500/10">
              {error}
            </p>
          )}
          {!loading && !error && data && (
            <div className="space-y-5 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{data.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refresh}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-white text-sm font-medium">General KPIs</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedKpis((v) => !v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/10 cursor-pointer"
                  >
                    {showAdvancedKpis ? "Ver menos" : "Ver mais"}
                  </button>
                </div>

                <div className="p-3">
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {[
                      ["Posts", data.total_posts],
                      ["Creators", data.total_submissions],
                      ["Views", data.total_views],
                      ["Likes", data.total_likes],
                    ].map(([label, val]) => (
                      <div key={String(label)} className="rounded-xl bg-black/10 border border-white/10 p-3">
                        <dt className="text-gray-500 text-xs">{label}</dt>
                        <dd className="text-white font-semibold mt-1">{fmt(val as number)}</dd>
                      </div>
                    ))}
                  </dl>

                  {showAdvancedKpis && (
                    <div className="mt-2">
                      <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                        {[
                          ["Replies", data.total_replies],
                          ["Retweets/Shares", data.total_retweets],
                          ["Quotes", data.total_quotes],
                          ["Bookmarks", data.total_bookmarks],
                          ["Story views", storyTotals.views],
                          ["Story likes", storyTotals.likes],
                          ["Story replies", storyTotals.replies],
                          ["Story shares", storyTotals.retweets],
                        ].map(([label, val]) => (
                          <div key={String(label)} className="rounded-xl bg-black/10 border border-white/10 p-3">
                            <dt className="text-gray-500 text-xs">{label}</dt>
                            <dd className="text-white font-medium mt-1">{fmt(val as number)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>

              {networkCards.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-visible">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-white text-sm font-medium">Metrics by platform</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Creator</span>
                      <div className="min-w-[220px]">
                        <CustomSelect
                          value={networkCreatorId}
                          onChange={(v) => setNetworkCreatorId(String(v))}
                          options={networkCreatorOptions}
                          placeholder="All"
                          searchable
                          searchPlaceholder="Search…"
                          triggerClassName="rounded-xl px-3 py-2 border-white/15 bg-black/20 text-sm text-white/90"
                          menuClassName="max-h-60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {networkCards.map((c) => (
                      <div key={c.platform} className="rounded-xl bg-black/10 border border-white/10 p-3">
                        <p className="text-white text-sm font-medium">{c.label}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Links</p>
                            <p className="text-white font-medium mt-0.5">{fmt(c.link_count)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Views</p>
                            <p className="text-white font-medium mt-0.5">{fmt(c.views)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Likes</p>
                            <p className="text-white font-medium mt-0.5">{fmt(c.likes)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Replies</p>
                            <p className="text-white font-medium mt-0.5">{fmt(c.replies)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-gray-300 text-xs">Links by platform</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(campaignPlatforms.length
                    ? campaignPlatforms
                    : (["instagram", "youtube", "tiktok", "twitter"] as DetectedHostPlatform[])
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLinkFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        linkFilter === p
                          ? "bg-[var(--color-primary)] text-black border-transparent"
                          : "bg-transparent text-white/80 border-white/15 hover:bg-white/10"
                      }`}
                      title="Apply link filter"
                    >
                      {platformLabel(p)} · {platformCounts[p]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLinkFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      linkFilter === "all"
                        ? "bg-[var(--color-primary)] text-black border-transparent"
                        : "bg-transparent text-white/80 border-white/15 hover:bg-white/10"
                    }`}
                    title="Show all links"
                  >
                    All · {platformCounts.all}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-white text-sm font-medium">Creators</p>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <div className="relative">
                      <input
                        value={creatorSearch}
                        onChange={(e) => setCreatorSearch(e.target.value)}
                        placeholder="Search creator…"
                        className="w-[220px] sm:w-[260px] h-9 rounded-lg bg-black/20 border border-white/10 text-white text-sm px-3 outline-none focus:border-white/25"
                      />
                      {creatorSearch.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCreatorSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-200 cursor-pointer"
                          aria-label="Clear search"
                          title="Clear"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="px-3 py-2 text-gray-400 font-medium">@</th>
                        <th className="px-3 py-2 text-gray-400 font-medium">Links</th>
                        <th className="px-3 py-2 text-gray-400 font-medium">Views</th>
                        <th className="px-3 py-2 text-gray-400 font-medium">Likes</th>
                        <th className="px-3 py-2 text-gray-400 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPostKols.length === 0 ? (
                        <tr className="border-b border-white/5">
                          <td colSpan={5} className="px-3 py-8 text-center text-gray-500 text-sm">
                            No creators found.
                          </td>
                        </tr>
                      ) : (
                        pagedPostKols.map((kol, idx) => {
                        const globalIdx = (safeCreatorsPage - 1) * CREATOR_PAGE_SIZE + idx;
                        const rk = kolRowKey(kol, globalIdx);
                        const links = kol.submissions?.length ?? 0;
                        const linksFiltered = countLinksForFilter(kol, linkFilter);
                        const filteredLinks =
                          linkFilter === "all"
                            ? (kol.submissions ?? [])
                            : (kol.submissions ?? []).filter((u) => detectPlatform(u) === linkFilter) ?? [];
                        return (
                          <Fragment key={rk}>
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="px-3 py-2 text-white">{kol.username ? `@${kol.username}` : "—"}</td>
                              <td className="px-3 py-2 text-gray-300">
                                {linkFilter === "all" ? fmt(kol.total_submissions) : fmt(linksFiltered)}
                                <span className="text-gray-500 text-xs"> / {fmt(kol.total_submissions)}</span>
                              </td>
                              <td className="px-3 py-2 text-gray-300">{fmt(kol.total_views)}</td>
                              <td className="px-3 py-2 text-gray-300">{fmt(kol.total_likes)}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLinksModal({
                                      username: kol.username ? `@${kol.username}` : "—",
                                      links: filteredLinks,
                                    })
                                  }
                                  className="text-[var(--color-primary)] text-xs font-medium hover:underline cursor-pointer"
                                >
                                  Links
                                  {links > 0 && <span className="text-gray-500"> ({links})</span>}
                                </button>
                              </td>
                            </tr>
                          </Fragment>
                        );
                      })
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredPostKols.length > CREATOR_PAGE_SIZE && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-white/10 bg-black/10">
                    <span className="text-xs text-gray-500">
                      Showing {(safeCreatorsPage - 1) * CREATOR_PAGE_SIZE + 1}–
                      {Math.min(safeCreatorsPage * CREATOR_PAGE_SIZE, filteredPostKols.length)} of {filteredPostKols.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCreatorsPage((p) => Math.max(1, p - 1))}
                        disabled={safeCreatorsPage <= 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-400">
                        Page {safeCreatorsPage} of {totalCreatorPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCreatorsPage((p) => Math.min(totalCreatorPages, p + 1))}
                        disabled={safeCreatorsPage >= totalCreatorPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-white font-medium">Charts · Ranking</p>
                      <p className="text-gray-500 text-xs mt-1">Compare creators by a single metric.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "views",
                          "likes",
                          "links",
                          "replies",
                          "retweets",
                          "story_views",
                          "story_likes",
                          "story_replies",
                          "story_shares",
                        ] as ChartMetric[]
                      ).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setChartMetric(m)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            chartMetric === m
                              ? "bg-[var(--color-primary)] text-black border-transparent"
                              : "bg-transparent text-white/80 border-white/15 hover:bg-white/10"
                          }`}
                        >
                          {metricLabel(m)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[280px] w-full mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rankingData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        barCategoryGap="60%"
                        barGap={8}
                        maxBarSize={56}
                      >
                        <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: chartColors.tick, fontSize: 11 }}
                          interval={0}
                          tickFormatter={(v) => (typeof v === "string" && v.length > 12 ? `${v.slice(0, 12)}…` : v)}
                        />
                        <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} width={42} />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            background: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: 12,
                            color: "white",
                          }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                          formatter={(val: any) => [Number(val ?? 0).toLocaleString("en-US"), metricLabel(chartMetric)]}
                        />
                        <Bar
                          dataKey="value"
                          name={metricLabel(chartMetric)}
                          fill={chartColors.a}
                          radius={[8, 8, 0, 0]}
                          isAnimationActive={false}
                          activeBar={false as any}
                          minPointSize={3}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-white font-medium">Charts · Compare</p>
                      <p className="text-gray-500 text-xs mt-1">Side-by-side comparison across key metrics.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                        <div className="mt-1">
                          <CustomSelect
                            options={compareCreatorOptions}
                            value={compareA}
                            onChange={(v) => setCompareA(String(v))}
                            placeholder="Select"
                            searchable
                            searchPlaceholder="Search…"
                            triggerClassName="rounded-xl px-3 py-2 border-white/15 bg-black/20 text-sm text-white/90"
                            menuClassName="max-h-60"
                          />
                        </div>
                        <div className="mt-1">
                          <CustomSelect
                            options={compareCreatorOptions}
                            value={compareB}
                            onChange={(v) => setCompareB(String(v))}
                            placeholder="Select"
                            searchable
                            searchPlaceholder="Search…"
                            triggerClassName="rounded-xl px-3 py-2 border-white/15 bg-black/20 text-sm text-white/90"
                            menuClassName="max-h-60"
                          />
                        </div>
                    </div>
                  </div>

                  {compareData.length > 0 ? (
                    <div className="h-[320px] w-full mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={compareData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                          barCategoryGap="35%"
                          barGap={6}
                          maxBarSize={28}
                        >
                          <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
                          <XAxis
                            dataKey="metric"
                            tick={{ fill: chartColors.tick, fontSize: 11 }}
                            interval={0}
                            tickFormatter={(v) => (typeof v === "string" && v.length > 12 ? `${v.slice(0, 12)}…` : v)}
                          />
                          <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} width={42} />
                          <Tooltip
                            cursor={false}
                            contentStyle={{
                              background: chartColors.tooltipBg,
                              border: `1px solid ${chartColors.tooltipBorder}`,
                              borderRadius: 12,
                              color: "white",
                            }}
                            labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                            formatter={(val: any, name: any, ctx: any) => {
                              const aName = ctx?.payload?.aName ?? "A";
                              const bName = ctx?.payload?.bName ?? "B";
                              if (name === "a") return [Number(val ?? 0).toLocaleString("en-US"), aName];
                              if (name === "b") return [Number(val ?? 0).toLocaleString("en-US"), bName];
                              return [Number(val ?? 0).toLocaleString("en-US"), String(name)];
                            }}
                          />
                          <Legend
                            formatter={(value: any, entry: any) => {
                              const payload: any = entry?.payload;
                              const anyRow = compareData[0] as any;
                              if (payload?.dataKey === "a") return anyRow?.aName ?? "A";
                              if (payload?.dataKey === "b") return anyRow?.bName ?? "B";
                              return value;
                            }}
                          />
                          <Bar
                            dataKey="a"
                            fill={chartColors.a}
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={false}
                            activeBar={false as any}
                            minPointSize={3}
                          />
                          <Bar
                            dataKey="b"
                            fill={chartColors.b}
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={false}
                            activeBar={false as any}
                            minPointSize={3}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs mt-3">Select two creators to compare.</p>
                  )}
                </div>
              </div>

              {data.post_kols.length === 0 && (
                <p className="text-gray-500 text-sm">No participants yet.</p>
              )}
            </div>
          )}

          {linksModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                onClick={closeLinksModal}
              />
              <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
                  <p className="text-white font-semibold">Submission — {linksModal.username}</p>
                  <button
                    type="button"
                    onClick={closeLinksModal}
                    className="text-gray-400 hover:text-gray-200 cursor-pointer"
                    aria-label="Close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-5">
                  <p className="text-gray-400 text-sm">Submission links</p>

                  <div className="mt-3 space-y-2">
                    {(() => {
                      const items: Array<{ label: string; url: string }> = [];
                      for (const url of linksModal.links) {
                        const p = detectPlatform(url);
                        const label =
                          p === "twitter"
                            ? "Twitter"
                            : p === "instagram"
                              ? "Instagram"
                              : p === "youtube"
                                ? "YouTube"
                                : p === "tiktok"
                                  ? "TikTok"
                                  : "Link";
                        items.push({ label, url });
                      }

                      if (!items.length) {
                        return <p className="text-gray-500 text-sm mt-2">No links for this filter.</p>;
                      }

                      return items.map((it, i) => (
                        <div key={`${it.url}-${i}`} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-400 w-[86px] shrink-0">{it.label}:</span>
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/90 hover:underline break-all cursor-pointer"
                          >
                            {it.url}
                          </a>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={closeLinksModal}
                      className="w-full rounded-full border border-white/15 bg-black/10 hover:bg-white/10 text-white py-3 font-medium cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
