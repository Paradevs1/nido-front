"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { Campaign } from "@/lib/api/campaign";
import dynamic from "next/dynamic";
const SubmissionModal = dynamic(() => import("@/components/auth/SubmissionModal"), { ssr: false });
const PrivateSubmissionModal = dynamic(() => import("@/components/auth/PrivateSubmissionModal"), { ssr: false });
import { useAuth } from "@/lib/contexts/AuthContext";

interface CampaignSubmissionProps {
  campaignId: string;
  campaign: Campaign;
  hasUserSubmitted?: boolean;
}

export default function CampaignSubmission({
  campaignId,
  campaign,
  hasUserSubmitted,
}: CampaignSubmissionProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(!!hasUserSubmitted);
  
  const isCreatorContext = pathname?.startsWith('/creator');

  useEffect(() => {
    setSubmitted(!!hasUserSubmitted);
  }, [hasUserSubmitted]);

  const handleSubmissionClick = () => {
    // Permitir sempre abrir o modal para editar/adicionar links
    setIsSubmissionModalOpen(true);
  };

  return (
    <>
      <div className="bg-transparent">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xl font-bold text-white text-center">
                {campaign?.total_submissions ?? 0}
              </p>
            </div>
            <p className="text-xs text-gray-400 uppercase text-center">
              Submission(s)
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xl font-bold text-white text-center">
                {campaign.deadline_detailed.is_expired
                  ? "Expired"
                  : campaign.deadline_detailed.days === 0 &&
                    campaign.deadline_detailed.hours === 0 &&
                    campaign.deadline_detailed.total_minutes > 0
                  ? `${campaign.deadline_detailed.total_minutes}m`
                  : `${campaign.deadline_detailed.days}d ${campaign.deadline_detailed.hours}h ${campaign.deadline_detailed.minutes}m`}
              </p>
            </div>
            <p className="text-xs text-gray-400 uppercase text-center">
              Deadline
            </p>
          </div>
        </div>
        {isCreatorContext && isAuthenticated && !campaign.deadline_detailed?.is_expired && (
          <Button
            className="w-full py-3 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmissionClick}
            disabled={
              campaign.status === "completed" ||
              campaign.status === "waiting payment" ||
              (submitted && !campaign.isPrivate)
            }
          >
            {campaign.status === "completed" || campaign.status === "waiting payment"
              ? "CAMPAIGN FINISHED"
              : submitted && campaign.isPrivate
              ? "EDIT SUBMISSION"
              : submitted && !campaign.isPrivate
              ? "SUBMITTED"
              : "SUBMIT NOW"}
          </Button>
        )}
      </div>

      {/* Submission Modal - Use different modal based on campaign type */}
      {campaign.isPrivate ? (
        <PrivateSubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          campaign={campaign}
          onSubmitted={() => setSubmitted(true)}
        />
      ) : (
        <SubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          campaign={campaign}
          onSubmitted={() => setSubmitted(true)}
        />
      )}
    </>
  );
}
