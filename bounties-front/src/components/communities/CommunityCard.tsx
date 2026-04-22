"use client";

import { Community, PlatformName } from "@/lib/api/community";
import BaseButton from "@/components/ui/Button";

const PLATFORM_COLORS: Record<PlatformName, string> = {
  TWITTER: "bg-blue-600/20 text-blue-300",
  INSTAGRAM: "bg-pink-600/20 text-pink-300",
  TIKTOK: "bg-purple-600/20 text-purple-300",
  YOUTUBE: "bg-red-600/20 text-red-300",
  DISCORD: "bg-indigo-600/20 text-indigo-300",
  TELEGRAM: "bg-blue-500/20 text-blue-300",
};

interface CommunityCardProps {
  community: Community;
  onClick?: () => void;
  /** Show join status for creators */
  showStatus?: boolean;
  /** Actions slot (e.g. join button) */
  actions?: React.ReactNode;
}

export default function CommunityCard({
  community,
  onClick,
  showStatus,
  actions,
}: CommunityCardProps) {
  const showEnter = Boolean(onClick) && !actions;

  return (
    <div
      onClick={onClick}
      className={`bg-[var(--color-card)] rounded-lg p-5 border border-white/10 transition-all duration-200 flex flex-col h-full ${
        onClick ? "cursor-pointer hover:border-[var(--color-primary)]/50 hover:shadow-lg" : ""
      }`}
    >
      <div className="flex items-start gap-4 flex-1">
        {/* Logo */}
        <div className="w-14 h-14 rounded-lg bg-[var(--color-accent)]/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {community.logo ? (
            <img
              src={community.logo}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-7 h-7 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-lg truncate">{community.name}</h3>
            {showStatus && community.member_status && (
              <StatusBadge status={community.member_status} />
            )}
          </div>
          <p className="text-white/60 text-sm mt-1 line-clamp-2">{community.description}</p>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-white/40 text-xs flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              {community.members_count} member{community.members_count !== 1 ? "s" : ""}
            </span>

            {community.required_platforms && community.required_platforms.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {community.required_platforms.map((p) => (
                  <span
                    key={p}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[p] || "bg-white/10 text-white/60"}`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {(community.enrollment_start || community.enrollment_end) && (
            <div className="flex items-center gap-1 mt-2 text-white/30 text-xs">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {community.enrollment_start && new Date(community.enrollment_start).toLocaleString([], { dateStyle: "short", timeStyle: "short" }).replace(",", "")}
              {community.enrollment_start && community.enrollment_end && " — "}
              {community.enrollment_end && new Date(community.enrollment_end).toLocaleString([], { dateStyle: "short", timeStyle: "short" }).replace(",", "")}
            </div>
          )}
        </div>
      </div>

      {showEnter && (
        <div className="pt-4 mt-4 border-t border-white/5 flex justify-center">
          <BaseButton
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="px-6 py-2 text-sm font-semibold cursor-pointer"
          >
            Join
          </BaseButton>
        </div>
      )}

      {actions && (
        <>
          <div className="flex-grow min-h-3" />
          <div className="pt-3 border-t border-white/5">{actions}</div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-green-600/20 text-green-400",
    PENDING: "bg-yellow-600/20 text-yellow-400",
    REJECTED: "bg-red-600/20 text-red-400",
  };
  const labels: Record<string, string> = {
    APPROVED: "Member",
    PENDING: "Pending",
    REJECTED: "Rejected",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles[status] || "bg-white/10 text-white/60"}`}>
      {labels[status] || status}
    </span>
  );
}
