"use client";

import { useEffect, useState } from "react";
import { creatorApi, WelcomeInfo, CreatorProfile } from "@/lib/api/creator";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BRAND_DISPLAY_NAME } from "@/lib/branding/links";

export default function WelcomeBanner() {
  const [welcomeInfo, setWelcomeInfo] = useState<WelcomeInfo | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWelcomeInfo = async () => {
      try {
        setLoading(true);
        try {
          const info = await creatorApi.getTwitterInfo();
          setWelcomeInfo(info);
        } catch (welcomeErr) {
          const profileData = await creatorApi.getProfile();
          setProfile(profileData);
          setWelcomeInfo({
            twitter_display_name: profileData.twitter_display_name || "",
            twitter_profile_image: profileData.twitter_profile_image || "",
          });
        }
      } catch (err) {
        if (user?.username) {
          setWelcomeInfo({
            twitter_display_name: user.username,
            twitter_profile_image: user.avatar || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeInfo();
  }, [user]);

  const username =
    profile?.twitter_display_name ||
    welcomeInfo?.twitter_display_name ||
    profile?.twitter_username ||
    user?.username ||
    "there";
  const profileImageRaw =
    welcomeInfo?.twitter_profile_image ||
    profile?.twitter_profile_image ||
    user?.avatar ||
    "";

  const profileImage =
    profileImageRaw && profileImageRaw.trim() !== ""
      ? profileImageRaw.replace("_normal", "_400x400") || profileImageRaw
      : null;
  
  const fallbackImage = "/assets/twitterProfile/twitterIconSubstitute.svg";

  if (loading && !user?.username) {
    return null;
  }

  return (
    <div className="mb-8">
      <div
        className="rounded-2xl p-6 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #031825 0%, #031825 100%)",
          border: "1px solid #26485E",
        }}
      >
        {/* Imagem de perfil do Twitter */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden relative">
          {profileImage && !imageError ? (
            <img
              src={profileImage}
              alt={`${username} profile`}
              className="w-full h-full object-cover rounded-full"
              style={{
                imageRendering: "-webkit-optimize-contrast",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                filter: "contrast(1.1) saturate(1.1) brightness(1.02)",
                willChange: "transform",
              }}
              loading="eager"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={fallbackImage}
              alt={`${username} profile`}
              className="w-full h-full object-cover rounded-full"
              loading="eager"
            />
          )}
        </div>

        {/* Texto de boas-vindas */}
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-1">
            Welcome, {username}
          </h3>
          <p className="text-gray-400 text-sm">
            {`Have you seen today's opportunities to earn on ${BRAND_DISPLAY_NAME}?`}
          </p>
        </div>
      </div>
    </div>
  );
}
