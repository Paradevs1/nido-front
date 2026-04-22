"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Campaign } from "@/lib/api/campaign";
import { creatorApi, CreatorProfile } from "@/lib/api/creator";
import ProfileWallets from "@/components/profile/ProfileWallets";
import dynamic from "next/dynamic";
import { FiImage, FiX } from "react-icons/fi";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSubmitted?: () => void;
}

export default function SubmissionModal({
  isOpen,
  onClose,
  campaign,
  onSubmitted,
}: SubmissionModalProps) {
  const router = useRouter();
  const [showCongrats, setShowCongrats] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletsModal, setShowWalletsModal] = useState(false);
  const [checkAnimation, setCheckAnimation] = useState<any>(null);
  const [walletsFromError, setWalletsFromError] = useState<{
    wallet_evm?: string;
    wallet_sol?: string;
    wallet_sui?: string;
    wallet_stellar?: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<CreatorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const MAX_IMAGES = 5;
  const MAX_IMAGE_SIZE_MB = 5;

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    setImageError(null);
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const incoming = Array.from(files);
    if (images.length + incoming.length > MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    for (const f of incoming) {
      if (!allowed.includes(f.type)) {
        setImageError("Only JPEG, PNG, GIF or WEBP images are accepted.");
        return;
      }
      if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImageError(`Each image must be under ${MAX_IMAGE_SIZE_MB} MB.`);
        return;
      }
    }
    const dataUrls = await Promise.all(incoming.map(fileToDataUrl));
    setImages((prev) => [...prev, ...dataUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  const submissionTypes = (campaign?.submission_format || []).map((s) => s.type?.toLowerCase());
  const contentTypes = (campaign?.content_format || []).map((c) => c.type?.toLowerCase());
  const hasFeedback = submissionTypes.includes("feedback");
  const isFeedbackOnly =
    (submissionTypes.length === 1 && submissionTypes[0] === "feedback") ||
    (hasFeedback && contentTypes.length === 1 && contentTypes[0] === "feedback");

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await creatorApi.getProfile();
      setUserProfile(profile);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (showWalletsModal && !userProfile) {
      fetchUserProfile();
    }
  }, [showWalletsModal, userProfile]);

  useEffect(() => {
    if (!isOpen) {
      setFeedbackText("");
      setImages([]);
      setImageError(null);
      return;
    }
    if (isFeedbackOnly) {
      creatorApi.getCampaignSubmission(campaign.id).then((submission) => {
        if (submission?.submission_feedback != null) {
          setFeedbackText(submission.submission_feedback);
        }
      }).catch(() => {});
    }
  }, [isOpen, campaign.id, isFeedbackOnly]);

  useEffect(() => {
    // Carregar animação de sucesso
    const loadAnimation = async () => {
      try {
        const checkRes = await fetch("/assets/motion/check-motion.json");
        const checkData = await checkRes.json();
        setCheckAnimation(checkData);
      } catch (error) {
        console.error("Error loading animation:", error);
      }
    };
    loadAnimation();
  }, []);

  const supports = useMemo(() => {
    const types = (campaign?.submission_format || []).map((s) =>
      s.type?.toLowerCase()
    );
    return {
      twitter: types.includes("twitter"),
      instagram: types.includes("instagram"),
      tiktok: types.includes("tiktok"),
      youtube: types.includes("youtube"),
    };
  }, [campaign]);

  const availableFormats = useMemo(() => {
    const formats = [];
    if (supports.twitter) formats.push({ value: "twitter", label: "Twitter" });
    if (supports.instagram) formats.push({ value: "instagram", label: "Instagram" });
    if (supports.tiktok) formats.push({ value: "tiktok", label: "TikTok" });
    if (supports.youtube) formats.push({ value: "youtube", label: "YouTube" });
    return formats;
  }, [supports]);

  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [submissionTwitter, setSubmissionTwitter] = useState("");
  const [submissionInstagram, setSubmissionInstagram] = useState("");
  const [submissionTiktok, setSubmissionTiktok] = useState("");
  const [submissionYoutube, setSubmissionYoutube] = useState("");

  // Inicializar com o primeiro formato disponível
  useEffect(() => {
    if (availableFormats.length > 0 && !selectedFormat) {
      setSelectedFormat(availableFormats[0].value);
    }
  }, [availableFormats, selectedFormat]);

  const canSubmit = useMemo(() => {
    if (isFeedbackOnly) return feedbackText.trim().length > 0;
    if (!selectedFormat) return false;
    switch (selectedFormat) {
      case "twitter":
        return submissionTwitter.trim().length > 0;
      case "instagram":
        return submissionInstagram.trim().length > 0;
      case "tiktok":
        return submissionTiktok.trim().length > 0;
      case "youtube":
        return submissionYoutube.trim().length > 0;
      default:
        return false;
    }
  }, [isFeedbackOnly, feedbackText, selectedFormat, submissionTwitter, submissionInstagram, submissionTiktok, submissionYoutube]);

  if (!isOpen) return null;

  const getCurrentSubmissionUrl = () => {
    switch (selectedFormat) {
      case "twitter":
        return submissionTwitter;
      case "instagram":
        return submissionInstagram;
      case "tiktok":
        return submissionTiktok;
      case "youtube":
        return submissionYoutube;
      default:
        return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setShowConfirmation(false);

      const submission_data = isFeedbackOnly
        ? {
            submission_data: {
              submission_twitter: "",
              submission_tiktok: "",
              submission_instagram: "",
              submission_youtube: "",
              submission_feedback: feedbackText.trim(),
            },
          }
        : {
            submission_twitter: submissionTwitter,
            submission_tiktok: submissionTiktok,
            submission_instagram: submissionInstagram,
            submission_youtube: submissionYoutube,
            ...(images.length > 0 && { submissions_images: images }),
          };

      const response = await creatorApi.submitCampaign(
        campaign.id,
        submission_data
      );

      const msg = (response.message ?? "").trim().toLowerCase();
      if (msg === "error_solana") {
        setWalletsFromError({
          wallet_sol: response.wallet_sol || undefined,
        });
        setShowWalletsModal(true);
      } else if (msg === "error_sui") {
        setWalletsFromError({
          wallet_sui: response.wallet_sui || undefined,
        });
        setShowWalletsModal(true);
      } else if (msg === "error_evm") {
        setWalletsFromError({
          wallet_evm: response.wallet_evm || undefined,
        });
        setShowWalletsModal(true);
      } else if (msg === "error_stellar") {
        setWalletsFromError({
          wallet_stellar: response.wallet_stellar || undefined,
        });
        setShowWalletsModal(true);
      } else {
        setShowCongrats(true);
        if (onSubmitted) onSubmitted();
      }
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToCampaigns = () => {
    setShowCongrats(false);
    onClose();
    router.push("/creator");
  };

  // Renderizar CongratsModal quando showCongrats for true
  if (showCongrats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={handleGoToCampaigns}
        />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-2xl w-full p-8 mx-4 my-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Congrats</h2>
            <p className="text-gray-300 text-lg">Submission sent, good luck!</p>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48">
              {checkAnimation ? (
                <Lottie
                  animationData={checkAnimation}
                  loop={false}
                  autoplay={true}
                />
              ) : (
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Button */}
          <div className="mb-8">
            <Button
              onClick={handleGoToCampaigns}
              className="w-full py-4 font-bold border-2 border-[var(--color-primary)] cursor-pointer"
            >
              GO TO CAMPAIGNS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar ConfirmationModal quando showConfirmation for true
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => setShowConfirmation(false)}
        />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-lg w-full p-8 mx-4 my-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Confirm Submission</h2>
            <p className="text-gray-300 text-sm">
              {isFeedbackOnly ? "Please verify your feedback before submitting" : "Please verify the link before submitting"}
            </p>
          </div>

          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="mb-6">
            {isFeedbackOnly ? (
              <>
                <p className="text-white text-center mb-4">Your feedback:</p>
                <textarea
                  readOnly
                  value={feedbackText.trim()}
                  rows={8}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-3 text-white text-sm whitespace-pre-wrap resize-y min-h-[120px] focus:outline-none focus:border-gray-500"
                />
              </>
            ) : (
              <>
                <p className="text-white text-center mb-4">
                  Are you sure you want to submit using this link?
                </p>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1 uppercase">{selectedFormat}</p>
                  <p className="text-white text-sm break-all">{getCurrentSubmissionUrl()}</p>
                </div>
                {images.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {images.slice(0, 3).map((src, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-700 overflow-hidden bg-gray-800">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {images.length} proof image{images.length > 1 ? "s" : ""} attached
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-yellow-400 text-xs text-center mb-6">
            ⚠️ Submissions cannot be edited after they are sent
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 py-3 font-bold cursor-pointer bg-transparent border-2 border-gray-600 hover:bg-gray-800 rounded-full transition-all text-white"
            >
              CANCEL
            </button>
            <Button
              onClick={handleConfirmSubmit}
              className="flex-1 py-3 font-bold cursor-pointer"
              variant="white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "CONFIRM"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto mx-4 my-8">
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-white mb-2">
            You're one step away
          </h2>
          <p className="text-gray-300 text-sm">
            {isFeedbackOnly ? "Share your feedback for this campaign." : "From submitting your content."}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isFeedbackOnly ? (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Your feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Write your feedback here..."
                  rows={5}
                  className="w-full bg-transparent border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-y min-h-[120px]"
                />
              </div>
            ) : (
              <>
            {/* Dropdown para selecionar o formato */}
            {availableFormats.length > 0 && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Submission Format
                </label>
                <div className="relative">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-gray-500 pr-10"
                  >
                    {availableFormats.map((format) => (
                      <option
                        key={format.value}
                        value={format.value}
                        className="bg-[var(--color-card)]"
                      >
                        {format.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Input relacionado ao formato selecionado */}
            {selectedFormat === "twitter" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={submissionTwitter}
                  onChange={(e) => setSubmissionTwitter(e.target.value)}
                  placeholder="https://x.com/username/status/123"
                  className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
            )}

            {selectedFormat === "instagram" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={submissionInstagram}
                  onChange={(e) => setSubmissionInstagram(e.target.value)}
                  placeholder="https://www.instagram.com/p/xyz/"
                  className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
            )}

            {selectedFormat === "tiktok" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={submissionTiktok}
                  onChange={(e) => setSubmissionTiktok(e.target.value)}
                  placeholder="https://www.tiktok.com/@user/video/123"
                  className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
            )}

            {selectedFormat === "youtube" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={submissionYoutube}
                  onChange={(e) => setSubmissionYoutube(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
            )}

            {/* Image upload — apenas para Instagram (Stories sem URL pública) */}
            {selectedFormat === "instagram" && (
              <div className="pt-1">
                <label className="block text-sm text-gray-400 mb-2">
                  Proof images <span className="text-gray-500 text-xs">(optional · up to {MAX_IMAGES} · max {MAX_IMAGE_SIZE_MB} MB each)</span>
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-gray-800">
                        <img src={src} alt={`proof ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 cursor-pointer bg-black/60 hover:bg-black/80 rounded-full p-0.5 text-white transition-colors"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-600 hover:border-gray-400 rounded-2xl text-gray-400 hover:text-white transition-all">
                    <FiImage className="w-4 h-4" />
                    <span className="text-sm">Add image{images.length > 0 ? " · " + images.length + "/" + MAX_IMAGES : ""}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageFiles(e.target.files)}
                    />
                  </label>
                )}

                {imageError && (
                  <p className="text-red-400 text-xs mt-2">{imageError}</p>
                )}
              </div>
            )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <p className="text-gray-300 text-sm">
              <b className="text-red-500">*</b> Before submitting your content, please double-check everything.
              Submissions cannot be edited after they are sent.
            </p>

            <Button
              type="submit"
              className="w-full py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              variant="white"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Submitting..." : "SUBMIT NOW"}
            </Button>
          </form>
        </div>
      </div>
      <WalletsRequiredModal
        isOpen={showWalletsModal}
        onClose={() => setShowWalletsModal(false)}
        wallets={walletsFromError}
      />
    </div>
  );
}

function WalletsForm({
  user,
  detectedWallets,
  onClose,
}: {
  user: CreatorProfile | null;
  detectedWallets?: {
    wallet_evm?: string;
    wallet_sol?: string;
    wallet_sui?: string;
    wallet_stellar?: string;
  } | null;
  onClose?: () => void;
}) {
  const showEvm = detectedWallets && "wallet_evm" in detectedWallets;
  const showSolana = detectedWallets && "wallet_sol" in detectedWallets;
  const showSui = detectedWallets && "wallet_sui" in detectedWallets;
  const showStellar = detectedWallets && "wallet_stellar" in detectedWallets;

  const [evmWallet, setEvmWallet] = useState(
    detectedWallets?.wallet_evm || user?.wallet_evm || ""
  );
  const [solanaWallet, setSolanaWallet] = useState(
    detectedWallets?.wallet_sol || user?.wallet_sol || ""
  );
  const [suiWallet, setSuiWallet] = useState(
    detectedWallets?.wallet_sui || user?.wallet_sui || ""
  );
  const [stellarWallet, setStellarWallet] = useState(
    detectedWallets?.wallet_stellar || user?.wallet_stellar || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (showEvm) {
      setEvmWallet(detectedWallets?.wallet_evm || user?.wallet_evm || "");
    }
    if (showSolana) {
      setSolanaWallet(detectedWallets?.wallet_sol || user?.wallet_sol || "");
    }
    if (showSui) {
      setSuiWallet(detectedWallets?.wallet_sui || user?.wallet_sui || "");
    }
    if (showStellar) {
      setStellarWallet(detectedWallets?.wallet_stellar || user?.wallet_stellar || "");
    }
  }, [user, detectedWallets, showEvm, showSolana, showSui, showStellar]);

  const validateWalletAddress = (address: string, type: string) => {
    if (!address.trim()) return true;

    switch (type) {
      case "evm":
        return address.match(/^0x[a-fA-F0-9]{40}$/);
      case "solana":
        return address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
      case "sui":
        return address.match(/^0x[a-fA-F0-9]{64}$/);
      case "stellar":
        return address.match(/^G[A-Z2-7]{55}$/);
      default:
        return true;
    }
  };

  const handleSaveWallets = async () => {
    if (!showEvm && !showSolana && !showSui && !showStellar) {
      setSuccess("All wallets are already configured!");
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
      return;
    }

    if (showEvm && !validateWalletAddress(evmWallet, "evm")) {
      setError(
        "Invalid EVM address format. Use a valid Ethereum address (0x...)"
      );
      return;
    }

    if (showSolana && !validateWalletAddress(solanaWallet, "solana")) {
      setError(
        "Invalid Solana address format. Use a valid Solana address (base58)"
      );
      return;
    }

    if (showSui && !validateWalletAddress(suiWallet, "sui")) {
      setError("Invalid SUI address format. Use a valid SUI address (0x...)");
      return;
    }

    if (showStellar && !validateWalletAddress(stellarWallet, "stellar")) {
      setError(
        "Invalid Stellar address format. Use a valid Stellar address (inicia com G...)"
      );
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const walletData: Record<string, string> = {};
      if (showEvm && evmWallet.trim()) walletData.wallet_evm = evmWallet.trim();
      else if (user?.wallet_evm) walletData.wallet_evm = user.wallet_evm;
      if (showSolana && solanaWallet.trim()) walletData.wallet_sol = solanaWallet.trim();
      else if (user?.wallet_sol) walletData.wallet_sol = user.wallet_sol;
      if (showSui && suiWallet.trim()) walletData.wallet_sui = suiWallet.trim();
      else if (user?.wallet_sui) walletData.wallet_sui = user.wallet_sui;
      if (showStellar && stellarWallet.trim()) walletData.wallet_stellar = stellarWallet.trim();
      else if (user?.wallet_stellar) walletData.wallet_stellar = user.wallet_stellar;

      const response = await creatorApi.insertWallets(walletData as any);

      setSuccess(response.message);

      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      console.error("Error saving wallets:", err);
      setError("Error saving wallets");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-card)] rounded-3xl p-6 h-fit">
      <h2 className="text-white text-xl font-bold mb-4">WALLETS</h2>

      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/50 rounded-2xl">
          <p className="text-green-400 text-xs">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* EVM Wallet - só mostra se não detectada */}
        {showEvm && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              EVM Wallet Address
            </label>
            <input
              type="text"
              value={evmWallet}
              onChange={(e) => setEvmWallet(e.target.value)}
              placeholder="0x..."
              maxLength={42}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            />
          </div>
        )}

        {/* Solana Wallet - só mostra se não detectada */}
        {showSolana && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Solana Wallet Address
            </label>
            <input
              type="text"
              value={solanaWallet}
              onChange={(e) => setSolanaWallet(e.target.value)}
              placeholder="HT..."
              maxLength={44}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            />
          </div>
        )}

        {/* SUI Wallet - só mostra se não detectada */}
        {showSui && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              SUI Wallet Address
            </label>
            <input
              type="text"
              value={suiWallet}
              onChange={(e) => setSuiWallet(e.target.value)}
              placeholder="0x..."
              maxLength={66}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            />
          </div>
        )}

        {/* Stellar Wallet - só mostra se não detectada */}
        {showStellar && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Stellar Wallet Address
            </label>
            <input
              type="text"
              value={stellarWallet}
              onChange={(e) => setStellarWallet(e.target.value)}
              placeholder="G..."
              maxLength={56}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            />
          </div>
        )}

        {/* Mostra mensagem se todas as carteiras estão detectadas */}
        {!showEvm && !showSolana && !showSui && !showStellar && (
          <div className="text-center py-4">
            <p className="text-green-400 text-sm">
              All wallets are already configured!
            </p>
          </div>
        )}

        {/* Save Button - só mostra se há carteiras para configurar */}
        {(showEvm || showSolana || showSui || showStellar) && (
          <div className="pt-2">
            <Button
              onClick={handleSaveWallets}
              className="w-full px-4 py-2 text-sm font-medium cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Wallets"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WalletsRequiredModal({
  isOpen,
  onClose,
  wallets,
}: {
  isOpen: boolean;
  onClose: () => void;
  wallets?: {
    wallet_evm?: string;
    wallet_sol?: string;
    wallet_sui?: string;
    wallet_stellar?: string;
  } | null;
}) {
  const [userProfile, setUserProfile] = useState<CreatorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (isOpen && !userProfile) {
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          const profile = await creatorApi.getProfile();
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 mx-4 my-8">
        <h2 className="text-xl font-bold text-white mb-2">Wallets Required</h2>
        <p className="text-gray-300 mb-4 text-sm">
          You need to configure the required wallet to submit campaigns.
        </p>

        {loadingProfile ? (
          <div className="text-center py-4">
            <p className="text-white text-sm">Loading profile...</p>
          </div>
        ) : (
          <WalletsForm
            user={userProfile}
            detectedWallets={wallets}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
