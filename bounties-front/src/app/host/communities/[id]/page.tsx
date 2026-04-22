"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CommunityDetail,
  CommunityMember,
  CommunityCampaign,
  getCommunityById,
  listMembers,
  listCommunityCampaigns,
  exportAnalyticsCSV,
  downloadBlob,
  deleteCommunity,
  updateCommunity,
  UpdateCommunityRequest,
  PlatformName,
} from "@/lib/api/community";
import {
  CommunityDetailLayout,
  MembersList,
  AnnouncementsList,
  CommunityChat,
  CommunityCampaigns,
  ConfirmModal,
  ImageUpload,
} from "@/components/communities";
import type { SidebarSection } from "@/components/communities";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { renderMarkdown } from "@/utils/markdown";
import BaseButton from "@/components/ui/Button";
import {
  getHostCampaignMetrics,
  type HostCampaignMetricsResponse,
  type HostCampaignMetricsPostKol,
} from "@/lib/api/host";


// Icons
const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);
const RulesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);
const MembersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const AnnouncementsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
  </svg>
);
const ChatIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
);
const CampaignsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
  </svg>
);
const ManageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.19 8.688a4.5 4.5 0 00-6.364 0l-2.25 2.25a4.5 4.5 0 106.364 6.364l.75-.75M10.81 15.312a4.5 4.5 0 006.364 0l2.25-2.25a4.5 4.5 0 10-6.364-6.364l-.75.75"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DangerIcon = () => (
  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const ALL_PLATFORMS: PlatformName[] = ["TWITTER", "INSTAGRAM", "TIKTOK", "YOUTUBE", "DISCORD", "TELEGRAM"];

