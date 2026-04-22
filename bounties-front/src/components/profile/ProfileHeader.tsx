"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { CreatorProfile, creatorApi } from "@/lib/api/creator";

import TwitterAvatar from "@/components/ui/TwitterAvatar";
import dynamic from "next/dynamic";
const CreatorOnboardingModal = dynamic(() => import("@/components/auth/CreatorOnboardingModal"), { ssr: false });

interface ProfileHeaderProps {
  user?: CreatorProfile | null;
  onProfileUpdate?: (updatedUser: CreatorProfile) => void;
}

export default function ProfileHeader({
  user,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(user?.description || "");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Cache local dos campos de exibição: só atualiza quando o novo valor for não-vazio.
  // Isso evita "Loading..." caso o prop `user` transite por um estado sem twitter_display_name.
  const [cachedDisplayName, setCachedDisplayName] = useState(
    user?.twitter_display_name || user?.twitter_username || ""
  );
  const [cachedUsername, setCachedUsername] = useState(user?.twitter_username || "");
  const [cachedProfileImage, setCachedProfileImage] = useState(
    user?.twitter_profile_image || ""
  );

  useEffect(() => {
    setDescription(user?.description || "");
  }, [user?.description]);

  useEffect(() => {
    const name = user?.twitter_display_name || user?.twitter_username;
    if (name) setCachedDisplayName(name);
  }, [user?.twitter_display_name, user?.twitter_username]);

  useEffect(() => {
    if (user?.twitter_username) setCachedUsername(user.twitter_username);
  }, [user?.twitter_username]);

  useEffect(() => {
    if (user?.twitter_profile_image) setCachedProfileImage(user.twitter_profile_image);
  }, [user?.twitter_profile_image]);

  const handleSaveDescription = async () => {
    if (!user) return;

    setIsSavingDescription(true);
    try {
      await creatorApi.updateProfile({ description });
      setIsEditingDescription(false);
      if (onProfileUpdate) {
        onProfileUpdate({
          ...user,
          description: description,
        });
      }
    } catch (error: unknown) {
      console.error("Erro ao salvar descrição:", error);
      setErrorMessage("Erro ao salvar descrição. Tente novamente.");
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(user?.description || "");
    setIsEditingDescription(false);
  };

  const totalEarnings = user?.quantity_winner_dolar || 0;
  const participatedCampaigns = user?.submittedCampaignsCount || 0;
  const totalWins = user?.quantity_winner || 0;

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between w-full overflow-hidden">
        <div className="flex items-start gap-4 flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            <TwitterAvatar
              src={cachedProfileImage || user?.twitter_profile_image}
              alt={cachedDisplayName || ""}
              className="object-cover scale-110"
              fill
            />
          </div>

          <div className="flex-1 min-w-0 max-w-full overflow-hidden">
            <div className="mb-2">
              <div className="flex items-center gap-2 flex-nowrap">
                <h1 className="text-white text-2xl font-bold break-words min-w-0">
                  {cachedDisplayName || "..."}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="flex-shrink-0 text-white hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                  title="Edit profile"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-sm break-words">
                {cachedUsername ? `@${cachedUsername}` : ""}
              </p>
            </div>

            {/* Seção de Descrição */}
            <div className="mb-3 w-full max-w-full overflow-hidden">
              {isEditingDescription ? (
                <div className="space-y-2 w-full max-w-full">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description about you..."
                    className="w-full max-w-full bg-transparent text-white placeholder:text-gray-500 pl-0 pr-0 py-2.5 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all resize-none text-sm break-words"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleSaveDescription}
                      disabled={isSavingDescription}
                      className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer text-sm font-medium"
                    >
                      {isSavingDescription ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingDescription}
                      className="px-4 py-1.5 bg-transparent text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <span className="text-gray-400 text-xs ml-auto">
                      {description.length}/500
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative group w-full max-w-full overflow-hidden">
                  <div
                    className="bg-transparent rounded-xl px-0 py-3 cursor-pointer hover:bg-white/5 transition-colors min-h-[44px] flex items-center w-full max-w-full overflow-hidden"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {user?.description ? (
                      <p className="text-white/80 text-sm break-all w-full max-w-full">
                        {user.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic w-full max-w-full break-words">
                        Click to add a description about you...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-white/60 hover:text-[var(--color-primary)] cursor-pointer z-10"
                    title="Edit description"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/50 rounded-full mb-2">
                <p className="text-red-400 text-xs">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center w-full md:w-auto">
            <div className="bg-[var(--color-card)] rounded-2xl p-6">
              <p className="text-md text-white mb-1">Total Earn</p>
              <p className="text-3xl font-bold text-white">
                ${totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-2xl p-6">
              <p className="text-md text-white mb-1">Participants</p>
              <p className="text-3xl font-bold text-white">
                {participatedCampaigns}
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-2xl p-6">
              <p className="text-md text-white mb-1">Earnings</p>
              <p className="text-3xl font-bold text-white">{totalWins}</p>
            </div>
        </div>
      </div>

      <CreatorOnboardingModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onComplete={(updatedUser) => {
          if (updatedUser && onProfileUpdate) {
            onProfileUpdate(updatedUser);
          }
          setIsEditProfileModalOpen(false);
        }}
        mode="edit"
        initialData={user ?? undefined}
      />
    </div>
  );
}
