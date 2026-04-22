"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import QuestDetailsCard from "@/components/host/campaigns/details/QuestDetailsCard";
import PaymentDetailsCard from "@/components/host/campaigns/details/PaymentDetailsCard";
import { getCampaignById, CampaignDetails, deleteCampaign } from "@/lib/api/host";
import { FaSearch } from "react-icons/fa";
import { FiAward, FiCheck, FiDollarSign, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import HostCampaignMetricsPanel from "@/components/host/campaigns/details/HostCampaignMetricsPanel";
import { BRAND_SITE_URL } from "@/lib/branding/links";

// Lazy load componentes pesados que só são usados quando necessário
const CampaignSubmissionsTable = lazy(
  () => import("@/components/host/campaigns/details/CampaignSubmissionsTable")
);
const WinnersTable = lazy(
  () => import("@/components/host/campaigns/details/WinnersTable")
);
const AcceptSuggestionsTable = lazy(
  () => import("@/components/host/campaigns/details/AcceptSuggestionsTable")
);
const SelectWinnersModal = lazy(
  () => import("@/components/host/campaigns/details/SelectWinnersModal")
);
const MakePaymentsModal = lazy(
  () => import("@/components/host/campaigns/details/MakePaymentsModal")
);
const AcceptSuggestionsModal = lazy(
  () => import("@/components/host/campaigns/details/AcceptSuggestionsModal")
);

export default function ManageCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromCommunity = searchParams.get("from") === "community";

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "submissions" | "analytics" | "winners" | "suggested-ratings"
  >("submissions");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectWinnersModalOpen, setIsSelectWinnersModalOpen] =
    useState(false);
  const [isMakePaymentsModalOpen, setIsMakePaymentsModalOpen] = useState(false);
  const [isAcceptSuggestionsModalOpen, setIsAcceptSuggestionsModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const creatorLink = campaign
    ? `${BRAND_SITE_URL}/creator/campaign/${campaign.id}`
    : "";
  const handleCopyLink = () => {
    if (!creatorLink) return;
    navigator.clipboard?.writeText(creatorLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
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

  // Determinar se a campanha está ativa (paga) ou inativa (não paga)
  const isCampaignActive = campaign?.status === "active";
  const isCampaignInactive = campaign?.status === "inactive";
  

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

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Breadcrumb items={breadcrumbItems} />
          {fromCommunity && (
            <button
              onClick={() => {
                const cid = (campaign as any)?.community_id || (campaign as any)?.community;
                router.push(cid ? `/host/communities/${cid}` : "/host/communities");
              }}
              className="cursor-pointer text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Community
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading campaign...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : campaign ? (
          <>
            {/* Tela de Overview (Inactive - não paga) */}
            {isCampaignInactive ? (
              <>
                <header className="my-8 space-y-2">
                  <p className="text-sm text-[var(--color-primary)] font-medium">
                    Make your campaign public
                  </p>
                  <h1 className="text-3xl md:text-5xl font-bold">
                    Campaign Overview
                  </h1>
                  <p className="text-gray-300 max-w-4xl">
                    In "{campaign.title}" you can test the mission and, when
                    satisfied, make it public for your Creators to make
                    submissions.
                  </p>
                </header>

                {/* Creator Access Link - campanha inativa */}
                <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm w-full max-w-3xl mb-8">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-gray-300 font-medium">Creator Access Link:</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="cursor-pointer px-3 py-1.5 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-1.5 min-w-[72px] justify-center shrink-0"
                    >
                      {linkCopied ? (
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
                    href={creatorLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] font-mono break-words block"
                  >
                    {creatorLink}
                  </a>
                </div>

                {/* Cards de Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <QuestDetailsCard 
                    campaign={campaign} 
                    onCampaignUpdate={handleCampaignUpdate}
                  />
                  <PaymentDetailsCard campaign={campaign} />
                </div>

                {/* Back Button and Delete Button */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">

                  <button
                    onClick={() => router.push("/host/campaign/manage")}
                    className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                  >
                    BACK TO DASHBOARD CAMPAIGN
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
                {/* Tela de Submissions/Winners (Active - paga) */}
                <header className="my-8 space-y-2">
                  {activeTab === "winners" ? (
                    <>
                      <p className="text-sm text-[var(--color-primary)] font-medium">
                        Campaign Champions
                      </p>
                      <h1 className="text-3xl md:text-5xl font-bold">
                        The Best Creators Are Here
                      </h1>
                      <p className="text-gray-300 max-w-4xl">
                        In "{campaign.title}", you can test the mission and,
                        when satisfied, make it public for your Creators to make
                        submissions.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--color-primary)] font-medium">
                        Make your campaign public
                      </p>
                      <h1 className="text-3xl md:text-5xl font-bold">
                        Control Your Campaign
                      </h1>
                      <p className="text-gray-300 max-w-4xl">
                        Here you can search for a creator's submission, pause
                        your campaign and select winners.
                      </p>
                    </>
                  )}
                </header>

                {/* Creator Access Link - campanha ativa */}
                <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm w-full max-w-3xl mb-8">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-gray-300 font-medium">Creator Access Link:</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="cursor-pointer px-3 py-1.5 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-1.5 min-w-[72px] justify-center shrink-0"
                    >
                      {linkCopied ? (
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
                    href={creatorLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] font-mono break-words block"
                  >
                    {creatorLink}
                  </a>
                </div>

                {/* Tabs - Only show Suggested Winners for mindshare campaigns */}
              
                <div className="mb-6 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab("submissions")}
                        className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border border-transparent transition-all ${
                          activeTab === "submissions"
                            ? "bg-[var(--color-card)]"
                            : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                        }`}
                      >
                        Submissions
                      </button>

                      {!fromCommunity && (
                        <button
                          onClick={() => setActiveTab("analytics")}
                          className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border border-transparent transition-all ${
                            activeTab === "analytics"
                              ? "bg-[var(--color-card)]"
                              : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                          }`}
                        >
                          Analytics
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab("winners")}
                        className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border border-transparent transition-all ${
                          activeTab === "winners"
                            ? "bg-[var(--color-card)]"
                            : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                        }`}
                      >
                        Winners (Manually)
                      </button>

                  <button
                    onClick={() => setActiveTab("suggested-ratings")}
                    className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-l-full rounded-r-full border border-transparent transition-all ${
                      activeTab === "suggested-ratings"
                        ? "bg-[var(--color-card)]"
                        : "bg-transparent border-white/20 hover:bg-[var(--color-card)]"
                    }`}
                  >
                    Mindshare
                  </button>
                </div>

                {activeTab === "submissions" ? (
                  <>
                    {/* Submissions Controls */}
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
                          onClick={() => setIsSelectWinnersModalOpen(true)}
                        >
                          <FiAward className="w-4 h-4" />
                          SELECT WINNERS
                        </Button>
                      )}
                    </div>

                    {/* Submissions Table */}
                    <Suspense
                      fallback={
                        <div className="p-8 text-center text-gray-400">
                          Loading submissions...
                        </div>
                      }
                    >
                      <CampaignSubmissionsTable
                        campaignId={id}
                        searchTerm={searchTerm}
                      />
                    </Suspense>

                    {/* Back Button */}
                    <div className="mt-6 flex items-center gap-4 flex-wrap">
                      {fromCommunity && (campaign as any)?.community_id && (
                        <button
                          onClick={() => router.push(`/host/communities/${(campaign as any).community_id}`)}
                          className="cursor-pointer px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:opacity-90 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          GO TO COMMUNITY
                        </button>
                      )}
                      <button
                        onClick={() => router.push("/host/campaign/manage")}
                        className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                      >
                        BACK TO DASHBOARD CAMPAIGN
                      </button>
                    </div>
                  </>
                ) : activeTab === "analytics" ? (
                  <>
                    <HostCampaignMetricsPanel campaignId={id} />
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab("submissions")}
                        className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                      >
                        BACK TO SUBMISSIONS
                      </button>
                    </div>
                  </>
                ) : activeTab === "winners" ? (
                  <>
                    {/* Winners Controls */}
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

                      {campaign.status === "waiting payment" &&
                        !campaign.rewards_distributed && (
                          <Button
                            variant="default"
                            className="px-6 py-3 font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer self-end md:self-auto md:ml-auto"
                            onClick={() => setIsMakePaymentsModalOpen(true)}
                          >
                            <FiDollarSign className="w-4 h-4" />
                            MAKE PAYMENTS
                          </Button>
                        )}
                    </div>

                    {/* Winners Table */}
                    <Suspense>
                      <WinnersTable campaignId={id} searchTerm={searchTerm} />
                    </Suspense>

                    {/* Back Button */}
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab("submissions")}
                        className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        BACK TO SUBMISSIONS
                      </button>
                    </div>
                  </>
                ) : activeTab === "suggested-ratings" ? (
                  <>
                    <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="relative w-full md:flex-1"></div>

                      {campaign.status === "waiting payment" &&
                        !campaign.rewards_distributed && (
                          <Button
                            variant="default"
                            className="px-6 py-3 font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer self-end md:self-auto md:ml-auto"
                            onClick={() =>
                              setIsAcceptSuggestionsModalOpen(true)
                            }
                          >
                            <FiDollarSign className="w-4 h-4" />
                            ACCEPT SUGGESTIONS
                          </Button>
                        )}
                    </div>

                    <Suspense>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#888",
                          marginBottom: "10px",
                          fontStyle: "italic",
                        }}
                      >
                        The automatic generation of ranks is only available for
                        Twitter.
                      </p>
                      <AcceptSuggestionsTable campaignId={id} />
                    </Suspense>

                    {/* Back Button */}
                    <div className="mt-6">
                        <button
                          onClick={() => setActiveTab("submissions")}
                          className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          BACK TO SUBMISSIONS
                        </button>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-10">Campaign not found.</div>
        )}
      </div>

      {/* Select Winners Modal */}
      {campaign && isSelectWinnersModalOpen && (
        <Suspense fallback={null}>
          <SelectWinnersModal
            isOpen={isSelectWinnersModalOpen}
            onClose={() => setIsSelectWinnersModalOpen(false)}
            campaign={campaign}
            onSave={() => {
              // Recarregar a página para atualizar os winners
              window.location.reload();
            }}
          />
        </Suspense>
      )}

      {/* Make Payments Modal */}
      {campaign && isMakePaymentsModalOpen && (
        <Suspense fallback={null}>
          <MakePaymentsModal
            isOpen={isMakePaymentsModalOpen}
            onClose={() => setIsMakePaymentsModalOpen(false)}
            campaign={campaign}
          />
        </Suspense>
      )}

      {/* Accept Suggestions Modal */}
      {campaign && isAcceptSuggestionsModalOpen && (
        <Suspense fallback={null}>
          <AcceptSuggestionsModal
            isOpen={isAcceptSuggestionsModalOpen}
            onClose={() => setIsAcceptSuggestionsModalOpen(false)}
            campaign={campaign}
          />
        </Suspense>
      )}

      {/* Delete Campaign Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Campaign</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{campaign?.title}"? This action cannot be undone.
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
