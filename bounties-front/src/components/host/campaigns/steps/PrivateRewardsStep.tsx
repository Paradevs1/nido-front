"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { CampaignFormData } from "../types";

interface PrivateRewardsStepProps {
  data: CampaignFormData;
  onChange: (data: CampaignFormData) => void;
}

const chainsAndTokens: {
  [key: string]: { label: string; tokens: { value: string; label: string }[] };
} = {
  base: {
    label: "Base",
    tokens: [
      { value: "USDC", label: "USDC" },
      { value: "USDT", label: "USDT" },
    ],
  },
  sui: {
    label: "Sui",
    tokens: [
      { value: "USDC", label: "USDC" },
      { value: "USDT", label: "USDT" },
    ],
  },
  solana: {
    label: "Solana",
    tokens: [
      { value: "USDC", label: "USDC" },
      { value: "USDT", label: "USDT" },
    ],
  },
  hyperevm: {
    label: "HyperEVM",
    tokens: [
      { value: "USDC", label: "USDC" },
      { value: "USDE", label: "USDE" },
    ],
  },
  stellar: {
    label: "Stellar",
    tokens: [
      { value: "USDC", label: "USDC" },
    ],
  },
};

const chainOptions = Object.keys(chainsAndTokens).map((key) => ({
  value: key,
  label: chainsAndTokens[key].label,
}));

export default function PrivateRewardsStep({
  data,
  onChange,
}: PrivateRewardsStepProps) {
  const [availableTokens, setAvailableTokens] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    if (data.payment_chain && chainsAndTokens[data.payment_chain]) {
      setAvailableTokens(chainsAndTokens[data.payment_chain].tokens);
    } else {
      setAvailableTokens([]);
    }
  }, [data.payment_chain]);

  // Calcular total_prize_pool: em modo CAC = qtd de creators * Maximum Amount per Creator; senão = soma dos KOLs
  useEffect(() => {
    if (data.is_cac && data.cac_max_amount_per_creator != null) {
      const creatorsCount = data.list_kols?.length ?? 0;
      const maxPerCreator = Number(data.cac_max_amount_per_creator) || 0;
      const total = creatorsCount * maxPerCreator;
      if (data.total_prize_pool !== total) {
        onChange({ ...data, total_prize_pool: total });
      }
    } else if (data.list_kols && data.list_kols.length > 0) {
      const total = data.list_kols.reduce(
        (sum, kol) => sum + (kol.amount || 0),
        0
      );
      if (data.total_prize_pool !== total) {
        onChange({ ...data, total_prize_pool: total });
      }
    }
  }, [data.list_kols, data.is_cac, data.cac_max_amount_per_creator, data.total_prize_pool]);

  const handleChange = <K extends keyof CampaignFormData>(
    field: K,
    value: CampaignFormData[K]
  ) => {
    const newData: CampaignFormData = { ...data, [field]: value };
    if (field === "payment_chain") {
      newData.payment_token = ""; // Reseta o token ao mudar a chain
    }
    onChange(newData);
  };

  const rewardFormatOptions = [
    { value: "fixed", label: "Fixed Amount" },
  ];

  const creatorsCount = data.list_kols?.length ?? 0;
  const maxPerCreator = Number(data.cac_max_amount_per_creator) || 0;

  const submissionTypes = data.submission_format?.map((s) => s.type?.toLowerCase()) ?? [];
  const contentTypes = data.content_format?.map((c) => c.type?.toLowerCase()) ?? [];
  const onlyFeedback =
    submissionTypes.length === 1 &&
    submissionTypes[0] === "feedback" &&
    contentTypes.length === 1 &&
    contentTypes[0] === "feedback";
  const showMinMaxLinks = !onlyFeedback;

  // Em modo CAC, Total Reward Pool = creators * máximo por creator
  const totalPrizePool = data.is_cac
    ? creatorsCount * maxPerCreator
    : (data.list_kols?.reduce((sum, kol) => sum + (kol.amount || 0), 0) || 0);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-8">
        Set up payment for your private campaign
      </h2>

      {/* Reward Format */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Reward Format <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-reward-format"
          options={rewardFormatOptions}
          value={data.rewardFormat || "fixed"}
          onChange={(value) =>
            handleChange(
              "rewardFormat",
              value as CampaignFormData["rewardFormat"]
            )
          }
          placeholder="Select"
          disabled={true}
        />
      </div>

      {/* Payment Chain */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Select the Chain for payment{" "}
          <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-payment-chain"
          options={chainOptions}
          value={data.payment_chain || ""}
          onChange={(value) => handleChange("payment_chain", value as string)}
          placeholder="Select"
        />
        <p className="text-gray-400 text-sm mt-2">
          Can't find your chain?{" "}
          <span className="text-[var(--color-primary)] cursor-pointer">
            Contact support
          </span>
        </p>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Select Token <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-payment-token"
          options={availableTokens}
          value={data.payment_token || ""}
          onChange={(value) => handleChange("payment_token", value as string)}
          placeholder="Select"
          disabled={!data.payment_chain}
        />
      </div>

      {/* Min/Max Links - oculto quando submission_format e content_format são apenas "feedback" */}
      {showMinMaxLinks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Minimum Links{" "}
              <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="campaign-qtd-min-links"
              type="number"
              min="1"
              value={data.qtd_min_links || ""}
              onChange={(e) =>
                handleChange("qtd_min_links", Number(e.target.value))
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Maximum Links{" "}
              <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="campaign-qtd-max-links"
              type="number"
              min="1"
              value={data.qtd_max_links || ""}
              onChange={(e) =>
                handleChange("qtd_max_links", Number(e.target.value))
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
              placeholder="5"
            />
          </div>
        </div>
      )}

      {/* Total Reward Pool Summary */}
      <div className="bg-[var(--color-card)] rounded-2xl p-6">
        <div className="text-left">
          <h3 className="text-white text-lg font-semibold">
            Total Reward Pool: {totalPrizePool.toFixed(2)}{" "}
            {data.payment_token?.toUpperCase() || ""}
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Total amount based on selected creators and their rewards. You can
            test the campaign before launching it and depositing tokens.
          </p>
          {data.list_kols && data.list_kols.length > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              {data.list_kols.length} creator{data.list_kols.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
