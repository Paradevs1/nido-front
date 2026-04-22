"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CommunityCampaign, listCommunityCampaigns } from "@/lib/api/community";
import CampaignCard from "@/components/home/CampaignCard";
import { CampaignPublic } from "@/lib/api/host";
import BaseButton from "@/components/ui/Button";

const TOKEN_LOGOS: Record<string, string> = {
  usdc: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  usdt: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  usde: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3/logo.png",
};

const CHAIN_ICONS: Record<string, string> = {
  ethereum: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png",
  base: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/base/info/logo.png",
  arbitrum: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/arbitrum/info/logo.png",
  berachain: "/assets/chains/berachain.png",
  bsc: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/smartchain/info/logo.png",
  hyperevm: "/assets/chains/hyperevm.png",
  polygon: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/polygon/info/logo.png",
  solana: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
  sui: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/sui/info/logo.png",
};

interface CommunityCampaignsProps {
  communityId: string;
  showMetrics: boolean;
  /** Allow creating campaigns (Host only) */
  canCreate?: boolean;
  /** Disable click navigation on campaign cards (Admin) */
  disableClick?: boolean;
  /** Show as table instead of cards (Host/Admin) */
  viewMode?: "card" | "table";
  /** Campaigns preloaded from community detail */
  initialCampaigns?: CommunityCampaign[];
}

/** Map CommunityCampaign to CampaignPublic for CampaignCard */
function toCampaignPublic(c: CommunityCampaign): CampaignPublic {
  return {
    id: c._id || c.id || "",
    title: c.title,
    about_project: (c.about_project as string) || "",
    status: (c.status as CampaignPublic["status"]) || "active",
    total_prize_pool: c.total_prize_pool || 0,
    deadline: 0,
    start_date: c.start_date || "",
    end_date: c.end_date || "",
    content_categories: (c.content_categories as any) || [],
    total_submissions: (c.total_submissions as number) || 0,
    payment_token: (c.payment_token as string) || "USDC",
    country: (c.country as any) || [],
    host_username: (c.host_username as string) || undefined,
    name_company: (c.name_company as string) || undefined,
    logo_company: (c.logo_company as string) || undefined,
    deadline_detailed: (c.deadline_detailed as any) || undefined,
  };
}

export default function CommunityCampaigns({
  communityId,
  showMetrics,
  canCreate,
  disableClick,
  viewMode = "card",
  initialCampaigns,
}: CommunityCampaignsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<CommunityCampaign[]>(initialCampaigns || []);
  const [loading, setLoading] = useState(!initialCampaigns);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (initialCampaigns) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await listCommunityCampaigns(communityId, { page, limit: 10 });
        setCampaigns(res.campaigns);
        setTotalPages(res.totalPages);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [communityId, page, initialCampaigns]);

  const getCampaignHref = (id: string) => {
    if (pathname?.startsWith("/host")) return `/host/campaign/${id}`;
    if (pathname?.startsWith("/creator")) return `/creator/campaign/${id}`;
    return `/campaigns/${id}`;
  };

  if (loading) {
    return viewMode === "table" ? (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg h-14 animate-pulse" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--color-card)] rounded-3xl p-6 animate-pulse h-[280px]" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto text-white/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
        <p className="text-white/40 text-sm mb-4">No campaigns yet</p>
        {canCreate && (
          <BaseButton
            onClick={() => router.push(`/host/communities/${communityId}/create-campaign`)}
            variant="default"
            className="px-5 py-2.5 text-sm font-semibold cursor-pointer"
          >
            + Create Campaign
          </BaseButton>
        )}
      </div>
    );
  }

  return (
    <div>
      {canCreate && (
        <BaseButton
          onClick={() => router.push(`/host/communities/${communityId}/create-campaign`)}
          variant="default"
          className="mb-6 px-5 py-2.5 text-sm font-semibold cursor-pointer"
        >
          + Create Campaign
        </BaseButton>
      )}

      {viewMode === "table" ? (
        /* ---- TABLE VIEW (Host / Admin) ---- */
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Campaign</th>
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Status</th>
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Chain</th>
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Prize</th>
                {showMetrics && (
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Submissions</th>
                )}
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3">Period</th>
                <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:px-4 sm:py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const id = c._id || c.id || "";
                return (
                  <tr
                    key={id}
                    className="border-b border-white/5"
                  >
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white text-sm font-medium">
                        {c.title}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === "active"
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : c.status === "completed"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          : c.status === "waiting payment"
                          ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                          : c.status === "inactive"
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-white/10 text-white/50 border border-white/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          c.status === "active" ? "bg-green-400" :
                          c.status === "completed" ? "bg-blue-400" :
                          c.status === "waiting payment" ? "bg-yellow-400" :
                          c.status === "inactive" ? "bg-red-400" : "bg-white/50"
                        }`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      {(() => {
                        const chain = ((c.payment_chain as string) || (c.target_blockchain as string) || "").toLowerCase();
                        return chain ? (
                          <span className="text-white/60 text-sm flex items-center gap-1.5 capitalize">
                            <img
                              src={CHAIN_ICONS[chain] || CHAIN_ICONS.ethereum}
                              alt={chain}
                              className="w-4 h-4 rounded-full"
                            />
                            {chain}
                          </span>
                        ) : <span className="text-white/40 text-sm">-</span>;
                      })()}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white/60 text-sm flex items-center gap-1.5">
                        <img
                          src={TOKEN_LOGOS[((c.payment_token as string) || "usdc").toLowerCase()] || TOKEN_LOGOS.usdc}
                          alt={(c.payment_token as string) || "USDC"}
                          className="w-4 h-4 rounded-full"
                        />
                        {c.total_prize_pool} {((c.payment_token as string) || "USDC").toUpperCase()}
                      </span>
                    </td>
                    {showMetrics && (
                      <td className="py-2 px-2 sm:py-3 sm:px-4">
                        <span className="text-white/60 text-sm">
                          {(c.total_submissions as number) ?? 0}
                        </span>
                      </td>
                    )}
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white/40 text-xs">
                        {c.start_date ? new Date(c.start_date).toLocaleString([], { dateStyle: "short", timeStyle: "short" }).replace(",", "") : "-"}
                        {" — "}
                        {c.end_date ? new Date(c.end_date).toLocaleString([], { dateStyle: "short", timeStyle: "short" }).replace(",", "") : "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!disableClick && c.status === "inactive" && (
                          <button
                            onClick={() => router.push(`/host/campaign/manage/${id}?from=community`)}
                            className="cursor-pointer px-3 py-1 text-xs text-white bg-[var(--color-primary)]/80 rounded-lg hover:bg-[var(--color-primary)] transition-colors"
                          >
                            Make Payment
                          </button>
                        )}
                        {!disableClick && c.status !== "inactive" && (
                          <button
                            onClick={() => router.push(getCampaignHref(id))}
                            className="cursor-pointer px-3 py-1 text-xs text-white/60 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ---- CARD VIEW (Creator) ---- */
        <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 ${disableClick ? "pointer-events-none" : ""}`}>
          {campaigns.map((c) => (
            <CampaignCard key={c._id || c.id || ""} campaign={toCampaignPublic(c)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer px-4 py-3 sm:py-2 text-sm text-white/60 bg-white/5 rounded-lg disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-white/40 text-sm self-center">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer px-4 py-3 sm:py-2 text-sm text-white/60 bg-white/5 rounded-lg disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
