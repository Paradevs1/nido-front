"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileWallets from "@/components/profile/ProfileWallets";
import ProfileSubmissions from "@/components/profile/ProfileSubmissions";
import TransactionsModal from "@/components/profile/TransactionsModal";
import { creatorApi, CreatorProfile } from "@/lib/api/creator";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  // Incrementar para disparar re-fetch do perfil (ex: após edição)
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const isInitial = fetchKey === 0;

    const fetchProfile = async () => {
      try {
        setError(null);
        const profile = await creatorApi.getProfile();
        if (!cancelled) setUser(profile);
      } catch (err: unknown) {
        if (!cancelled && isInitial) setError("Error loading profile");
      } finally {
        if (!cancelled && isInitial) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [fetchKey]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-32">
          <div className="max-w-8xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse"></div>
                    <div>
                      <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[var(--color-card)] rounded-2xl p-6 min-w-[140px] animate-pulse"
                      >
                        <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                        <div className="h-8 w-16 bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[var(--color-card)] rounded-3xl p-6 h-96 animate-pulse">
                  <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-700 rounded-2xl"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="bg-[var(--color-card)] rounded-3xl p-6 h-fit">
                  <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-12 w-full bg-gray-700 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                    <div className="h-10 w-full bg-gray-700 rounded-full animate-pulse mt-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">
            Error loading profile
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-6 order-1 xl:order-1 xl:col-span-3">
              <ProfileHeader
                user={user}
                onProfileUpdate={() => setFetchKey(k => k + 1)}
              />
            </div>

            <div className="order-2 xl:order-3 xl:col-span-1 space-y-4">
              <div className="mb-6">
                <button
                  onClick={() => setIsTransactionsModalOpen(true)}
                  className="w-full px-4 py-3 text-sm font-medium cursor-pointer rounded-2xl text-white transition-all hover:opacity-85"
                  style={{
                    background:
                      "linear-gradient(135deg, #1c3444 0%, #0f2530 100%)",
                    border: "none",
                  }}
                >
                  View Transactions
                </button>
              </div>
              <ProfileWallets user={user} />
            </div>

            <div className="space-y-6 order-3 xl:order-2 xl:col-span-2">
              <ProfileSubmissions />
            </div>
          </div>
        </div>
      </main>

      {/* Transactions Modal */}
      <TransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
      />
    </div>
  );
}
