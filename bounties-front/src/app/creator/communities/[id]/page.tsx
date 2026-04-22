"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CommunityDetail, getCommunityById, leaveCommunity } from "@/lib/api/community";
import {
  CommunityDetailLayout,
  AnnouncementsList,
  CommunityChat,
  CommunityCampaigns,
  PublicMemberList,
  ConfirmModal,
} from "@/components/communities";
import type { SidebarSection } from "@/components/communities";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { renderMarkdown } from "@/utils/markdown";

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
const MembersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const LeaveIcon = () => (
  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);
const CampaignsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
  </svg>
);

export default function CreatorCommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [activeKey, setActiveKey] = useState("info");
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { showToast, hideToast, toast } = useToast();

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveCommunity(communityId);
      showToast("You have left the community", "success");
      router.push("/creator/communities");
    } catch (err: any) {
      showToast(err.message || "Failed to leave community", "error");
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const loadCommunity = useCallback(async () => {
    try {
      const res = await getCommunityById(communityId);
      setCommunity(res.data);
    } catch (err: any) {
      const status = (err as any).status;
      if (status === 403) {
        showToast("You must be an approved member to view this community", "error");
        router.push("/creator/communities");
        return;
      }
      if (status === 404) {
        showToast("Community not found", "error");
        router.push("/creator/communities");
        return;
      }
      showToast(err.message || "Failed to load community", "error");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  if (loading || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections: SidebarSection[] = [
    {
      title: "Community",
      items: [
        { key: "info", label: "General Info", icon: <InfoIcon /> },
        { key: "rules", label: "Rules", icon: <RulesIcon /> },
        { key: "members", label: "Members", icon: <MembersIcon /> },
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
      title: "Content",
      items: [
        { key: "campaigns", label: "Campaigns", icon: <CampaignsIcon /> },
      ],
    },
    {
      title: "",
      items: [
        { key: "leave", label: "Leave Community", icon: <LeaveIcon /> },
      ],
    },
  ];

  return (
    <>
      <CommunityDetailLayout
        community={community}
        sections={sections}
        activeKey={activeKey}
        onSelect={setActiveKey}
        backHref="/creator/communities"
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
            <PublicMemberList communityId={communityId} />
          </div>
        )}

        {activeKey === "announcements" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Announcements</h2>
            <AnnouncementsList
              communityId={communityId}
              announcements={community.announcements || []}
              canManage={false}
              onRefresh={loadCommunity}
            />
          </div>
        )}

        {activeKey === "chat" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Group Chat</h2>
            <CommunityChat communityId={communityId} isHost={false} />
          </div>
        )}

        {activeKey === "campaigns" && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Campaigns</h2>
            <CommunityCampaigns
              communityId={communityId}
              showMetrics={false}
              initialCampaigns={community.campaigns || []}
            />
          </div>
        )}

        {activeKey === "leave" && (
          <div>
            <h2 className="text-red-400 text-xl font-bold mb-2">Leave Community</h2>
            <p className="text-white/50 text-sm mb-6">
              If you leave, you will lose access to announcements, group chat, and exclusive campaigns in this community.
            </p>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="cursor-pointer px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Community
            </button>
          </div>
        )}
      </CommunityDetailLayout>

      {showLeaveModal && (
        <ConfirmModal
          title="Leave Community"
          message={`Are you sure you want to leave "${community.name}"? You will lose access to announcements, chat, and exclusive campaigns.`}
          confirmLabel="Leave"
          isDestructive
          loading={leaving}
          onConfirm={handleLeave}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </>
  );
}
