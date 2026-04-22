"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DynamicLayout } from "@/components/layout";
import CustomSelect from "@/components/ui/CustomSelect";
import Button from "@/components/ui/Button";
import { creatorApi, CampaignShortUrlsResponse } from "@/lib/api/creator";
import { campaignApi, Campaign } from "@/lib/api/campaign";
import { FiExternalLink } from "react-icons/fi";

export default function ViewShortenerPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [shortUrls, setShortUrls] = useState<CampaignShortUrlsResponse[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingShortUrls, setIsLoadingShortUrls] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true);
        const response = await campaignApi.getAllCampaigns({ page: 1, limit: 100 });
        setCampaigns(response.campaigns || []);
      } catch (err: unknown) {
        setError(err.message || "Error loading campaigns");
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchShortUrls = async () => {
      if (!selectedCampaignId) {
        setShortUrls([]);
        return;
      }

      try {
        setIsLoadingShortUrls(true);
        setError(null);
        const response = await creatorApi.getCampaignShortUrls(selectedCampaignId);
        setShortUrls(response);
      } catch (err: unknown) {
        setError(err.message || "Error loading shortened URLs");
        setShortUrls([]);
      } finally {
        setIsLoadingShortUrls(false);
      }
    };

    fetchShortUrls();
  }, [selectedCampaignId]);

  const campaignOptions = useMemo(() => {
    return [
      ...campaigns.map((campaign) => ({
        value: campaign.id,
        label: campaign.title,
      })),
    ];
  }, [campaigns]);

  const filteredShortUrls = useMemo(() => {
    return [...shortUrls].sort((a, b) => b.clicks - a.clicks);
  }, [shortUrls]);

  return (
    <DynamicLayout hideNavbar>
      <div className="min-h-screen pt-24">
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="space-y-6">
            {/* Botão Back */}
            <div className="mb-4">
              <Link href="/">
                <Button
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
              </Link>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                View Shortened URLs
              </h1>
              <p className="text-gray-400">
                View and manage shortened URLs from campaigns
              </p>
            </div>

            {/* Filtro por campanha */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6">
              <div className="space-y-4">
                <label className="block text-white font-medium">
                  Filter by Campaign
                </label>
                <CustomSelect
                  id="campaign-filter"
                  options={campaignOptions}
                  value={selectedCampaignId}
                  onChange={(value) => setSelectedCampaignId(value as string)}
                  placeholder="Select a campaign"
                  disabled={isLoadingCampaigns}
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Grid/Tabela */}
            <div className="bg-[var(--color-card)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                        Campaign
                      </th>
                      <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                        User
                      </th>
                      <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                        Clicks
                      </th>
                      <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingShortUrls ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-400"
                        >
                          Loading shortened URLs...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : filteredShortUrls.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-400"
                        >
                          {selectedCampaignId
                            ? "No shortened URLs found for this campaign"
                            : "Select a campaign to view shortened URLs"}
                        </td>
                      </tr>
                    ) : (
                      filteredShortUrls.map((url, index) => (
                        <tr
                          key={`${url.shortURL}-${index}`}
                          className={`${
                            index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                          } border-b border-white/5 hover:bg-white/10 transition-colors`}
                        >
                          <td className="py-4 px-6 text-gray-300">
                            {url.campaignTitle}
                          </td>
                          <td className="py-4 px-6 text-white">
                            {url.username}
                          </td>
                          <td className="py-4 px-6 text-white font-medium">
                            {url.clicks.toLocaleString("en-US")}
                          </td>
                          <td className="py-4 px-6">
                            <a
                              href={url.shortURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-white hover:text-[var(--color-primary)] transition-colors"
                            >
                              <span className="truncate max-w-xs">
                                {url.shortURL}
                              </span>
                              <FiExternalLink className="flex-shrink-0" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DynamicLayout>
  );
}