export default function HostCommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [allMembers, setAllMembers] = useState<CommunityMember[]>([]);
  const [activeKey, setActiveKey] = useState("info");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showToast, hideToast, toast } = useToast();

  const loadCommunity = useCallback(async () => {
    try {
      const res = await getCommunityById(communityId);
      setCommunity(res.data);
    } catch (err: any) {
      if ((err as any).status === 403 || (err as any).status === 404) {
        showToast("Community not found or access denied", "error");
        router.push("/host/communities");
        return;
      }
      showToast(err.message || "Failed to load community", "error");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const loadMembers = useCallback(async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        listMembers(communityId, { status: "PENDING", limit: 100 }),
        listMembers(communityId, { status: "APPROVED", limit: 100 }),
        listMembers(communityId, { status: "REJECTED", limit: 100 }),
      ]);
      setAllMembers([...pending.members, ...approved.members, ...rejected.members]);
    } catch { }
  }, [communityId]);

  useEffect(() => {
    loadCommunity();
    loadMembers();
  }, [loadCommunity, loadMembers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCommunity(communityId);
      showToast("Community deleted", "success");
      router.push("/host/communities");
    } catch (err: any) {
      showToast(err.message || "Failed to delete community", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = allMembers.filter((m) => m.status === "PENDING").length;

  const handleCopyCreatorLink = async () => {
    try {
      const origin = window.location.origin;
      const name = String(community.name || "").trim();
      const href = `${origin}/creator/communities?q=${encodeURIComponent(name)}`;
      await navigator.clipboard.writeText(href);
      showToast("Creator link copied", "success");
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleSelect = (key: string) => {
    if (key === "copy_creator_link") {
      void handleCopyCreatorLink();
      return;
    }
    setActiveKey(key);
  };

  const sections: SidebarSection[] = [
    {
      title: "Community",
      items: [
        { key: "info", label: "General Info", icon: <InfoIcon /> },
        { key: "rules", label: "Rules", icon: <RulesIcon /> },
        { key: "copy_creator_link", label: "Copy Creator Link", icon: <LinkIcon /> },
      ],
    },
    {
      title: "Channels",
      items: [
        { key: "announcements", label: "Announcements", icon: <AnnouncementsIcon /> },
        { key: "chat", label: "Group Chat", icon: <ChatIcon /> },
      ],
    },
    {
      title: "Management",
      items: [
        { key: "members", label: "Members", icon: <MembersIcon /> },
      ],
    },
    {
      title: "Campaigns",
      items: [
        { key: "campaigns", label: "Campaigns", icon: <CampaignsIcon /> },
      ],
    },
    {
      title: "Manage Campaigns",
      items: [
        { key: "manage", label: "Manage", icon: <ManageIcon /> },
        { key: "analytics", label: "Analytics", icon: <AnalyticsIcon /> },
      ],
    },
    {
      title: "Settings",
      items: [
        { key: "settings", label: "Settings", icon: <SettingsIcon /> },
        { key: "danger", label: "Delete Community", icon: <DangerIcon /> },
      ],
    },
  ];

  return (
    <>
      <CommunityDetailLayout
        community={community}
        sections={sections}
        activeKey={activeKey}
        onSelect={handleSelect}
        backHref="/host/communities"
        hasNavbar
      >
        {activeKey === "info" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-4">{community.name}</h1>
            <div className="text-white/60 text-sm leading-relaxed">{renderMarkdown(community.description)}</div>
          </div>
        )}

        {activeKey === "rules" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Rules</h2>
            <div className="text-white/60 text-sm leading-relaxed">
              {community.rules ? renderMarkdown(community.rules) : "No rules defined."}
            </div>
          </div>
        )}

        {activeKey === "members" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Members</h2>
            <MembersList
              communityId={communityId}
              members={allMembers}
              isHost
              canExport
              onRefresh={() => { loadMembers(); loadCommunity(); }}
            />
          </div>
        )}

        {activeKey === "announcements" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Announcements</h2>
            <AnnouncementsList
              communityId={communityId}
              announcements={community.announcements || []}
              canManage
              onRefresh={loadCommunity}
            />
          </div>
        )}

        {activeKey === "chat" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Group Chat</h2>
            <CommunityChat communityId={communityId} isHost />
          </div>
        )}

        {activeKey === "campaigns" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Campaigns</h2>
            <CommunityCampaigns
              communityId={communityId}
              showMetrics
              canCreate
              viewMode="table"
              initialCampaigns={community.campaigns || []}
            />
          </div>
        )}

        {activeKey === "analytics" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Analytics</h2>
            <CommunityAnalytics communityId={communityId} />
          </div>
        )}

        {activeKey === "manage" && (
          <CommunityManageCampaigns communityId={communityId} />
        )}

        {activeKey === "settings" && (
          <CommunitySettings
            community={community}
            onRefresh={loadCommunity}
          />
        )}

        {activeKey === "danger" && (
          <div>
            <h2 className="text-red-400 text-xl font-bold mb-2">Delete Community</h2>
            <p className="text-white/50 text-sm mb-6">
              This action is permanent and cannot be undone. All members, announcements, messages, and campaigns linked to this community will be removed.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="cursor-pointer px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Community
            </button>
          </div>
        )}
      </CommunityDetailLayout>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Community"
          message="Are you sure? This will remove all members, announcements, and messages permanently."
          confirmLabel="Delete Community"
          isDestructive
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </>
  );
}

