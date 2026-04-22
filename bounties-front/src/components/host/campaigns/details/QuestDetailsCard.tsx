"use client";

import { useState } from "react";
import { FiExternalLink, FiCalendar } from "react-icons/fi";
import { CampaignDetails } from "@/lib/api/host";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";
import { renderMarkdown } from "@/utils/markdown";

interface QuestDetailsCardProps {
  campaign: CampaignDetails;
  onCampaignUpdate?: (updatedCampaign: CampaignDetails) => void;
  isPrivate?: boolean;
}

export default function QuestDetailsCard({
  campaign,
  onCampaignUpdate,
  isPrivate = false,
}: QuestDetailsCardProps) {
  const router = useRouter();
  const startDate = new Date(campaign.start_date);
  const endDate = new Date(campaign.end_date);

  const formattedStartDate = isValid(startDate)
    ? format(startDate, "MMM dd, yyyy")
    : "N/A";
  const formattedEndDate = isValid(endDate)
    ? format(endDate, "MMM dd, yyyy")
    : "N/A";

  const isEmpty = (value: string | null | undefined): boolean => {
    return !value || value.trim() === "";
  };

  const canEdit = campaign.status === "inactive";

  return (
    <>
      <div className="bg-[var(--color-card)] rounded-2xl p-6 h-full relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Quest Details</h2>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() =>
                router.push(
                  isPrivate
                    ? `/host/campaign/manage/private/${campaign.id}/preview-campaign`
                    : `/host/campaign/manage/${campaign.id}/preview-campaign`
                )
              }
              className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              title="Preview Campaign"
            >
              <FiExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">Preview Campaign</span>
            </button>
            {canEdit && onCampaignUpdate && (
              <button
                onClick={() =>
                  router.push(
                    isPrivate
                      ? `/host/campaign/manage/private/${campaign.id}/edit`
                      : `/host/campaign/manage/${campaign.id}/edit`
                  )
                }
                className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                title="Edit Campaign"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-sm font-medium">Edit Campaign</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-white/10 mb-6"></div>

        <div className="space-y-6">
          {!isEmpty(campaign.title) && (
            <div>
              <h3 className="text-xs text-gray-400 font-medium uppercase mb-1">
                Campaign Name
              </h3>
              <p className="text-white">{campaign.title}</p>
            </div>
          )}
          {!isEmpty(campaign.about_project) && (
            <div>
              <h3 className="text-xs text-gray-400 font-medium uppercase mb-1">
                Description
              </h3>
              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                {renderMarkdown(campaign.about_project)}
              </div>
            </div>
          )}
          {!isEmpty(campaign.target_blockchain) && (
            <div>
              <h3 className="text-xs text-gray-400 font-medium uppercase mb-1">
                Chain
              </h3>
              <p className="text-white flex items-center gap-2 capitalize">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {campaign.target_blockchain}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-xs text-gray-400 font-medium uppercase mb-2">
              Duration
            </h3>
            <p className="inline-flex items-center gap-2 text-sm text-gray-300 border border-white rounded-full px-3 py-1">
              <FiCalendar />
              <span>
                {formattedStartDate} - {formattedEndDate}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
