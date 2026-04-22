"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Campaign } from "@/lib/api/campaign";
import { creatorApi, CreatorProfile, CampaignParticipantResponse } from "@/lib/api/creator";
import { useAuth } from "@/lib/contexts/AuthContext";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { FiPlus, FiTrash2, FiImage, FiX } from "react-icons/fi";
import { WalletsRequiredModal } from "./SubmissionModal";

interface PrivateSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSubmitted?: () => void;
}

export default function PrivateSubmissionModal({
  isOpen,
  onClose,
  campaign,
  onSubmitted,
}: PrivateSubmissionModalProps) {
  const router = useRouter();
  const { user } = useAuth();
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
  const [existingLinks, setExistingLinks] = useState<string[]>([]);
  const [isLoadingExistingLinks, setIsLoadingExistingLinks] = useState(false);
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

  // submission_format e content_format apenas "feedback" → mostrar textarea em vez de links
  const submissionTypes = campaign.submission_format?.map((s) => s.type?.toLowerCase()) ?? [];
  const contentTypes = campaign.content_format?.map((c) => c.type?.toLowerCase()) ?? [];
  const isFeedbackOnly =
    submissionTypes.length === 1 &&
    submissionTypes[0] === "feedback" &&
    contentTypes.length === 1 &&
    contentTypes[0] === "feedback";

  // Links management - quantidade de slots entre qtd_min_links e qtd_max_links
  const [links, setLinks] = useState<string[]>([""]);

  useEffect(() => {
    // Load success animation
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

  // Função para carregar links existentes
  const loadExistingLinks = async () => {
    try {
      setIsLoadingExistingLinks(true);
      
      // Tentar carregar do localStorage primeiro (fallback)
      const storedKey = `campaign_${campaign.id}_submission_links`;
      const storedLinks = localStorage.getItem(storedKey);
      
      // Buscar submissão usando a nova rota específica para creators
      try {
        console.log("Calling creatorApi.getCampaignSubmission for campaign:", campaign.id);
        const submission = await creatorApi.getCampaignSubmission(campaign.id);
        console.log("Submission response:", submission);
        
        if (submission?.submission_feedback != null) {
          setFeedbackText(submission.submission_feedback);
        }
        if (submission && submission.submissions_kols && submission.submissions_kols.length > 0) {
          console.log("Loading existing links from API:", submission.submissions_kols);
          setExistingLinks(submission.submissions_kols);
          // Garantir entre qtd_min_links e qtd_max_links slots
          let arr = [...submission.submissions_kols];
          const minSlots = Math.max(1, campaign.qtd_min_links ?? 1);
          const maxSlots = campaign.qtd_max_links ?? 999;
          if (arr.length < minSlots) {
            arr = [...arr, ...Array(minSlots - arr.length).fill("")];
          }
          setLinks(arr.slice(0, maxSlots));
          localStorage.setItem(storedKey, JSON.stringify(submission.submissions_kols));
        } else if (submission) {
          setExistingLinks([]);
          setLinks(Array(Math.max(1, campaign.qtd_min_links ?? 1)).fill(""));
        } else {
          // Se não tem submissão, tentar localStorage
          if (storedLinks) {
            try {
              const parsedLinks = JSON.parse(storedLinks);
              if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
                setExistingLinks(parsedLinks);
                let arr = [...parsedLinks];
                const minSlots = Math.max(1, campaign.qtd_min_links ?? 1);
                const maxSlots = campaign.qtd_max_links ?? 999;
                if (arr.length < minSlots) {
                  arr = [...arr, ...Array(minSlots - arr.length).fill("")];
                }
                setLinks(arr.slice(0, maxSlots));
              } else {
                setExistingLinks([]);
                setLinks(Array(Math.max(1, campaign.qtd_min_links ?? 1)).fill(""));
              }
            } catch (e) {
              setExistingLinks([]);
              setLinks(Array(Math.max(1, campaign.qtd_min_links ?? 1)).fill(""));
            }
          } else {
            setExistingLinks([]);
            setLinks(Array(Math.max(1, campaign.qtd_min_links ?? 1)).fill(""));
          }
        }
        } catch (apiError: any) {
          console.error("Error loading from API:", apiError);
          // Se falhar a API (404 = não encontrado), tentar localStorage
          if (apiError.response?.status === 404 || !storedLinks) {
          setExistingLinks([]);
          setLinks([""]);
        } else if (storedLinks) {
          try {
            const parsedLinks = JSON.parse(storedLinks);
            if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
              setExistingLinks(parsedLinks);
              setLinks([...parsedLinks]);
            } else {
              setExistingLinks([]);
              setLinks([""]);
            }
          } catch (e) {
            setExistingLinks([]);
            setLinks([""]);
          }
        }
      }
    } catch (err) {
      console.error("Error loading existing links:", err);
      setExistingLinks([]);
      setLinks(Array(Math.max(1, campaign.qtd_min_links ?? 1)).fill(""));
    } finally {
      setIsLoadingExistingLinks(false);
    }
  };

  const minSlots = Math.max(1, campaign?.qtd_min_links ?? 1);
  const maxSlots = campaign?.qtd_max_links ?? 999;

  // Carregar links existentes quando o modal abrir
  useEffect(() => {
    if (!isOpen) {
      setLinks(Array(minSlots).fill(""));
      setExistingLinks([]);
      setFeedbackText("");
      setImages([]);
      setImageError(null);
      setError(null);
      return;
    }

    // Extrair userId de forma mais robusta - o user pode ter id como propriedade direta
    const userId = user ? (user.id || (user as any).id || (user as any)._id) : null;
    console.log("Modal useEffect triggered:", { 
      isOpen, 
      userId, 
      user, 
      userKeys: user ? Object.keys(user) : null, 
      campaignId: campaign.id,
      userHasId: user ? 'id' in user : false
    });
    
    if (userId) {
      console.log("Calling loadExistingLinks with userId:", userId);
      loadExistingLinks();
    } else {
      console.log("Modal open but userId is missing:", { user, userId, userType: typeof user });
    }
  }, [isOpen, campaign.id, user]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleRemoveLink = (index: number) => {
    // Sempre permitir remover, mas manter pelo menos 1 campo vazio se necessário
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    } else {
      // Se só tem 1 link, limpar o campo ao invés de remover completamente
      setLinks([""]);
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const validLinks = links.filter((link) => link.trim().length > 0);
  
  // O total de links será o número de links válidos que o usuário está enviando
  // (que pode incluir links editados + novos links)
  const totalLinks = validLinks.length;
  
  // Validar: modo feedback = texto preenchido; modo links = regras de min/max
  const canSubmit = isFeedbackOnly
    ? feedbackText.trim().length > 0
    : validLinks.length > 0 &&
      (!campaign.qtd_min_links || totalLinks >= campaign.qtd_min_links) &&
      (!campaign.qtd_max_links || totalLinks <= campaign.qtd_max_links);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFeedbackOnly) {
      setError(null);
      setShowConfirmation(true);
      return;
    }
    // Validação de quantidade mínima e máxima (modo links)
    if (campaign.qtd_min_links && totalLinks < campaign.qtd_min_links) {
      setError(`You must submit at least ${campaign.qtd_min_links} link(s). Currently: ${totalLinks}`);
      return;
    }
    if (campaign.qtd_max_links && totalLinks > campaign.qtd_max_links) {
      setError(`You can submit a maximum of ${campaign.qtd_max_links} link(s). Currently: ${totalLinks}. Please remove some links.`);
      return;
    }
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setShowConfirmation(false);

      const submission_data: Parameters<typeof creatorApi.submitCampaign>[1] = isFeedbackOnly
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
            submission_data: {
              submission_twitter: "",
              submission_tiktok: "",
              submission_instagram: "",
              submission_youtube: "",
              submissions_kols: validLinks,
              ...(images.length > 0 && { submissions_images: images }),
            },
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
        if (isFeedbackOnly) {
          // Nada a persistir em estado/localStorage para feedback
        } else {
          setExistingLinks(validLinks);
          const storedKey = `campaign_${campaign.id}_submission_links`;
          localStorage.setItem(storedKey, JSON.stringify(validLinks));
        }
        if (onSubmitted) onSubmitted();
      }
    } catch (err: any) {
      console.error("Error submitting to private campaign:", err);
      setError(err.message || "Error submitting to campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToCampaigns = () => {
    setShowCongrats(false);
    onClose();
    router.push("/creator");
  };

  // Render Congrats Modal
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
            <p className="text-gray-300 text-lg">Submission sent successfully!</p>
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

  // Render Confirmation Modal
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => setShowConfirmation(false)}
        />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-lg w-full p-8 mx-4 my-8 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Confirm Submission</h2>
            <p className="text-gray-300 text-sm">
              {isFeedbackOnly ? "Please verify your feedback before submitting" : "Please verify your links before submitting"}
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
                  {existingLinks.length > 0 
                    ? `You are updating your submission with ${validLinks.length} link${validLinks.length !== 1 ? 's' : ''}`
                    : `You are submitting ${validLinks.length} link${validLinks.length !== 1 ? 's' : ''}`
                  }
                </p>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {validLinks.map((link, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Link {index + 1}</p>
                        <p className="text-white text-sm break-all">{link}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {!isFeedbackOnly && images.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2 text-center">{images.length} image{images.length !== 1 ? "s" : ""} attached</p>
              <div className="grid grid-cols-5 gap-1.5">
                {images.map((src, i) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-square bg-gray-800">
                    <img src={src} alt={`proof ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-yellow-400 text-xs text-center mb-6">
            {isFeedbackOnly
              ? "⚠️ Your submission will be saved. You can submit again later to update your feedback."
              : existingLinks.length > 0 
                ? "⚠️ Your submission will be updated with these links. You can submit again later to add more."
                : "⚠️ You can submit again later to add more links"
            }
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
            Submit Your Content
          </h2>
          <p className="text-gray-300 text-sm">
            {isFeedbackOnly
              ? "Share your feedback for this campaign."
              : existingLinks.length > 0 
                ? "Edit your links or add new ones."
                : "Add the links to your content for this private campaign."
            }
          </p>
          {!isFeedbackOnly && (campaign.qtd_min_links || campaign.qtd_max_links) && (
            <p className="text-gray-400 text-xs mt-2">
              {campaign.qtd_min_links && campaign.qtd_max_links ? (
                <>Required: {campaign.qtd_min_links} to {campaign.qtd_max_links} link{campaign.qtd_max_links !== 1 ? 's' : ''} per submission</>
              ) : campaign.qtd_min_links ? (
                <>Minimum: {campaign.qtd_min_links} link{campaign.qtd_min_links !== 1 ? 's' : ''} per submission</>
              ) : campaign.qtd_max_links ? (
                <>Maximum: {campaign.qtd_max_links} link{campaign.qtd_max_links !== 1 ? 's' : ''} per submission</>
              ) : null}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isFeedbackOnly ? (
              <div className="space-y-3">
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
              <Fragment>
                {/* Links */}
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2">
                          Link {index + 1}
                        </label>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="mt-8 cursor-pointer p-3 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={links.length <= minSlots ? "Clear link" : "Remove link"}
                        disabled={links.length <= minSlots && !links[index]?.trim()}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Link Button - até qtd_max_links slots */}
                {links.length < maxSlots && (
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="cursor-pointer w-full py-3 px-4 border-2 border-dashed border-gray-600 hover:border-gray-400 rounded-full text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Another Link
                  </button>
                )}

                {/* Image upload — apenas para campanhas Instagram (Stories sem URL pública) */}
                {submissionTypes.includes("instagram") && (
                  <div className="pt-2">
                    <label className="block text-sm text-gray-400 mb-2">
                      Proof images{" "}
                      <span className="text-gray-500 text-xs">
                        {`(optional · up to ${MAX_IMAGES} · max ${MAX_IMAGE_SIZE_MB} MB each)`}
                      </span>
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
                        <span className="text-sm">
                          {images.length > 0
                            ? `Add image · ${images.length}/${MAX_IMAGES}`
                            : "Add image"}
                        </span>
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
              </Fragment>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {!isFeedbackOnly && (
              <p className="text-gray-300 text-sm">
                <b className="text-red-500">*</b> You can submit multiple times to add more links.
              </p>
            )}
            
            {isLoadingExistingLinks && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                <p className="text-blue-400 text-xs text-center">Loading your existing links...</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        onClose={() => {
          setShowWalletsModal(false);
          // Reabrir o modal de submissão após fechar o modal de carteiras
          setShowConfirmation(false);
        }}
        wallets={walletsFromError}
      />
    </div>
  );
}

