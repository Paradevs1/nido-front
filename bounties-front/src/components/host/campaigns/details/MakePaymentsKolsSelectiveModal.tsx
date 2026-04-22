"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { FaSearch, FaBroom } from "react-icons/fa";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa6";
import { CampaignDetails, sendPaymentKolsSelective, getCampaignSubmissions, getKols } from "@/lib/api/host";
import Button from "@/components/ui/Button";
import Image from "next/image";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import TwitterAvatar from "@/components/ui/TwitterAvatar";
import type { KolReward } from "@/components/host/campaigns/types";
import { CampaignSubmission, GetCampaignSubmissionsResponse } from "@/lib/api/host";

interface MakePaymentsKolsSelectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignDetails;
  onSuccess?: () => void;
}

interface KolWithDetails extends Omit<KolReward, 'amount'> {
  username?: string;
  twitter_profile_image?: string | null;
  hasSubmission?: boolean;
  amount?: number;
  // Dados do leaderboard para CAC
  clicks?: number;
  views_twitter?: number;
  views_tiktok?: number;
  views_instagram?: number;
  views_youtube?: number;
}

export default function MakePaymentsKolsSelectiveModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: MakePaymentsKolsSelectiveModalProps) {
  const [selectedKolIds, setSelectedKolIds] = useState<Set<string>>(new Set());
  const [quantityConversions, setQuantityConversions] = useState<Record<string, number>>({});
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentAnimation, setPaymentAnimation] = useState<any>(null);
  const [kolsWithDetails, setKolsWithDetails] = useState<KolWithDetails[]>([]);
  const [isLoadingKols, setIsLoadingKols] = useState(true);
  const { showToast, hideToast, toast } = useToast();

  const isCacCampaign = campaign.is_cac === true;
  const campaignPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    campaign.submission_format?.forEach((sf) => {
      if (sf.type) platforms.add(sf.type.toLowerCase());
    });
    return platforms;
  }, [campaign.submission_format]);

  // Resetar seleção e busca quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedKolIds(new Set());
      setQuantityConversions({});
      setQuantityInputs({});
      setShowSuccessModal(false);
      loadKolsDetails();
    }
  }, [isOpen, campaign.id]);

  // Carregar animação de pagamento
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const paymentRes = await fetch("/assets/motion/motion-payment.json");
        const paymentData = await paymentRes.json();
        setPaymentAnimation(paymentData);
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    loadAnimations();
  }, []);

  // Carregar detalhes dos KOLs (buscar informações completas incluindo foto e nome)
  const loadKolsDetails = async () => {
    try {
      setIsLoadingKols(true);

      let submissions: CampaignSubmission[] = [];
      let responseFormatCac: 'clicks' | 'view' | undefined;
      try {
        const submissionsResponse: GetCampaignSubmissionsResponse = await getCampaignSubmissions(campaign.id, 1, 9999);
        submissions = submissionsResponse.leaderboard || [];
        responseFormatCac = submissionsResponse.format_cac;
      } catch (err) {
        console.error("Error loading submissions:", err);
      }

      const listKols = campaign.list_kols || [];
      let kols: KolWithDetails[];

      if (listKols.length > 0) {
        kols = listKols.map(kol => ({
          ...kol,
          username: undefined,
          twitter_profile_image: null,
          hasSubmission: false,
        }));
      } else if (submissions.length > 0) {
        kols = submissions.map((sub: CampaignSubmission) => ({
          userId: sub.user_id,
          username: sub.username,
          amount: sub.amount ?? 0,
          twitter_profile_image: null,
          hasSubmission: true,
        }));
      } else {
        kols = [];
      }

      // Buscar informações completas dos KOLs via API getKols (retorna username e twitter_profile_image)
      try {
        const allKolsData: Array<{ id: string; username: string; twitter_profile_image?: string | null }> = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 20) {
          try {
            const kolsResponse = await getKols(undefined, page, 100);
            const kolsData = kolsResponse.kols || [];

            if (kolsData.length === 0) {
              hasMore = false;
            } else {
              allKolsData.push(...kolsData);
              if (kolsData.length < 100) {
                hasMore = false;
              }
              page++;
            }
          } catch (pageError) {
            console.error(`Error loading page ${page}:`, pageError);
            hasMore = false;
          }
        }

        const kolsById = new Map<string, typeof allKolsData[0]>();
        allKolsData.forEach((kol) => {
          kolsById.set(kol.id, kol);
        });

        kols.forEach(kol => {
          const kolData = kolsById.get(kol.userId);
          if (kolData) {
            kol.username = kolData.username || kol.username;
            kol.twitter_profile_image = kolData.twitter_profile_image || kol.twitter_profile_image;
          }
        });
      } catch (err) {
        console.error("Error loading KOLs data:", err);
      }

      // Atualizar KOLs com informações de submission (username e hasSubmission quando veio de list_kols)
      const submissionsByUserId = new Map<string, CampaignSubmission>();
      submissions.forEach((sub: CampaignSubmission) => {
        if (sub.user_id) {
          submissionsByUserId.set(sub.user_id, sub);
        }
      });
      kols.forEach(kol => {
        const submission = submissionsByUserId.get(kol.userId);
        if (submission) {
          if (!kol.username) {
            kol.username = submission.username;
          }
          kol.hasSubmission = true;
          // Copiar dados de views/clicks do leaderboard
          kol.clicks = submission.clicks;
          kol.views_twitter = submission.views_twitter;
          kol.views_tiktok = submission.views_tiktok;
          kol.views_instagram = submission.views_instagram;
          kol.views_youtube = submission.views_youtube;
        }
      });

      setKolsWithDetails(kols);

      // Auto-popular conversões do leaderboard para campanhas CAC
      if (isCacCampaign && submissions.length > 0) {
        const formatCac = responseFormatCac || campaign.format_cac;
        const autoConversions: Record<string, number> = {};
        const autoInputs: Record<string, string> = {};
        const autoSelected = new Set<string>();

        submissions.forEach((sub) => {
          if (!sub.user_id) return;
          let conversions = 0;
          if (formatCac === 'clicks') {
            conversions = sub.clicks || 0;
          } else if (formatCac === 'view') {
            conversions =
              (sub.views_twitter || 0) +
              (sub.views_tiktok || 0) +
              (sub.views_instagram || 0) +
              (sub.views_youtube || 0);
          }
          autoConversions[sub.user_id] = conversions;
          autoInputs[sub.user_id] = conversions > 0 ? conversions.toString() : '';
          if (conversions > 0) {
            autoSelected.add(sub.user_id);
          }
        });

        setQuantityConversions(autoConversions);
        setQuantityInputs(autoInputs);
        setSelectedKolIds(autoSelected);
      }
    } catch (err: unknown) {
      console.error("Error loading KOLs:", err);
      setKolsWithDetails(campaign.list_kols || []);
    } finally {
      setIsLoadingKols(false);
    }
  };

  const handleToggleKol = (userId: string) => {
    const newSelected = new Set(selectedKolIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
      // Para não-CAC, remover quantidade de conversão quando desmarcar
      if (!isCacCampaign) {
        const newConversions = { ...quantityConversions };
        delete newConversions[userId];
        setQuantityConversions(newConversions);
        const newInputs = { ...quantityInputs };
        delete newInputs[userId];
        setQuantityInputs(newInputs);
      }
    } else {
      newSelected.add(userId);
    }
    setSelectedKolIds(newSelected);
  };

  const handleQuantityChange = (userId: string, value: string) => {
    // Permitir campo vazio temporariamente
    setQuantityInputs({ ...quantityInputs, [userId]: value });
    
    // Validar e atualizar o valor numérico apenas se for um número válido
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantityConversions({ ...quantityConversions, [userId]: numValue });
    } else if (value === '') {
      // Se estiver vazio, definir como 0 mas manter o input vazio
      setQuantityConversions({ ...quantityConversions, [userId]: 0 });
    }
  };

  const handleSelectAll = () => {
    if (selectedKolIds.size === filteredKols.length) {
      setSelectedKolIds(new Set());
    } else {
      setSelectedKolIds(new Set(filteredKols.map(kol => kol.userId)));
    }
  };

  const handleClearSelection = () => {
    setSelectedKolIds(new Set());
  };

  // Filtrar KOLs pelo termo de busca
  const filteredKols = useMemo(() => {
    if (!searchTerm.trim()) {
      return kolsWithDetails;
    }
    const term = searchTerm.toLowerCase();
    return kolsWithDetails.filter(kol => 
      kol.username?.toLowerCase().includes(term) ||
      kol.userId.toLowerCase().includes(term)
    );
  }, [kolsWithDetails, searchTerm]);

  const handleMakePayments = async () => {
    if (selectedKolIds.size === 0) {
      showToast("Please select at least one creator to receive payment", "error", 3000);
      return;
    }

    // Validar quantidade de conversões se for CAC
    if (isCacCampaign) {
      const missingConversions = Array.from(selectedKolIds).filter(
        userId => quantityConversions[userId] === undefined || quantityConversions[userId] === null || quantityConversions[userId] <= 0
      );
      
      if (missingConversions.length > 0) {
        const label = campaign.format_cac === 'view' ? 'views' : 'clicks';
        showToast(`Please enter the number of ${label} for all selected creators`, "error", 4000);
        return;
      }
    }

    try {
      setIsProcessing(true);
      
      // Preparar array de KOLs selecionados com quantity_convertion se for CAC
      const selectedKols = Array.from(selectedKolIds).map(userId => {
        const kol: { userId: string; quantity_convertion?: number } = { userId };
        if (isCacCampaign && quantityConversions[userId] !== undefined) {
          kol.quantity_convertion = quantityConversions[userId];
        }
        return kol;
      });

      const result = await sendPaymentKolsSelective(
        campaign.id,
        selectedKols
      );
      
      setIsProcessing(false);
      setShowSuccessModal(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Error making selective payments:", err);
      showToast(err.message || "Failed to process payments. Please try again.", "error", 4000);
      setIsProcessing(false);
    }
  };

  const handleBackToProfile = () => {
    setShowSuccessModal(false);
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/host/profile";
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/host/campaign/manage";
    }
  };

  // Calcular totais
  const totalSelected = selectedKolIds.size;
  
  const quantityPerConversion = campaign.quantity_conversion || 1;

  // Calcular total baseado em CAC ou valor fixo
  const totalAmountSelected = filteredKols
    .filter(kol => selectedKolIds.has(kol.userId))
    .reduce((sum, kol) => {
      if (isCacCampaign && campaign.amount_convertion && quantityConversions[kol.userId] !== undefined) {
        const calculatedAmount = (quantityConversions[kol.userId] / quantityPerConversion) * campaign.amount_convertion;
        const limitAmount = campaign.limit_amount_convertion || Infinity;
        return sum + Math.min(calculatedAmount, limitAmount);
      }
      return sum + (kol.amount || 0);
    }, 0);
    
  const totalAmountRefunded = filteredKols
    .filter(kol => !selectedKolIds.has(kol.userId))
    .reduce((sum, kol) => {
      // Para CAC, calcular baseado no limite máximo
      if (isCacCampaign && campaign.limit_amount_convertion) {
        return sum + campaign.limit_amount_convertion;
      }
      return sum + (kol.amount || 0);
    }, 0);

  if (!isOpen) return null;

  // Modal de Sucesso
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-lg w-full mx-4 text-white">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer"
          >
            <FiX size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Payment Completed!</h2>
            <p className="text-gray-300 mb-6">
              Payments were processed successfully. Selected creators received their payments, and refunds were sent to your wallet.
            </p>

            <div className="flex justify-center mb-8">
              <div className="w-48 h-48">
                {paymentAnimation ? (
                  <Lottie
                    animationData={paymentAnimation}
                    loop={true}
                    autoplay={true}
                  />
                ) : (
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 mx-auto">
                    <FiCheck className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToProfile}
                className="flex-1 px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap cursor-pointer"
              >
                BACK TO PROFILE
              </button>
              <Button
                variant="default"
                className="flex-1 px-6 py-2 border-[var(--color-primary)] whitespace-nowrap text-base font-bold cursor-pointer"
                onClick={handleGoToDashboard}
              >
                GO TO DASHBOARD
              </Button>
            </div>

            <div />
          </div>
        </div>
      </div>
    );
  }

  // Modal Principal
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-6 md:p-8 w-full max-w-4xl text-white max-h-[90vh] flex flex-col">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer"
          >
            <FiX size={20} />
          </button>

          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Select Creators for Payment</h2>
            <p className="text-gray-300 text-sm">
              Select which creators completed the campaign correctly. Selected creators will receive payment, others will be refunded to your wallet.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--color-background)] rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Total Creators</p>
              <p className="text-2xl font-bold text-white">{filteredKols.length}</p>
            </div>
            <div className="bg-[var(--color-background)] rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Selected for Payment</p>
              <p className="text-2xl font-bold text-white">{totalSelected}</p>
            </div>
            <div className="bg-[var(--color-background)] rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-white">${totalAmountSelected.toFixed(2)}</p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search for creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-transparent text-white rounded-full border border-gray-600 hover:border-white focus:border-white focus:outline-none transition-colors placeholder:text-gray-500 text-sm"
              />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all whitespace-nowrap text-sm cursor-pointer"
            >
              {selectedKolIds.size === filteredKols.length ? "DESELECT ALL" : "SELECT ALL"}
            </button>
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer"
            >
              <FaBroom className="w-4 h-4" />
              CLEAR
            </button>
          </div>

          {/* KOLs List */}
          <div className="flex-1 overflow-y-auto mb-4 -mx-2">
            <div className="space-y-2 px-2">
              {isLoadingKols ? (
                <div className="text-center py-8 text-gray-400">
                  Loading creators...
                </div>
              ) : filteredKols.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No creators found.
                </div>
              ) : (
                filteredKols.map((kol) => {
                  const isSelected = selectedKolIds.has(kol.userId);
                  const quantity = quantityConversions[kol.userId] || 0;
                  
                  // Calcular valor para exibição
                  let displayAmount = kol.amount || 0;
                  if (isCacCampaign && isSelected && campaign.amount_convertion && quantity > 0) {
                    const calculatedAmount = (quantity / quantityPerConversion) * campaign.amount_convertion;
                    const limitAmount = campaign.limit_amount_convertion || Infinity;
                    displayAmount = Math.min(calculatedAmount, limitAmount);
                  }
                  
                  return (
                     <div
                       key={kol.userId}
                       className="p-4 rounded-xl border-2 border-white/10 bg-[var(--color-background)]/50 hover:border-white/30 transition-all"
                     >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                              isSelected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                : "border-white/30 bg-transparent"
                            }`}
                            onClick={() => handleToggleKol(kol.userId)}
                          >
                            {isSelected && (
                              <FiCheck className="w-4 h-4 text-white" />
                            )}
                          </div>
                          
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <TwitterAvatar
                              src={kol.twitter_profile_image || undefined}
                              alt={kol.username || `User ${kol.userId.substring(0, 8)}...`}
                              fallbackInitial={kol.username?.[0]?.toUpperCase() || "?"}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>

                          {/* Nome e informações */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">
                              {kol.username || `User ${kol.userId.substring(0, 8)}...`}
                            </p>
                            {kol.hasSubmission && (
                              <p className="text-xs text-green-400 mt-1">
                                ✓ Has submission
                              </p>
                            )}
                          </div>
                          
                          {/* Dados de views/clicks do leaderboard (CAC) */}
                          {isCacCampaign && (
                            <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              {campaign.format_cac === 'view' ? (
                                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                                  {campaignPlatforms.has('twitter') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Twitter views">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                      {(kol.views_twitter || 0).toLocaleString()}
                                    </span>
                                  )}
                                  {campaignPlatforms.has('tiktok') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="TikTok views">
                                      <FaTiktok className="w-3 h-3" />
                                      {(kol.views_tiktok || 0).toLocaleString()}
                                    </span>
                                  )}
                                  {campaignPlatforms.has('instagram') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Instagram views">
                                      <FaInstagram className="w-3 h-3" />
                                      {(kol.views_instagram || 0).toLocaleString()}
                                    </span>
                                  )}
                                  {campaignPlatforms.has('youtube') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="YouTube views">
                                      <FaYoutube className="w-3 h-3" />
                                      {(kol.views_youtube || 0).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-gray-300">
                                  {kol.clicks != null && (
                                    <span className="whitespace-nowrap" title="Clicks">
                                      {(kol.clicks || 0).toLocaleString()} clicks
                                    </span>
                                  )}
                                </div>
                              )}
                              {isSelected && (
                                <div className="flex items-center gap-1.5">
                                  <label className="text-white text-xs font-medium whitespace-nowrap">
                                    Conv:
                                  </label>
                                  <input
                                    type="text"
                                    value={quantity > 0 ? quantity.toLocaleString() : '0'}
                                    disabled
                                    className="w-16 bg-transparent text-white/60 px-2 py-1 rounded-full border border-white/20 outline-none text-xs cursor-not-allowed"
                                  />
                                  {campaign.amount_convertion && (
                                    <span className="text-gray-400 text-xs whitespace-nowrap">
                                      @ ${campaign.amount_convertion}/{quantityPerConversion} {campaign.format_cac === 'view' ? 'views' : 'clicks'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Valor - só mostrar se não for CAC */}
                          {!isCacCampaign && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-gray-400 text-xs mb-1">Amount</p>
                              <p className="text-white font-bold">
                                ${displayAmount.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {/* Para CAC, mostrar apenas o limite máximo se existir */}
                          {isCacCampaign && campaign.limit_amount_convertion && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-gray-400 text-xs mb-1">Max Amount</p>
                              <p className="text-gray-500 text-xs">
                                ${campaign.limit_amount_convertion.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

           {/* Summary */}
           {totalAmountRefunded > 0 && (
             <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
               <div className="flex items-start gap-3">
                 <svg
                   className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                   fill="currentColor"
                   viewBox="0 0 20 20"
                 >
                   <path
                     fillRule="evenodd"
                     d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                     clipRule="evenodd"
                   />
                 </svg>
                 <div className="flex-1">
                   <p className="text-yellow-500 text-sm font-semibold mb-1">
                     Refund Information
                   </p>
                   <p className="text-yellow-500/90 text-xs leading-relaxed">
                     Creators that are not selected will not receive payment. The total amount of <span className="font-bold text-yellow-400">${totalAmountRefunded.toFixed(2)}</span> from unselected creators will be automatically refunded to your wallet address.
                   </p>
                 </div>
               </div>
             </div>
           )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <button
                aria-label="Close"
                onClick={onClose}
                disabled={isProcessing}
                className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CANCEL
              </button>
              <Button
                variant="default"
                className="px-6 py-3 flex items-center font-bold justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMakePayments}
                disabled={isProcessing || selectedKolIds.size === 0}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    PROCESSING...
                  </>
                ) : (
                  `SEND PAYMENTS (${totalSelected})`
                )}
              </Button>
            </div>

            <div />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </>
  );
}