// Manage Campaigns — lists campaigns with link to full manage page
function CommunityManageCampaigns({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CommunityCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listCommunityCampaigns(communityId, { limit: 50 });
        setCampaigns(res.campaigns);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [communityId]);

  if (loading) {
    return <div className="animate-pulse bg-white/5 rounded-lg h-40" />;
  }

  if (campaigns.length === 0) {
    return <p className="text-white/40 text-sm py-8 text-center">No campaigns yet.</p>;
  }

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-2">Manage Campaigns</h2>
      <p className="text-white/40 text-sm mb-6">
        Submissions, winners, payments and mindshare for each campaign.
      </p>

      <div className="space-y-3">
        {campaigns.map((c) => {
          const id = c._id || c.id || "";
          return (
            <div key={id} className="bg-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{c.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === "active" ? "bg-green-500/20 text-green-400"
                    : c.status === "waiting payment" ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-white/10 text-white/50"
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-white/40 text-xs">
                    {c.total_prize_pool} {(c.payment_token as string) || "USDC"}
                  </span>
                  {typeof c.total_submissions === "number" && c.total_submissions > 0 && (
                    <span className="text-white/40 text-xs">
                      {c.total_submissions} submissions
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push(`/host/campaign/manage/${id}?from=community`)}
                className="cursor-pointer px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Manage
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Analytics sub-component — requires Enterprise plan
function CommunityAnalytics({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CommunityCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [metrics, setMetrics] = useState<HostCampaignMetricsResponse | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);

  // Check plan
  useEffect(() => {
    let cancelled = false;
    import("@/lib/api/plan").then(({ getMyPlan }) => {
      getMyPlan()
        .then((r) => {
          if (cancelled) return;
          const name = String(r?.plan?.name ?? "").toUpperCase();
          const active = Boolean(r?.is_active);
          setIsEnterprise(name === "ENTERPRISE" && active);
        })
        .catch(() => { if (!cancelled) setIsEnterprise(false); })
        .finally(() => { if (!cancelled) setPlanChecked(true); });
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!planChecked || !isEnterprise) return;
    const load = async () => {
      try {
        const res = await listCommunityCampaigns(communityId, { limit: 50 });
        setCampaigns(res.campaigns);
        if (res.campaigns.length > 0) {
          setSelectedCampaignId(res.campaigns[0]._id || res.campaigns[0].id || "");
        }
      } catch {
        // silent
      } finally {
        setLoadingCampaigns(false);
      }
    };
    load();
  }, [communityId, planChecked, isEnterprise]);

  // Fetch metrics when selected campaign changes
  useEffect(() => {
    if (!selectedCampaignId || !isEnterprise) return;
    setLoadingMetrics(true);
    setError(null);
    setMetrics(null);
    getHostCampaignMetrics(selectedCampaignId)
      .then(setMetrics)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load metrics"))
      .finally(() => setLoadingMetrics(false));
  }, [selectedCampaignId, isEnterprise]);

  if (!planChecked) {
    return <div className="animate-pulse bg-white/5 rounded-lg h-40" />;
  }

  if (!isEnterprise) {
    return (
      <div className="text-center py-12">
        <svg className="w-14 h-14 mx-auto text-[var(--color-primary)]/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h3 className="text-white font-semibold text-lg mb-2">Enterprise Plan Required</h3>
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
          Campaign analytics with detailed metrics, creator performance, and engagement data is available on the Enterprise plan.
        </p>
        <button
          onClick={() => router.push("/host/plans")}
          className="cursor-pointer px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Upgrade to Enterprise
        </button>
      </div>
    );
  }

  if (loadingCampaigns) {
    return <div className="animate-pulse bg-white/5 rounded-lg h-40" />;
  }

  if (campaigns.length === 0) {
    return <p className="text-white/40 text-sm py-8 text-center">No campaigns to analyze yet.</p>;
  }

  return (
    <div>
      {/* Campaign selector */}
      <div className="mb-6">
        <label className="text-white/60 text-xs mb-1.5 block">Select Campaign</label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="cursor-pointer bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] w-full max-w-md"
        >
          {campaigns.map((c) => {
            const id = c._id || c.id || "";
            return (
              <option key={id} value={id} className="bg-[var(--color-card)] text-white">
                {c.title}
              </option>
            );
          })}
        </select>
      </div>

      {/* Metrics */}
      {loadingMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-lg h-20 animate-pulse" />
            ))}
          </div>
          <div className="bg-white/5 rounded-lg h-64 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {metrics && !loadingMetrics && (
        <div className="space-y-6">
          {/* Export button */}
          <div className="flex justify-end">
            <ExportAnalyticsButton communityId={communityId} campaignId={selectedCampaignId} />
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Total Posts" value={metrics.total_posts} />
            <MetricCard label="Submissions" value={metrics.total_submissions} />
            <MetricCard label="Views" value={metrics.total_views} />
            <MetricCard label="Likes" value={metrics.total_likes} />
            <MetricCard label="Retweets" value={metrics.total_retweets} />
            <MetricCard label="Replies" value={metrics.total_replies} />
            <MetricCard label="Quotes" value={metrics.total_quotes} />
            <MetricCard label="Bookmarks" value={metrics.total_bookmarks} />
          </div>

          {/* Creators table */}
          {metrics.post_kols && metrics.post_kols.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Creators Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Creator</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Posts</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Views</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Likes</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Retweets</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Replies</th>
                      <th className="text-white/40 text-xs font-medium uppercase py-2 px-3">Bookmarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.post_kols.map((kol, i) => (
                      <tr key={kol.user_id || i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 text-white text-sm font-medium">{kol.username}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{kol.total_submissions}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{formatNumber(kol.total_views)}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{formatNumber(kol.total_likes)}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{formatNumber(kol.total_retweets)}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{kol.total_replies ?? 0}</td>
                        <td className="py-2 px-3 text-white/60 text-sm">{kol.total_bookmarks ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExportAnalyticsButton({ communityId, campaignId }: { communityId: string; campaignId: string }) {
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAnalyticsCSV(communityId, campaignId);
      downloadBlob(blob, `analytics_${new Date().toISOString().split("T")[0]}.csv`);
      showToast("CSV exported successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to export CSV", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="cursor-pointer px-3 py-2 text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? "Exporting..." : "Export CSV"}
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{formatNumber(value)}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n ?? 0);
}

// Settings sub-component
function CommunitySettings({
  community,
  onRefresh,
}: {
  community: CommunityDetail;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState<UpdateCommunityRequest>({
    name: community.name,
    description: community.description,
    rules: community.rules,
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>(
    community.required_platforms || []
  );
  const [logo, setLogo] = useState<string | undefined>(community.logo || undefined);
  const toLocalDatetime = (iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [enrollmentStart, setEnrollmentStart] = useState(() => toLocalDatetime((community as any).enrollment_start));
  const [enrollmentEnd, setEnrollmentEnd] = useState(() => toLocalDatetime((community as any).enrollment_end));
  const [loading, setLoading] = useState(false);
  const { showToast, hideToast, toast } = useToast();

  const togglePlatform = (p: PlatformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast("Name is required", "warning");
      return;
    }
    setLoading(true);
    try {
      await updateCommunity(community.id, {
        ...formData,
        ...(logo && { logo }),
        required_platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        ...(enrollmentStart && { enrollment_start: new Date(enrollmentStart).toISOString() }),
        ...(enrollmentEnd && { enrollment_end: new Date(enrollmentEnd).toISOString() }),
      });
      showToast("Community updated", "success");
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-4">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Logo</label>
          <ImageUpload value={logo} onChange={setLogo} />
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Name</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-white/60 text-xs mb-1 block">Description</label>
            <RichTextEditor
              value={formData.description || ""}
              onChange={(value) => setFormData((p) => ({ ...p, description: value }))}
              rows={5}
              maxLength={2000}
              placeholder="Community description"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Rules</label>
            <RichTextEditor
              value={formData.rules || ""}
              onChange={(value) => setFormData((p) => ({ ...p, rules: value }))}
              rows={5}
              maxLength={2000}
              placeholder="Community rules"
            />
          </div>
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Enrollment Period</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-white/40 text-[10px] mb-0.5 block">Start</label>
              <input
                type="datetime-local"
                value={enrollmentStart}
                onChange={(e) => setEnrollmentStart(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-0.5 block">End</label>
              <input
                type="datetime-local"
                value={enrollmentEnd}
                onChange={(e) => setEnrollmentEnd(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Required Platforms</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPlatforms.includes(p)
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <BaseButton
          type="submit"
          disabled={loading}
          variant="default"
          className="px-6 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </BaseButton>
      </form>


      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
