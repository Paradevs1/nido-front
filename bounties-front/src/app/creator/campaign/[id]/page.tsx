"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { campaignApi, Campaign } from "@/lib/api/campaign";
import { creatorApi } from "@/lib/api/creator";
import { listMyCommunities } from "@/lib/api/community";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  CampaignDetails,
  CampaignComments,
  CampaignPrizes,
  CampaignSubmission,
  CampaignAccordion,
  CampaignWinners,
  WinnersRank,
  ShortUrlSection,
  ShortUrlSectionKols,
} from "@/components/campaigns/detail";
import StellarEscrowTalentView from "@/components/stellar/StellarEscrowTalentView";

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string>("");
  const [hasUserSubmitted, setHasUserSubmitted] = useState<boolean>(false);
  const [communityBlocked, setCommunityBlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"campaign" | "winners">(
    "campaign"
  );

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setCampaignId(id);

        setLoading(true);
        setError(null);
        const response = await campaignApi.getCampaignById(id);
        const camp = response.campaign;
        setCampaign(camp);

        if (camp.community_id) {
          try {
            const mineRes = await listMyCommunities();
            const isMember = mineRes.data.some(
              (c) => c.id === camp.community_id
            );
            if (!isMember) {
              setCommunityBlocked(true);
              return;
            }
          } catch {
            setCommunityBlocked(true);
            return;
          }
        }

        try {
          const validated = await creatorApi.validateSubmissionCampaign(id);
          setHasUserSubmitted(Boolean(validated));
        } catch (e) {}
      } catch (err: unknown) {
        setError("Error loading campaign");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params]);

  const accordionItems = [
    {
      title: "Winners",
      content: "The winners will be selected after the deadline.",
    },
    {
      title: "Payments",
      content:
        "Payments will be made after the content has been evaluated and the campaign has been completed.",
    },
  ];

  if (loading) {
    return (
      <div className="relative overflow-x-hidden w-full min-h-screen">
        <div className="min-h-screen text-[var(--color-text)] pb-20 pt-28">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
              <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="h-12 w-96 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="h-96 bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-64 bg-gray-700 rounded-2xl animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-48 bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-gray-700 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (communityBlocked) {
    return (
      <div className="relative overflow-x-hidden w-full min-h-screen">
        <div className="min-h-screen text-[var(--color-text)] pb-20 pt-28 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-400 mb-4">
              This campaign is exclusive to community members. Join the community to access it.
            </p>
            <button
              onClick={() => router.push("/creator/communities")}
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Explore Communities
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="relative overflow-x-hidden w-full min-h-screen">
        <div className="min-h-screen text-[var(--color-text)] pb-20 pt-28 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-4">
              Error loading campaign
            </h2>
            <p className="text-gray-400 mb-4">
              {error || "Campaign not found"}
            </p>
            <button
              onClick={() => router.push("/creator/campaign")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canShowWinnersRank =
    !campaign.isPrivate && campaign.status === "completed";

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <div className="min-h-screen text-[var(--color-text)] pb-20 pt-28">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span
                className="cursor-pointer"
                onClick={() => router.push("/creator/campaign")}
              >
                Campaigns
              </span>
              <span>&gt;</span>
              <span className="text-white">{campaign.title}</span>
            </div>

            {/* Host info line: logo_company | host_username | status | country | host_categories_atuation */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {campaign.logo_company && (
                <>
                  <img
                    src={campaign.logo_company}
                    alt="Company logo"
                    className="w-6 h-6 rounded object-cover"
                  />
                </>
              )}
              {campaign.host_username && (
                <>
                  <span className="text-white font-medium">
                    {campaign.host_username}
                  </span>
                  <span className="text-gray-500">|</span>
                </>
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    campaign.status === "active" || campaign.status === "open"
                      ? "bg-green-500"
                      : campaign.status === "completed"
                      ? "bg-red-500"
                      : campaign.status === "waiting payment"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-white text-sm">
                  {campaign.status === "active" || campaign.status === "open"
                    ? "Open"
                    : campaign.status === "completed"
                    ? "Finished"
                    : campaign.status === "inactive"
                    ? "Inactive"
                    : campaign.status === "cancelled"
                    ? "Cancelled"
                    : campaign.status === "waiting payment"
                    ? "Waiting Payment"
                    : campaign.status}
                </span>
              </div>
              {campaign.country && campaign.country.length > 0 && (
                <>
                  <span className="text-gray-500">|</span>
                  <div className="flex items-center gap-2">
                    {campaign.country.map((c, index) => {
                      const countryName = c.name.toLowerCase();
                      const isBrazil =
                        countryName === "brazil" || countryName === "brasil";
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
                          <span className="text-white font-medium">
                            {c.name.charAt(0).toUpperCase() +
                              c.name.slice(1).toLowerCase()}
                          </span>
                          {index < campaign.country.length - 1 && (
                            <span className="text-white">,</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {campaign.host_categories_atuation &&
                campaign.host_categories_atuation.length > 0 && (
                  <>
                    <span className="text-gray-500">|</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {campaign.host_categories_atuation.map((cat, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                          {cat.slug}
                        </span>
                      ))}
                    </div>
                  </>
                )}
            </div>

            <h1 className="text-4xl font-bold text-white">{campaign.title}</h1>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("campaign")}
              className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border transition-all ${
                activeTab === "campaign"
                  ? "bg-[var(--color-card)]"
                  : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
              }`}
            >
              Campaign
            </button>

            {canShowWinnersRank && (
              <button
                onClick={() => setActiveTab("winners")}
                className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border transition-all ${
                  activeTab === "winners"
                    ? "bg-[var(--color-card)] border-[#ff5701]"
                    : "bg-transparent border-[#ff5701] hover:bg-[var(--color-card)]"
                }`}
              >
                Winners Rank
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "campaign" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="order-1 lg:order-1 lg:col-span-2 space-y-10">
                <CampaignDetails campaignId={campaignId} campaign={campaign} />
              </div>

              <div className="relative order-2 lg:order-2 space-y-6">
                <div
                  className="absolute left-0 top-0 w-px bg-gray-700 -ml-6 hidden lg:block"
                  style={{ height: "calc(140vh - 350px)" }}
                ></div>

                <CampaignPrizes campaignId={campaignId} campaign={campaign} />

                {/* Stellar Escrow — visível apenas para campanhas com payment_chain="stellar" */}
                {campaign.payment_chain === "stellar" && (
                  <StellarEscrowTalentView
                    campaignId={campaignId}
                    talentAmount={undefined}
                  />
                )}

                <CampaignSubmission
                  campaignId={campaignId}
                  campaign={campaign}
                  hasUserSubmitted={hasUserSubmitted}
                />

                {(() => {
                  const subTypes = campaign.submission_format?.map((s) => s.type?.toLowerCase()) ?? [];
                  const contentTypes = campaign.content_format?.map((c) => c.type?.toLowerCase()) ?? [];
                  const isFeedbackOnly =
                    subTypes.length === 1 && subTypes[0] === "feedback" &&
                    contentTypes.length === 1 && contentTypes[0] === "feedback";
                  if (isFeedbackOnly) return null;
                  return campaign.isPrivate ? (
                    <ShortUrlSectionKols campaignId={campaignId} campaignStatus={campaign.status} />
                  ) : (
                    <ShortUrlSection campaignId={campaignId} originalUrlShortener={campaign.original_url_shortener} campaignStatus={campaign.status} />
                  );
                })()}

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">FAQ</h3>
                  <CampaignAccordion items={accordionItems} />
                </div>
              </div>

              <div className="order-3 lg:order-3 lg:col-span-2 space-y-10">
                <CampaignComments campaign={campaign} />
              </div>
            </div>
          )}

          {canShowWinnersRank && activeTab === "winners" && (
            <div className="w-full mx-auto">
              <WinnersRank campaignId={campaignId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
