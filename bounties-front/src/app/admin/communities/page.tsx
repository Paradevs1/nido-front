"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminCommunityListItem, adminListCommunities } from "@/lib/api/community";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

export default function AdminCommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<AdminCommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast, hideToast, toast } = useToast();

  const loadData = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminListCommunities({ page: p, limit: 20 });
      setCommunities(res.communities);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err: any) {
      showToast(err.message || "Failed to load communities", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Communities</h1>
        <p className="text-white/50 text-sm mt-1">
          {total} total communit{total !== 1 ? "ies" : "y"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <p className="text-white/40 text-center py-16">No communities found</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:py-3 sm:px-4">Name</th>
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:py-3 sm:px-4">Host</th>
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:py-3 sm:px-4">Members</th>
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:py-3 sm:px-4">Pending</th>
                  <th className="text-white/40 text-[10px] sm:text-xs font-medium uppercase py-2 px-2 sm:py-3 sm:px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/communities/${c.id}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {c.logo ? (
                            <img src={c.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/30 text-xs font-bold">
                              {c.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-white text-sm font-medium truncate max-w-[200px]">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white/60 text-sm">
                        {c.host?.name_company || c.host?.username || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white/60 text-sm">{c.members_count}</span>
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      {(c.pending_members_count ?? 0) > 0 ? (
                        <span className="text-yellow-400 text-sm font-medium">
                          {c.pending_members_count}
                        </span>
                      ) : (
                        <span className="text-white/30 text-sm">0</span>
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <span className="text-white/40 text-sm">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer px-4 py-3 sm:py-2 text-sm text-white/60 bg-white/5 rounded-lg disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-white/40 text-sm self-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer px-4 py-3 sm:py-2 text-sm text-white/60 bg-white/5 rounded-lg disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
