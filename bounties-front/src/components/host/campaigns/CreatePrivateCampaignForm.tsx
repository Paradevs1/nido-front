"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskStep from "./steps/TaskStep";
import DetailsStep from "./steps/DetailsStep";
import SelectKolsStep from "./steps/SelectKolsStep";
import PrivateRewardsStep from "./steps/PrivateRewardsStep";
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
  { id: "select-kols", label: "Select Creators", component: SelectKolsStep },
  { id: "rewards", label: "Rewards", component: PrivateRewardsStep },
];

interface CreatePrivateCampaignFormProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  initialData?: CampaignDetails | null;
  isEditing?: boolean;
  communityId?: string;
}

export default function CreatePrivateCampaignForm({
  currentStep,
  setCurrentStep,
  initialData,
  isEditing = false,
  communityId,
}: CreatePrivateCampaignFormProps) {
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
        rewardFormat: "fixed",
        // Mapear campos do backend para campos do formulário
        ...(initialData.is_cac && {
          cac_value_per_conversion: initialData.amount_convertion,
          cac_max_amount_per_creator: initialData.limit_amount_convertion,
          format_cac: initialData.format_cac,
          quantity_conversion: initialData.quantity_conversion,
        }),
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

    // Select KOLs step
    ensure(
      hasArrayValues(formData.list_kols),
      "At least one creator selected",
      "select-kols",
      "select-kols"
    );
    
    // Se for modo CAC, validar campos CAC ao invés de amounts individuais
    if (formData.is_cac) {
      ensure(
        !!formData.format_cac,
        "CAC Format (clicks or view)",
        "select-kols",
        "campaign-format-cac"
      );
      ensure(
        formData.quantity_conversion !== undefined && Number(formData.quantity_conversion) > 0,
        `${formData.format_cac === 'view' ? 'Views' : 'Clicks'} per conversion`,
        "select-kols",
        "campaign-quantity-conversion"
      );
      ensure(
        formData.cac_value_per_conversion !== undefined && Number(formData.cac_value_per_conversion) > 0,
        "Value per conversion (CAC)",
        "select-kols",
        "cac-value-per-conversion"
      );
      ensure(
        formData.cac_max_amount_per_creator !== undefined && Number(formData.cac_max_amount_per_creator) > 0,
        "Maximum amount per creator (CAC)",
        "select-kols",
        "cac-max-amount-per-creator"
      );
    } else {
      // Validação tradicional: verificar amounts individuais
      if (formData.list_kols && formData.list_kols.length > 0) {
        formData.list_kols.forEach((kol, index) => {
          ensure(
            kol.amount !== undefined && Number(kol.amount) > 0,
            `Creator ${index + 1}: reward amount`,
            "select-kols",
            `kol-${index + 1}-amount`
          );
        });
      }
    }

    // Private Rewards step
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
      formData.qtd_min_links !== undefined && Number(formData.qtd_min_links) > 0,
      "Minimum links",
      "rewards",
      "campaign-qtd-min-links"
    );
    ensure(
      formData.qtd_max_links !== undefined && Number(formData.qtd_max_links) > 0,
      "Maximum links",
      "rewards",
      "campaign-qtd-max-links"
    );
    // Não validar total_prize_pool se for modo CAC (será calculado depois)
    if (!formData.is_cac) {
      ensure(
        formData.total_prize_pool !== undefined &&
          Number(formData.total_prize_pool) > 0,
        "Total prize pool",
        "rewards",
        "campaign-total-prize-pool"
      );
    }

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
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
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
      if (stepToFocus && stepToFocus !== currentStep) {
        setCurrentStep(stepToFocus);
      }
      
      setMissingFieldsList(missingFields);
      setIsMissingFieldsModalOpen(true);
      
      return;
    }

    setIsLoading(true);
    try {
      const { useTiers, rewardFormat, cac_value_per_conversion, cac_max_amount_per_creator, format_cac, quantity_conversion, ...payload } = formData;

      // Para campanha privada, não enviar reward_tiers
      // Mapear campos CAC do formulário para os nomes do backend
      const privateCampaignPayload: CreateCampaignRequest = {
        ...payload,
        reward_tiers: undefined,
      } as CreateCampaignRequest;

      // Se for modo CAC, adicionar campos CAC mapeados
      if (formData.is_cac) {
        privateCampaignPayload.is_cac = true;
        privateCampaignPayload.format_cac = formData.format_cac;
        privateCampaignPayload.quantity_conversion = formData.quantity_conversion;
        privateCampaignPayload.amount_convertion = formData.cac_value_per_conversion;
        if (formData.cac_max_amount_per_creator) {
          privateCampaignPayload.limit_amount_convertion = formData.cac_max_amount_per_creator;
        }
        // No modo CAC, os amounts dos KOLs são opcionais (serão calculados dinamicamente)
        if (privateCampaignPayload.list_kols) {
          privateCampaignPayload.list_kols = privateCampaignPayload.list_kols.map(kol => ({
            userId: kol.userId,
            // amount é opcional no modo CAC
            ...(kol.amount !== undefined && { amount: kol.amount }),
          }));
        }
      } else {
        // Se não for CAC, garantir que os campos CAC não sejam enviados
        privateCampaignPayload.is_cac = false;
        // No modo não-CAC, os amounts dos KOLs são obrigatórios (já validados acima)
      }

      if (isEditing && initialData?.id) {
        await updateCampaign(initialData.id, privateCampaignPayload);
        router.push(`/host/campaign/manage/private/${initialData.id}`);
      } else if (communityId) {
        const res = await createCommunityCampaign(communityId, privateCampaignPayload);
        const newId = res.data?._id || res.data?.id;
        if (newId) {
          router.push(`/host/campaign/manage/private/${newId}?from=community`);
        } else {
          router.push(`/host/communities/${communityId}`);
        }
      } else {
        const response = await createCampaign(privateCampaignPayload);
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
        `Error ${isEditing ? "updating" : "creating"} private campaign:`,
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirmation = () => {
    setIsModalOpen(false);
    if (!newCampaignId) {
      router.push("/host/profile");
    }
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
            Private Campaign Information
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
          isPrivate={true}
        />
      )}
    </div>
  );
}
