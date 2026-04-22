"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Community, listMyCommunities } from "@/lib/api/community";
import { getMyPlan } from "@/lib/api/plan";
import { CommunityCard } from "@/components/communities";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import BaseButton from "@/components/ui/Button";

export default function HostCommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const { showToast, hideToast, toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const planRes = await getMyPlan();
        const name = String(planRes?.plan?.name ?? "").toUpperCase();
        const active = Boolean(planRes?.is_active);
        setIsEnterprise(name === "ENTERPRISE" && active);
        setPlanChecked(true);

        if (name === "ENTERPRISE" && active) {
          const res = await listMyCommunities();
          setCommunities(res.data);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load communities", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Plan gate */}
        {planChecked && !isEnterprise && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-[var(--color-primary)]/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h2 className="text-white font-semibold text-xl mb-2">Enterprise Plan Required</h2>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Communities allow you to create exclusive spaces for your creators, manage members, publish announcements, and run exclusive campaigns. Upgrade to Enterprise to unlock this feature.
            </p>
            <button
              onClick={() => router.push("/host/plans")}
              className="cursor-pointer px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade to Enterprise
            </button>
          </div>
        )}

        {/* Header */}
        {isEnterprise && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">My Communities</h1>
            <p className="text-white/50 text-sm mt-1">
              {communities.length}/10 communities
            </p>
          </div>
          <div className="relative group">
            <BaseButton
              onClick={() => communities.length < 10 && router.push("/host/communities/create")}
              disabled={communities.length >= 10}
              variant="default"
              className={`px-6 py-2.5 text-sm font-semibold cursor-pointer ${
                communities.length >= 10 ? "opacity-50" : ""
              }`}
            >
              + Create Community
            </BaseButton>
            {communities.length >= 10 && (
              <div className="absolute top-full right-0 mt-3 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Limit of 10 communities reached
                <div className="absolute bottom-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-red-600" />
              </div>
            )}
          </div>
        </div>}

        {/* Loading */}
        {isEnterprise && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-card)] rounded-lg p-5 animate-pulse h-40" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEnterprise && !loading && communities.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white/40 text-lg mb-2">No communities yet</p>
            <p className="text-white/30 text-sm mb-6">Create your first community to start connecting with creators</p>
            <BaseButton
              onClick={() => router.push("/host/communities/create")}
              variant="default"
              className="px-6 py-2.5 text-sm font-semibold cursor-pointer"
            >
              Create Community
            </BaseButton>
          </div>
        )}

        {/* Communities grid */}
        {isEnterprise && !loading && communities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {communities.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onClick={() => router.push(`/host/communities/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
