"use client";

import { useRouter, usePathname } from "next/navigation";
import { CampaignPublic } from "@/lib/api/host";
import { useAuth } from "@/lib/contexts/AuthContext";
import Image from "next/image";
import { renderMarkdown } from "@/utils/markdown";

const CATEGORY_LABELS: Record<string, string> = {
  defi: "DeFi",
  game: "Game",
  rwa: "RWA",
  nft: "NFT",
  social: "Social",
  dao: "DAO",
  staking: "Staking",
  gamefi: "GameFi",
  other: "Other",
};

const TOKEN_LOGOS: Record<string, string> = {
  usdc:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  usdt:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  usde:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3/logo.png",
};

import React from "react";

export default React.memo(function CampaignCard({
  campaign,
}: {
  campaign: CampaignPublic;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isHostContext = pathname?.startsWith("/host");
  const formattedCategories =
    campaign.content_categories
      ?.map((cat) => {
        const slug = cat.slug || "";
        const normalized = slug.toLowerCase();

        if (CATEGORY_LABELS[normalized]) {
          return CATEGORY_LABELS[normalized];
        }

        if (slug.length <= 3) {
          return slug.toUpperCase();
        }

        return slug.charAt(0).toUpperCase() + slug.slice(1);
      })
      .join(", ") || "N/A";

  const deadlineLabel = (() => {
    const details = campaign.deadline_detailed;

    if (!details) {
      // Alguns endpoints (ex.: campanhas via comunidades) não retornam deadline_detailed.
      // Fazemos fallback para `end_date` quando disponível.
      const rawEnd = (campaign as any)?.end_date;
      if (typeof rawEnd === "string" && rawEnd.trim()) {
        const end = new Date(rawEnd);
        if (!Number.isNaN(end.getTime())) {
          const diffMs = end.getTime() - Date.now();
          if (diffMs <= 0) return "Expired";
          const totalMinutes = Math.floor(diffMs / (1000 * 60));
          const days = Math.floor(totalMinutes / (60 * 24));
          const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
          const minutes = Math.max(0, totalMinutes - days * 24 * 60 - hours * 60);
          if (days === 0 && hours === 0 && totalMinutes > 0) return `${totalMinutes}m`;
          return `${days}d ${hours}h ${minutes}m`;
        }
      }
      return "No deadline";
    }

    if (details.is_expired) {
      return "Expired";
    }

    const hasNumbers =
      typeof details.days === "number" && typeof details.hours === "number";

    if (hasNumbers) {
      if (
        details.days === 0 &&
        details.hours === 0 &&
        typeof details.total_minutes === "number" &&
        details.minutes > 0
      ) {
        return `${details.total_minutes}m`;
      }

      return `${details.days}d ${details.hours}h ${details.minutes}m`;
    }

    return "Pending Activation";
  })();

  const handleCardClick = () => {
    if (isHostContext) {
      router.push(`/host/campaign/${campaign.id}`);
    } else if (isAuthenticated) {
      router.push(`/creator/campaign/${campaign.id}`);
    } else {
      router.push(`/campaigns/${campaign.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[var(--color-card)] rounded-3xl cursor-pointer p-6 flex flex-col h-full min-h-[280px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {campaign.logo_company && (
            <img
              src={campaign.logo_company}
              alt="Company logo"
              className="w-6 h-6 rounded object-cover"
            />
          )}
          {campaign.name_company && (
            <span className="text-white font-medium text-sm">
              {campaign.name_company}
            </span>
          )}
          {campaign.name_company && campaign.country && campaign.country.length > 0 && (
            <span className="text-gray-500">|</span>
          )}
          {campaign.country && campaign.country.length > 0 ? (
            campaign.country.map((c, index) => {
              const countryName = c.name.toLowerCase();
              const isBrazil = countryName === "brazil" || countryName === "brasil";
              const isGlobal = countryName === "global" || countryName === "latam";

              return (
                <div key={index} className="flex items-center gap-1">
                  {isBrazil && (
                    <svg
                      className="w-5 h-4"
                      viewBox="0 0 20 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="20" height="14" fill="#009739" />
                      <path
                        d="M10 1.5L3.5 7L10 12.5L16.5 7L10 1.5Z"
                        fill="#FEDD00"
                      />
                      <circle cx="10" cy="7" r="2.8" fill="#012169" />
                      <path
                        d="M10 5.2L9 6.5L10 7.8L11 6.5L10 5.2Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  )}
                  {isGlobal && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span className="text-white font-medium text-sm">
                    {c.name.charAt(0).toUpperCase() +
                      c.name.slice(1).toLowerCase()}
                  </span>
                  {index < (campaign.country?.length ?? 0) - 1 && (
                    <span className="text-white">,</span>
                  )}
                </div>
              );
            })
          ) : (
            <span className="text-white/50 text-sm">-</span>
          )}
        </div>
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            campaign.status === "active"
              ? "bg-green-500"
              : campaign.status === "completed"
              ? "bg-red-500"
              : campaign.status === "waiting payment"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }`}
        ></div>
      </div>
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg md:text-xl leading-tight break-words">
          {campaign.title}
        </h3>
      </div>

      <div className="text-white font-medium mb-4 line-clamp-3 flex-grow text-sm md:text-base">
        {renderMarkdown(
          (campaign.about_project?.length ?? 0) > 150
            ? `${campaign.about_project!.substring(0, 150)}...`
            : (campaign.about_project ?? '')
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-300 flex-wrap">
        {/* <div className="flex items-center gap-1 bg-[#26485E] px-3 py-1 rounded-full max-w-none whitespace-nowrap">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="whitespace-nowrap">
            {campaign.total_submissions} submission (s)
          </span>
        </div> */}
        <div className="flex items-center justify-center gap-1 bg-[#26485E] px-3 py-1 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>

          <span className="text-center">{deadlineLabel}</span>
        </div>
        <div className="flex items-center gap-1 bg-[#26485E] px-3 py-1 rounded-full">
          {formattedCategories}
        </div>
      </div>

      <div
        className={`flex items-center mt-auto ${
          isAuthenticated && !isHostContext ? "justify-between" : "justify-end"
        }`}
      >
        {isAuthenticated && !isHostContext && !campaign.deadline_detailed?.is_expired && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/creator/campaign/${campaign.id}`);
            }}
            className="bg-white text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
            style={{ cursor: "pointer" }}
          >
            SUBMISSION
          </button>
        )}
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <Image
            src={
              TOKEN_LOGOS[
                campaign.payment_token?.toLowerCase() ?? "usdc"
              ] ?? TOKEN_LOGOS.usdc
            }
            alt={campaign.payment_token?.toUpperCase() ?? "USDC"}
            width={16}
            height={16}
            className="rounded-full"
            unoptimized
          />
          {campaign.isPrivate && !campaign.is_cac
            ? (campaign.user_amount ?? campaign.total_prize_pool)
            : campaign.total_prize_pool}{" "}
          {campaign.payment_token?.toUpperCase() ?? "USDC"}
        </div>
      </div>
    </div>
  );
});
