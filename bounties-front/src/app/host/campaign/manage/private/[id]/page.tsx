"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import QuestDetailsCard from "@/components/host/campaigns/details/QuestDetailsCard";
import PaymentDetailsCard from "@/components/host/campaigns/details/PaymentDetailsCard";
import { getCampaignById, CampaignDetails, deleteCampaign } from "@/lib/api/host";
import type { KolReward } from "@/components/host/campaigns/types";
import { FiTrash2, FiDollarSign, FiCheck } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import Button from "@/components/ui/Button";
import HostCampaignMetricsPanel from "@/components/host/campaigns/details/HostCampaignMetricsPanel";
import { BRAND_SITE_URL } from "@/lib/branding/links";

const MakePaymentsKolsSelectiveModal = lazy(() => import("@/components/host/campaigns/details/MakePaymentsKolsSelectiveModal"));
const CampaignSubmissionsTable = lazy(() => import("@/components/host/campaigns/details/CampaignSubmissionsTable"));

export default function ManagePrivateCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkCopiedSection, setLinkCopiedSection] = useState<"overview" | "submissions" | null>(null);
  const [activeTab, setActiveTab] = useState<"submissions" | "analytics">("submissions");

  const creatorLink = campaign
    ? `${BRAND_SITE_URL}/creator/campaign/${campaign.id}`
    : "";
  const handleCopyLink = (section: "overview" | "submissions") => {
    if (!creatorLink) return;
    navigator.clipboard?.writeText(creatorLink).then(() => {
      setLinkCopiedSection(section);
      setTimeout(() => setLinkCopiedSection(null), 2000);
    });
  };

  useEffect(() => {
    if (id) {
      const fetchCampaignDetails = async () => {
        try {
          setIsLoading(true);
          const response = await getCampaignById(id);
          setCampaign(response.campaign);
          setError(null);
        } catch (err: unknown) {
          setError(err.message || "Failed to load campaign details");
          setCampaign(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaignDetails();
    }
  }, [id]);

  const status = campaign?.status;
  const isCampaignInactive = status === "inactive";
  const handleCampaignUpdate = (updatedCampaign: CampaignDetails) => {
    setCampaign(updatedCampaign);
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsDeleting(true);
      await deleteCampaign(campaign.id);
      router.push("/host/campaign/manage");
    } catch (err: unknown) {
      setError(err.message || "Failed to delete campaign");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const breadcrumbItems = [
    { label: "Campaigns", href: "/host/campaign" },
    { label: "Manage Campaigns", href: "/host/campaign/manage" },
    { label: campaign?.title || "Loading...", isCurrent: true },
  ];

  // Pegar lista de participantes (KOLs selecionados)
  const participants: KolReward[] = campaign?.list_kols ?? [];
  const totalParticipants = participants.length;
  const totalRewardPool = participants.reduce((sum: number, kol: KolReward) => sum + (kol.amount ?? 0), 0);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <Breadcrumb items={breadcrumbItems} />

        {isLoading ? (
          <div className="text-center py-10">Loading campaign...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : campaign ? (
          <>
            <header className="my-8 space-y-3">
              <p className="text-sm text-[var(--color-primary)] font-medium">
                {status === "inactive" && "Private Campaign"}
                {status === "active" && "Private Campaign Active"}
                {status === "waiting payment" && "Private Campaign - Waiting Payment"}
                {status === "completed" && "Private Campaign - Completed"}
                {status && !["active", "inactive", "waiting payment", "completed"].includes(status) && `Private Campaign (${status})`}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold">
                {isCampaignInactive ? "Campaign Overview" : "Campaign Submissions"}
              </h1>
              <p className="text-gray-300 max-w-4xl">
                {isCampaignInactive
                  ? `In "${campaign.title}" you have invited ${totalParticipants} specific creator${totalParticipants !== 1 ? "s" : ""} to participate. Review the details and activate your campaign when ready.`
                  : `Here you can search for submissions from your ${totalParticipants} invited creator${totalParticipants !== 1 ? "s" : ""} and send payments when ready.`}
              </p>
            </header>

            <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm w-full max-w-3xl mb-8">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-gray-300 font-medium">Creator Access Link:</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink("submissions")}
                  className="cursor-pointer px-3 py-1.5 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-1.5 min-w-[72px] justify-center shrink-0"
                >
                  {linkCopiedSection === "submissions" ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="animate-in fade-in duration-200">Copied</span>
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
              <p className="text-gray-400 text-[11px] md:text-xs mb-2">
                Share this link with creators.
              </p>
              <a
                href={`${BRAND_SITE_URL}/creator/campaign/${campaign.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] font-mono break-words block"
              >
                {BRAND_SITE_URL}/creator/campaign/{campaign.id}
              </a>
            </div>

            {isCampaignInactive ? (
              <>
                {/* Cards de Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <QuestDetailsCard 
                    campaign={campaign} 
                    onCampaignUpdate={handleCampaignUpdate}
                    isPrivate={true}
                  />
                  <PaymentDetailsCard campaign={campaign} />
                </div>

                {/* Back Button and Delete Button */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={() => router.push("/host/campaign/manage")}
                    className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                  >
                    BACK TO DASHBOARD
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="cursor-pointer px-6 py-3 border border-red-500 text-red-500 rounded-full font-medium hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    DELETE CAMPAIGN
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[var(--color-card)] rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Invited Creators</p>
                    <p className="text-3xl font-bold text-white">{totalParticipants}</p>
                  </div>
                  {campaign.is_cac ? (
                    <div className="bg-[var(--color-card)] rounded-xl p-6">
                      <p className="text-gray-400 text-sm mb-2">Value per Conversion</p>
                      <p className="text-3xl font-bold text-white">${campaign.amount_convertion?.toFixed(2) || "0.00"}</p>
                    </div>
                  ) : (
                    <div className="bg-[var(--color-card)] rounded-xl p-6">
                      <p className="text-gray-400 text-sm mb-2">Total Reward Pool</p>
                      <p className="text-3xl font-bold text-white">${totalRewardPool.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="bg-[var(--color-card)] rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Submissions</p>
                    <p className="text-3xl font-bold text-white">{campaign.total_submissions || 0}</p>
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("submissions")}
                    className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${
                      activeTab === "submissions"
                        ? "bg-[var(--color-card)]"
                        : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                    }`}
                  >
                    Submissions
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${
                      activeTab === "analytics"
                        ? "bg-[var(--color-card)]"
                        : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                    }`}
                  >
                    Analytics
                  </button>
                </div>

                {activeTab === "analytics" ? <HostCampaignMetricsPanel campaignId={campaign.id} /> : null}

                {/* Submissions Controls */}
                {activeTab === "submissions" ? (
                  <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative w-full md:flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search for submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-white rounded-full border border-gray-600 hover:border-white focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
                    />
                  </div>

                  {!campaign.rewards_distributed && (
                    <Button
                      variant="default"
                      className="px-6 py-3 font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer self-end md:self-auto md:ml-auto"
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      <FiDollarSign className="w-4 h-4" />
                      SEND PAYMENTS TO CREATORS
                    </Button>
                  )}
                  </div>
                ) : null}

                {/* Submissions Table */}
                {activeTab === "submissions" ? (
                  <Suspense
                  fallback={
                    <div className="p-8 text-center text-gray-400">
                      Loading submissions...
                    </div>
                  }
                >
                  <CampaignSubmissionsTable
                    campaignId={campaign.id}
                    searchTerm={searchTerm}
                    isPrivate={true}
                    isCac={campaign.is_cac === true}
                    campaignStatus={campaign.status}
                  />
                  </Suspense>
                ) : null}

                {/* Back Button */}
                <div className="mt-6">
                  <button
                    onClick={() => router.push("/host/campaign/manage")}
                    className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                  >
                    BACK TO DASHBOARD
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-10">Campaign not found.</div>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={<div></div>}>
        {campaign && (
          <MakePaymentsKolsSelectiveModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            campaign={campaign}
            onSuccess={() => {
              // Recarregar a campanha para atualizar o status
              if (id) {
                getCampaignById(id).then((response) => {
                  setCampaign(response.campaign);
                }).catch((err) => {
                  console.error("Error reloading campaign:", err);
                });
              }
            }}
          />
        )}
      </Suspense>

      {/* Delete Campaign Confirmation Modal */}
      {isDeleteModalOpen && campaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Private Campaign</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{campaign?.title}"? This action cannot be undone and will remove all invited participants.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={isDeleting}
                className="flex-1 cursor-pointer px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  "DELETING..."
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    DELETE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
