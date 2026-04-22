"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Community, listCommunities, listMyCommunities, joinCommunity } from "@/lib/api/community";
import { CommunityCard, ConfirmModal } from "@/components/communities";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import BaseButton from "@/components/ui/Button";
import dynamic from "next/dynamic";

const CreatorOnboardingModal = dynamic(() => import("@/components/auth/CreatorOnboardingModal"), { ssr: false });

type ViewMode = "explore" | "mine";

export default function CreatorCommunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("explore");
  const [exploreCommunities, setExploreCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [confirmJoinCommunity, setConfirmJoinCommunity] = useState<Community | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [strictNameFilter, setStrictNameFilter] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast, hideToast, toast } = useToast();

  const normalizeName = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
  const formatPlatformLabel = (p: string): string => {
    switch (p) {
      case "TWITTER":
        return "Twitter";
      case "TIKTOK":
        return "TikTok";
      case "INSTAGRAM":
        return "Instagram";
      case "YOUTUBE":
        return "YouTube";
      case "DISCORD":
        return "Discord";
      case "TELEGRAM":
        return "Telegram";
      default:
        return p;
    }
  };

  const loadData = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const [exploreRes, mineRes] = await Promise.all([
        listCommunities({ search }),
        listMyCommunities(),
      ]);
      setExploreCommunities(exploreRes.data);
      setMyCommunities(mineRes.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load communities", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Suporta links do tipo:
    // - /creator/communities?q=DeaG%20Teste
    // - /creator/communities?DeaG%20Teste  (query "sem chave")
    const q = searchParams.get("q")?.trim() || searchParams.get("search")?.trim() || "";
    let initial = q;

    if (!initial) {
      const keys = Array.from(searchParams.keys());
      const firstKey = keys[0];
      if (firstKey && searchParams.get(firstKey) === "" && !firstKey.toLowerCase().startsWith("utm_")) {
        initial = firstKey.trim();
      }
    }

    if (initial && initial !== searchInput) {
      setViewMode("explore");
      setSearchInput(initial);
    }

    // Se veio por link, aplica filtro exato (client-side) para não aparecerem matches parciais.
    setStrictNameFilter(initial ? initial : null);
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      loadData(searchInput.trim() || undefined);
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchInput]);

  const handleJoinConfirmed = async (communityId: string) => {
    setJoiningId(communityId);
    setConfirmJoinCommunity(null);
    try {
      await joinCommunity(communityId);
      showToast("Request submitted! Waiting for approval.", "success");
      await loadData(searchInput.trim() || undefined);
    } catch (err: any) {
      const status = (err as any).status;
      if (status === 409) {
        showToast("You already have a pending request", "warning");
      } else if (status === 400) {
        showToast(err.message || "Missing required platforms", "error");
      } else {
        showToast(err.message || "Failed to join community", "error");
      }
    } finally {
      setJoiningId(null);
    }
  };

  // Build a map of member_status from explore data for quick lookup
  const statusMap = new Map<string, string>();
  exploreCommunities.forEach((c) => {
    if (c.member_status) statusMap.set(c.id, c.member_status);
  });
  // Also from myCommunities
  myCommunities.forEach((c) => {
    if (c.member_status) statusMap.set(c.id, c.member_status);
  });

  const displayCommunities = viewMode === "explore" ? exploreCommunities : myCommunities;
  const filteredCommunities =
    viewMode === "explore" && strictNameFilter
      ? displayCommunities.filter((c) => normalizeName(c.name || "") === normalizeName(strictNameFilter))
      : displayCommunities;

  // Check if creator has a given platform configured
  const creatorUser = user as any;
  const creatorPlatforms = new Set<string>();
  if (creatorUser?.twitter_username || creatorUser?.username_twitter) creatorPlatforms.add("TWITTER");
  if (creatorUser?.username_instagram) creatorPlatforms.add("INSTAGRAM");
  if (creatorUser?.username_tiktok) creatorPlatforms.add("TIKTOK");
  if (creatorUser?.username_youtube) creatorPlatforms.add("YOUTUBE");
  if (creatorUser?.username_discord) creatorPlatforms.add("DISCORD");
  if (creatorUser?.username_telegram) creatorPlatforms.add("TELEGRAM");

  const getMissingPlatforms = (required?: string[] | null): string[] => {
    if (!required || required.length === 0) return [];
    return required.filter((p) => !creatorPlatforms.has(p));
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Communities</h1>
          <p className="text-white/50 text-sm mt-1">
            Discover and join communities to access exclusive campaigns
          </p>
        </div>

        {/* Search */}
        {viewMode === "explore" && (
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)]"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("explore")}
            className={`cursor-pointer px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "explore"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setViewMode("mine")}
            className={`cursor-pointer px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "mine"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            My Communities
            {myCommunities.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({myCommunities.length})</span>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-card)] rounded-lg p-5 animate-pulse h-40" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/40 text-lg">
              {viewMode === "explore" ? "No communities available" : "You haven't joined any communities yet"}
            </p>
            {viewMode === "mine" && (
              <button
                onClick={() => setViewMode("explore")}
                className="cursor-pointer mt-4 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Explore Communities
              </button>
            )}
          </div>
        )}

        {/* Communities grid */}
        {!loading && filteredCommunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCommunities.map((c) => {
              const memberStatus = c.member_status || statusMap.get(c.id);
              const missingPlatforms = getMissingPlatforms(c.required_platforms);
              const now = new Date();
              const enrollmentNotStarted = c.enrollment_start && new Date(c.enrollment_start) > now;
              const enrollmentEnded = c.enrollment_end && new Date(c.enrollment_end) < now;
              const canJoin = !memberStatus && missingPlatforms.length === 0;
              const isPending = memberStatus === "PENDING";
              const isApproved = memberStatus === "APPROVED";
              const isRejected = memberStatus === "REJECTED";

              return (
                <CommunityCard
                  key={c.id}
                  community={c}
                  showStatus={viewMode === "explore"}
                  onClick={isApproved ? () => router.push(`/creator/communities/${c.id}`) : undefined}
                  actions={
                    viewMode === "explore" ? (
                      <div>
                        {isApproved && (
                          <button
                            onClick={() => router.push(`/creator/communities/${c.id}`)}
                            className="cursor-pointer w-full py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg"
                          >
                            View Community
                          </button>
                        )}
                        {isPending && (
                          <p className="text-yellow-400 text-sm text-center py-1">
                            Awaiting approval
                          </p>
                        )}
                        {isRejected && (
                          <button
                            onClick={() => setConfirmJoinCommunity(c)}
                            disabled={joiningId === c.id}
                            className="cursor-pointer w-full py-2 bg-white/5 text-white/60 text-sm rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                          >
                            {joiningId === c.id ? "Requesting..." : "Re-apply"}
                          </button>
                        )}
                        {!memberStatus && (
                          <>
                            {enrollmentNotStarted ? (
                              <div className="text-center">
                                <p className="text-white/40 text-xs mb-1">
                                  Enrollment starts {new Date(c.enrollment_start!).toLocaleString([], { dateStyle: "short", timeStyle: "short" }).replace(",", "")}
                                </p>
                                <button
                                  disabled
                                  className="w-full py-2 bg-white/5 border border-white/10 text-white/30 text-sm rounded-full cursor-not-allowed"
                                >
                                  Join Community
                                </button>
                              </div>
                            ) : enrollmentEnded ? (
                              <div className="text-center">
                                <p className="text-red-400/80 text-xs mb-1">
                                  Enrollment closed
                                </p>
                                <button
                                  disabled
                                  className="w-full py-2 bg-white/5 border border-white/10 text-white/30 text-sm rounded-full cursor-not-allowed"
                                >
                                  Join Community
                                </button>
                              </div>
                            ) : missingPlatforms.length > 0 ? (
                              <div className="text-center">
                                <p className="text-red-400/80 text-xs mb-2">
                                  To join, add:{" "}
                                  <span className="font-semibold text-red-300">
                                    {missingPlatforms.map(formatPlatformLabel).join(", ")}
                                  </span>
                                </p>
                                <button
                                  onClick={() => setIsEditProfileOpen(true)}
                                  className="cursor-pointer w-full rounded-full py-2 text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/25 hover:bg-[var(--color-primary)]/22 transition-colors"
                                >
                                  Edit profile
                                </button>
                              </div>
                            ) : (
                              <BaseButton
                                onClick={() => setConfirmJoinCommunity(c)}
                                disabled={joiningId === c.id}
                                className="cursor-pointer w-full py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-50"
                              >
                                {joiningId === c.id ? "Requesting..." : "Join Community"}
                              </BaseButton>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/creator/communities/${c.id}`)}
                        className="cursor-pointer w-full py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
                      >
                        Open
                      </button>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {confirmJoinCommunity && (
        <ConfirmModal
          title="Join Community"
          message={`Do you want to request to join "${confirmJoinCommunity.name}"? The host will review your request.`}
          confirmLabel="Request to Join"
          loading={joiningId === confirmJoinCommunity.id}
          onConfirm={() => handleJoinConfirmed(confirmJoinCommunity.id)}
          onCancel={() => setConfirmJoinCommunity(null)}
        />
      )}

      <CreatorOnboardingModal
        isOpen={isEditProfileOpen}
        mode="edit"
        initialData={(user as any) ?? {}}
        onClose={() => setIsEditProfileOpen(false)}
        onComplete={() => {
          setIsEditProfileOpen(false);
          // Recarrega para refletir mudanças imediatas do perfil (e.g. liberar Join)
          void loadData(searchInput.trim() || undefined);
        }}
      />

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
