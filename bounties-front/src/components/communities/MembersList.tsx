"use client";

import { useState } from "react";
import { CommunityMember, MemberStatus, approveMember, rejectMember, removeMember, exportMembersCSV, downloadBlob } from "@/lib/api/community";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import ConfirmModal from "./ConfirmModal";
import BaseButton from "@/components/ui/Button";

interface MembersListProps {
  communityId: string;
  members: CommunityMember[];
  isHost: boolean;
  isAdmin?: boolean;
  canExport?: boolean;
  onRefresh: () => void;
}

const STATUS_TABS: { label: string; value: MemberStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function MembersList({ communityId, members, isHost, isAdmin, canExport, onRefresh }: MembersListProps) {
  const [activeTab, setActiveTab] = useState<MemberStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "reject" | "remove"; member: CommunityMember } | null>(null);
  const { showToast, hideToast, toast } = useToast();

  const filtered = activeTab === "ALL"
    ? members
    : members.filter((m) => m.status === activeTab);

  const handleApprove = async (member: CommunityMember) => {
    setLoading(member.id);
    try {
      await approveMember(communityId, member.id);
      showToast("Member approved successfully", "success");
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to approve member", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (member: CommunityMember) => {
    setLoading(member.id);
    try {
      await rejectMember(communityId, member.id);
      showToast("Member rejected", "success");
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to reject member", "error");
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const handleRemove = async (member: CommunityMember) => {
    setLoading(member.id);
    try {
      await removeMember(communityId, member.id);
      showToast("Member removed", "success");
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to remove member", "error");
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportMembersCSV(communityId);
      downloadBlob(blob, `members_${new Date().toISOString().split("T")[0]}.csv`);
      showToast("CSV exported successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to export CSV", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Tabs + Export */}
      <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`cursor-pointer px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">
              ({members.filter((m) => m.status === tab.value).length})
            </span>
          </button>
        ))}
      </div>
      {canExport && (
        <BaseButton
          onClick={handleExport}
          disabled={exporting}
          variant="default"
          className="px-4 py-2 text-xs font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? "Exporting..." : "Export CSV"}
        </BaseButton>
      )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-white/40 text-sm py-8 text-center">
          No {activeTab.toLowerCase()} members
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden relative">
                  <Image
                    src="/assets/twitterProfile/twitterIconSubstitute.svg"
                    alt={member.creator.username || "User"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {member.creator.username}
                  </p>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {member.creator.username_instagram && (
                      <span className="inline-flex items-center gap-1 bg-pink-600/15 text-pink-400 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        {member.creator.username_instagram}
                      </span>
                    )}
                    {member.creator.username_tiktok && (
                      <span className="inline-flex items-center gap-1 bg-purple-600/15 text-purple-400 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V12.8a8.2 8.2 0 005.58 2.17V11.5a4.85 4.85 0 01-3.77-1.83V6.69h3.77z"/></svg>
                        {member.creator.username_tiktok}
                      </span>
                    )}
                    {member.creator.username_youtube && (
                      <span className="inline-flex items-center gap-1 bg-red-600/15 text-red-400 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        {member.creator.username_youtube}
                      </span>
                    )}
                    {member.creator.twitter_username && (
                      <span className="inline-flex items-center gap-1 bg-blue-600/15 text-blue-400 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        {member.creator.twitter_username}
                      </span>
                    )}
                    {member.creator.username_discord && (
                      <span className="inline-flex items-center gap-1 bg-indigo-600/15 text-indigo-400 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
                        {member.creator.username_discord}
                      </span>
                    )}
                    {member.creator.username_telegram && (
                      <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-300 text-xs px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        {member.creator.username_telegram}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(isHost || isAdmin) && (
                <div className="flex gap-2 flex-shrink-0">
                  {member.status === "PENDING" && isHost && (
                    <>
                      <button
                        onClick={() => handleApprove(member)}
                        disabled={loading === member.id}
                        className="cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading === member.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: "reject", member })}
                        disabled={loading === member.id}
                        className="cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {member.status === "APPROVED" && (
                    <button
                      onClick={() => setConfirmAction({ type: "remove", member })}
                      disabled={loading === member.id}
                      className="cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === "reject" ? "Reject Member" : "Remove Member"}
          message={
            confirmAction.type === "reject"
              ? `Are you sure you want to reject ${confirmAction.member.creator.username}?`
              : `Are you sure you want to remove ${confirmAction.member.creator.username}? They will lose access to the community.`
          }
          confirmLabel={confirmAction.type === "reject" ? "Reject" : "Remove"}
          isDestructive
          loading={loading === confirmAction.member.id}
          onConfirm={() =>
            confirmAction.type === "reject"
              ? handleReject(confirmAction.member)
              : handleRemove(confirmAction.member)
          }
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
