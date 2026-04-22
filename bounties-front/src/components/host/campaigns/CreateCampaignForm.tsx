"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskStep from "./steps/TaskStep";
import DetailsStep from "./steps/DetailsStep";
import RewardsStep from "./steps/RewardsStep";
import dynamic from "next/dynamic";
const ActivateCampaignModal = dynamic(() => import("./ActivateCampaignModal"), { ssr: false });
import MissingFieldsModal from "./MissingFieldsModal";
import BaseButton from "@/components/ui/Button";
import {
  createCampaign,
  updateCampaign,
  CreateCampaignRequest,
  CampaignDetails,
} from "@/lib/api/host";
import { createCommunityCampaign } from "@/lib/api/community";
import { CampaignFormData } from "./types";

const steps = [
  { id: "task", label: "Task", component: TaskStep },
  { id: "details", label: "Details", component: DetailsStep },
  { id: "rewards", label: "Rewards", component: RewardsStep },
];

interface CreateCampaignFormProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  initialData?: CampaignDetails | null;
  isEditing?: boolean;
  /** When set, creates the campaign under this community via POST /api/communities/:id/campaigns */
  communityId?: string;
}

export default function CreateCampaignForm({
  currentStep,
  setCurrentStep,
  initialData,
  isEditing = false,
  communityId,
}: CreateCampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);
  const [isMissingFieldsModalOpen, setIsMissingFieldsModalOpen] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState<Array<{ label: string; fieldId?: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      const convertedData = {
        ...(initialData as any),
        rewardFormat:
          initialData.reward_tiers && initialData.reward_tiers.length > 0
            ? "tier"
            : "fixed",
        useTiers:
          initialData.reward_tiers && initialData.reward_tiers.length > 0,
      } as CampaignFormData;
      setFormData(convertedData);
    }
  }, [initialData, isEditing]);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const CurrentStepComponent = steps[currentStepIndex]?.component;

  const getOfficialLink = (type: string) =>
    formData.official_links?.find((link) => link.type === type)?.url?.trim();

  const hasSupportContact = (type: string) =>
    formData.support_contact?.some(
      (contact) => contact.type === type && !!contact.value?.trim()
    ) ?? false;

  const validateFormData = () => {
    const missingFields: Array<{ label: string; fieldId?: string }> = [];
    let stepToFocus: string | null = null;
    let firstMissingFieldId: string | undefined;

    const ensure = (
      condition: boolean,
      label: string,
      stepId: string,
      fieldId?: string
    ) => {
      if (!condition) {
        missingFields.push({ label, fieldId });
        if (!stepToFocus) {
          stepToFocus = stepId;
        }
        if (!firstMissingFieldId && fieldId) {
          firstMissingFieldId = fieldId;
        }
      }
    };

    const hasArrayValues = <T,>(arr?: T[]) =>
      Array.isArray(arr) && arr.length > 0;

    // Task step
    ensure(
      !!formData.title?.trim(),
      "Campaign title",
      "task",
      "campaign-title"
    );
    ensure(
      !!formData.about_project?.trim(),
      "About project",
      "task",
      "campaign-about-project"
    );
    ensure(
      !!formData.what_we_need?.trim(),
      "What we need",
      "task",
      "campaign-what-we-need"
    );
    ensure(
      !!formData.content_type?.trim(),
      "Content type",
      "task",
      "campaign-content-type"
    );
    ensure(
      !!formData.content_pillars?.trim(),
      "Content pillars",
      "task",
      "campaign-content-pillars"
    );
    ensure(
      hasArrayValues(formData.content_format),
      "Content format",
      "task",
      "campaign-content-format"
    );
    ensure(
      hasArrayValues(formData.submission_format),
      "Submission format",
      "task",
      "campaign-submission-format"
    );
    ensure(
      hasArrayValues(formData.content_categories),
      "Content category",
      "task",
      "campaign-categories"
    );

    // Details step
    ensure(
      !!formData.target_blockchain,
      "Target blockchain",
      "details",
      "campaign-target-blockchain"
    );
    ensure(
      !!getOfficialLink("twitter"),
      "Official Twitter/X link",
      "details",
      "campaign-official-twitter"
    );
    ensure(
      !!getOfficialLink("website"),
      "Official website",
      "details",
      "campaign-official-website"
    );
    ensure(
      hasArrayValues(formData.country),
      "Target country",
      "details",
      "campaign-target-country"
    );
    ensure(
      !!formData.start_date,
      "Start date",
      "details",
      "campaign-start-date"
    );
    ensure(!!formData.end_date, "End date", "details", "campaign-end-date");

    // Rewards step
    ensure(
      !!formData.rewardFormat,
      "Reward format",
      "rewards",
      "campaign-reward-format"
    );
    ensure(
      !!formData.payment_chain,
      "Payment chain",
      "rewards",
      "campaign-payment-chain"
    );
    ensure(
      !!formData.payment_token,
      "Payment token",
      "rewards",
      "campaign-payment-token"
    );
    ensure(
      formData.total_prize_pool !== undefined &&
        Number(formData.total_prize_pool) > 0,
      "Total prize pool",
      "rewards",
      "campaign-total-prize-pool"
    );

    // Validate tiers only if reward format is "tier"
    if (formData.rewardFormat === "tier" && formData.useTiers) {
      ensure(
        hasArrayValues(formData.reward_tiers),
        "At least one reward tier",
        "rewards",
        formData.reward_tiers?.length
          ? `campaign-tier-1-position-initial`
          : "campaign-tier-1-position-initial"
      );
      if (Array.isArray(formData.reward_tiers)) {
        formData.reward_tiers.forEach((tier, index) => {
          ensure(
            tier.position_initial !== undefined &&
              tier.position_initial !== null &&
              tier.position_initial !== ("" as unknown as number),
            `Tier ${index + 1}: start position`,
            "rewards",
            `campaign-tier-${index + 1}-position-initial`
          );
          ensure(
            tier.position_final !== undefined &&
              tier.position_final !== null &&
              tier.position_final !== ("" as unknown as number),
            `Tier ${index + 1}: end position`,
            "rewards",
            `campaign-tier-${index + 1}-position-final`
          );
          ensure(
            tier.payment_amount !== undefined &&
              Number(tier.payment_amount) > 0,
            `Tier ${index + 1}: reward per winner`,
            "rewards",
            `campaign-tier-${index + 1}-payment-amount`
          );
        });
      }
    }

    // Note: winner_count is not required for mindshare mode (it will be null)

    return {
      isValid: missingFields.length === 0,
      missingFields,
      stepToFocus,
      firstMissingFieldId,
    };
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
      // Scroll para o topo ao mudar de passo
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
      // Scroll para o topo ao mudar de passo
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handleLaunch = async () => {
    setError(null);
    const { isValid, missingFields, stepToFocus, firstMissingFieldId } =
      validateFormData();

    if (!isValid) {
      // Mudar para o step correto se necessário
      if (stepToFocus && stepToFocus !== currentStep) {
        setCurrentStep(stepToFocus);
      }
      
      // Mostrar modal com campos faltantes ao invés de mensagem de erro
      setMissingFieldsList(missingFields);
      setIsMissingFieldsModalOpen(true);
      
      return;
    }

    setIsLoading(true);
    try {
      const { useTiers, rewardFormat, ...payload } = formData;

      if (isEditing && initialData?.id) {
        await updateCampaign(initialData.id, payload as CreateCampaignRequest);
        router.push(`/host/campaign/manage/${initialData.id}`);
      } else if (communityId) {
        const res = await createCommunityCampaign(communityId, payload);
        const newId = res.data?._id || res.data?.id;
        if (newId) {
          router.push(`/host/campaign/manage/${newId}?from=community`);
        } else {
          router.push(`/host/communities/${communityId}`);
        }
      } else {
        const response = await createCampaign(payload as CreateCampaignRequest);
        setNewCampaignId(response.campaign.id);
        setIsModalOpen(true);
      }
    } catch (err: unknown) {
      setError(
        err.message ||
          `Não foi possível ${
            isEditing ? "atualizar" : "criar"
          } a campanha. Tente novamente.`
      );
      console.error(
        `Error ${isEditing ? "updating" : "creating"} campaign:`,
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirmation = () => {
    setIsModalOpen(false);
    if (!newCampaignId) {
      // Fallback: redireciona para o perfil se não houver ID
      router.push("/host/profile");
    }
    // Se houver ID, a navegação é tratada pelo modal
  };

  const handleGoToField = (fieldId?: string) => {
    if (!fieldId) return;

    window.setTimeout(() => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in element && typeof element.focus === "function") {
          (element as HTMLElement).focus();
        }
      } else {
        // Fallback: scroll para o topo
        const fallback = document.getElementById("create-campaign-top");
        fallback?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="pb-20" id="create-campaign-top">
      <div className="max-w-4xl mx-auto px-6">
        <div className="p-8">
          <h2 className="text-xl font-bold text-white/50 mb-8">
            Campaign Information
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Current Step Component */}
          {CurrentStepComponent && (
            <div
              id={`step-section-${currentStep}`}
              className="outline-none"
              tabIndex={-1}
            >
              <CurrentStepComponent data={formData} onChange={setFormData} />
            </div>
          )}

          {/* Action Buttons */}
          <div
            className={`flex flex-wrap items-center mt-12 gap-3 ${
              currentStepIndex > 0 ? "justify-between" : "justify-end"
            }`}
          >
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="cursor-pointer px-5 sm:px-6 py-2.5 sm:py-3 border border-white text-white rounded-full font-medium text-sm sm:text-base hover:bg-white hover:text-black transition-all"
              >
                PREVIOUS
              </button>
            )}

            {currentStepIndex < steps.length - 1 ? (
              <BaseButton
                onClick={handleNext}
                className="px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-sm sm:text-base cursor-pointer"
              >
                NEXT
              </BaseButton>
            ) : (
              <BaseButton
                onClick={handleLaunch}
                disabled={isLoading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-sm sm:text-base cursor-pointer"
              >
                {isLoading
                  ? isEditing
                    ? "SAVING..."
                    : "LAUNCHING..."
                  : isEditing
                  ? "SAVE CHANGES"
                  : "LAUNCH CAMPAIGN"}
              </BaseButton>
            )}
          </div>
        </div>
      </div>

      {/* Missing Fields Modal */}
      <MissingFieldsModal
        isOpen={isMissingFieldsModalOpen}
        onClose={() => setIsMissingFieldsModalOpen(false)}
        missingFields={missingFieldsList}
        onGoToField={handleGoToField}
      />

      {/* Activate Campaign Modal - Only show for create mode */}
      {!isEditing && (
        <ActivateCampaignModal
          isOpen={isModalOpen}
          onClose={handleModalConfirmation}
          onActivate={handleModalConfirmation}
          campaignId={newCampaignId || undefined}
        />
      )}
    </div>
  );
}
