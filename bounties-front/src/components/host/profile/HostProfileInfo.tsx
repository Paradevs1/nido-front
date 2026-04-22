"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button as BaseButton } from "@/components/ui";
import EditProfileModal from "./EditProfileModal";
import { getHostProfile, HostProfile, updateHostProfile } from "@/lib/api/host";

interface HostProfileInfoProps {
  onCreateClick?: () => void;
}

export default function HostProfileInfo({ onCreateClick }: HostProfileInfoProps) {
  const [profileData, setProfileData] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getHostProfile();
        setProfileData(data);
      } catch (err: unknown) {
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleHostUpdate = async (updatedData: Partial<HostProfile>) => {
    if (!profileData) return;

    try {
      const updatedProfile = await updateHostProfile(updatedData);
      setProfileData(updatedProfile);
      setIsEditModalOpen(false); // Close modal on success
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      // Optionally, show an error message to the user
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profileData) {
    return <div>No profile data found.</div>;
  }

  const {
    username,
    name_company,
    logo_company,
    twitter_profile_image,
    twitter_username,
    social_media,
    totalDistribuido,
    campaigns_created,
  } = profileData;

  const socialLinks = {
    twitter:
      social_media?.find((s) => s.type === "twitter")?.url ||
      (twitter_username ? `https://twitter.com/${twitter_username}` : ""),
    telegram: social_media?.find((s) => s.type === "telegram")?.url,
    discord: social_media?.find((s) => s.type === "discord")?.url,
    website: profileData.website_company,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-gray-400 text-sm">
        <a
          href="/host/campaigns"
          className="hover:text-white transition-colors"
        >
          <span>Campaigns</span>
        </a>
        <span className="mx-1">&gt;</span>
        <a
          href="/host/profile"
          className="text-white underline-offset-2 hover:underline"
        >
          My Profile
        </a>
      </div>

      {/* Profile Card */}
      <div className="relative p-6 text-center">
        {/* Edit icon only, top-right */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 text-white hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>

        {/* Centered avatar */}
        <div className="w-20 h-20 rounded-full bg-green-400 mx-auto flex items-center justify-center">
          {logo_company || twitter_profile_image ? (
            <img
              src={logo_company || twitter_profile_image}
              alt={username || "Host"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl">🦜</span>
          )}
        </div>

        {/* Centered name and company */}
        <h2 className="text-2xl font-bold text-white mt-4">
          {username || "Host"}
        </h2>
        <p className="text-gray-300 text-sm mt-1">
          Company: {name_company || "N/A"}
        </p>

        {/* Social Media Icons */}
        <div className="flex items-center justify-center gap-3 mb-6 mt-4">
          {/* Twitter/X */}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-blue-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}

          {/* Discord */}
          {socialLinks.discord && (
            <a
              href={socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          )}

          {/* Telegram */}
          {socialLinks.telegram && (
            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-blue-400 transition-colors"
            ></a>
          )}

          {/* Website */}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-[var(--color-card)] rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Distributed</p>
            <p className="text-white text-2xl font-bold">
              ${totalDistribuido.toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--color-card)] rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">Campaigns Created</p>
            <p className="text-white text-2xl font-bold">
              {campaigns_created ?? 0}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-6">
          {onCreateClick ? (
            <BaseButton 
              onClick={onCreateClick}
              className="w-full px-4 py-3 font-bold cursor-pointer"
            >
              CREATE NEW CAMPAIGN NOW
            </BaseButton>
          ) : (
            <Link href="/host/campaign/create">
              <BaseButton className="w-full px-4 py-3 font-bold cursor-pointer">
                CREATE NEW CAMPAIGN NOW
              </BaseButton>
            </Link>
          )}
          <Link href="/host/campaign/manage">
            <BaseButton
              variant="outline"
              className="w-full px-4 py-3 font-bold cursor-pointer"
            >
              MANAGE CAMPAIGNS
            </BaseButton>
          </Link>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        host={profileData}
        onUpdate={handleHostUpdate}
      />
    </div>
  );
}
