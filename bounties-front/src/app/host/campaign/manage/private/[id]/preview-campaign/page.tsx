"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { campaignApi, Campaign } from "@/lib/api/campaign";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  CampaignDetails,
  CampaignPrizes,
  CampaignSubmission,
  CampaignAccordion,
} from "@/components/campaigns/detail";

interface PreviewCampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PreviewPrivateCampaignPage({
  params,
}: PreviewCampaignPageProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string>("");

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setCampaignId(id);

        setLoading(true);
        setError(null);
        const response = await campaignApi.getCampaignById(id);
        setCampaign(response.campaign);
      } catch (_err: unknown) {
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
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen text-[var(--color-text)] pb-20 pt-28 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">
            Error loading campaign
          </h2>
          <p className="text-gray-400 mb-4">{error || "Campaign not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Campaigns", href: "/host/campaign" },
    { label: "Manage Campaigns", href: "/host/campaign/manage" },
    {
      label: campaign.title,
      href: `/host/campaign/manage/private/${campaignId}`,
    },
    { label: "Preview", isCurrent: true },
  ];

  return (
    <div className="text-[var(--color-text)] pb-20 pt-28">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            className="px-6 py-2 font-semibold text-sm text-bold flex items-center gap-2 cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 18L5 12L11 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Button>
        </div>

        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />

          {/* Host info line: logo_company | host_username | status | country | host_categories_atuation */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {campaign.logo_company && (
              <img
                src={campaign.logo_company}
                alt="Company logo"
                className="w-6 h-6 rounded object-cover"
              />
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
                              display="block"
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

            <CampaignSubmission
              campaignId={campaignId}
              campaign={campaign}
              hasUserSubmitted={false}
            />

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">FAQ</h3>
              <CampaignAccordion items={accordionItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

