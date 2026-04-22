"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { CreateCampaignRequest } from "@/lib/api/host";
import { CampaignFormData } from "../types";

interface RewardsStepProps {
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

export default function RewardsStep({ data, onChange }: RewardsStepProps) {
  const [tiers, setTiers] = useState(
    data.reward_tiers || [
      {
        position_initial: 1,
        position_final: "",
        title: "Winner",
        payment_amount: 10,
      },
    ]
  );
  const [availableTokens, setAvailableTokens] = useState<
    { value: string; label: string }[]
  >([]);

  const toNumberOrNull = (v: unknown) => {
    if (v === null || v === undefined) return null;
    const raw = String(v).trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const normalizeTiers = (input: any[]) => {
    const next = (input || []).map((t) => ({ ...t }));
    if (next.length === 0) {
      next.push({
        position_initial: 1,
        position_final: "",
        title: "Winner",
        payment_amount: 10,
      });
    }

    // Tier 1: From is always 1
    next[0].position_initial = 1;
    if (next[0].position_final === 1) next[0].position_final = ""; // avoid confusing default

    for (let i = 1; i < next.length; i++) {
      const prevTo = toNumberOrNull(next[i - 1].position_final);
      // Only auto-fill From when previous To is valid
      if (prevTo !== null) {
        next[i].position_initial = prevTo + 1;
      }
    }

    return next;
  };

  const isTierToInvalid = (tier: any) => {
    const from = toNumberOrNull(tier?.position_initial);
    const to = toNumberOrNull(tier?.position_final);
    if (from === null || to === null) return false;
    return to < from;
  };

  useEffect(() => {
    if (data.payment_chain && chainsAndTokens[data.payment_chain]) {
      setAvailableTokens(chainsAndTokens[data.payment_chain].tokens);
    } else {
      setAvailableTokens([]);
    }
  }, [data.payment_chain]);

  useEffect(() => {
    // Inicializa rewardFormat como "tier" se não estiver definido
    if (!data.rewardFormat) {
      onChange({ ...data, rewardFormat: "tier", useTiers: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Atualiza useTiers baseado no rewardFormat
    const shouldUseTiers = data.rewardFormat === "tier";
    if (data.useTiers !== shouldUseTiers) {
      const updatedData: CampaignFormData = { ...data, useTiers: shouldUseTiers };

      if (!updatedData.winner_count) updatedData.winner_count = 1;
      if (!updatedData.max_participants) updatedData.max_participants = 0;

      onChange(updatedData);
    }

  }, [data.rewardFormat]);

  useEffect(() => {
    if (data.useTiers && data.rewardFormat === "tier") {
      let totalPrizePool = 0;
      let totalWinners = 0;
      
      tiers.forEach((tier) => {
        const amount = Number(tier.payment_amount) || 0;
        const start = Number(tier.position_initial) || 0;
        const end = Number(tier.position_final) || 0;
        const count = end >= start ? end - start + 1 : 0;
        totalPrizePool += count * amount;
        totalWinners += count;
      });
      
      onChange({
        ...data,
        total_prize_pool: totalPrizePool,
        winner_count: totalWinners || 1,
        max_participants: data.max_participants || 0,
      });
    }
  }, [tiers, data.useTiers, data.rewardFormat]);

  useEffect(() => {
    // Keep tiers normalized whenever external data loads/changes
    const normalized = normalizeTiers(data.reward_tiers || tiers);
    setTiers(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleTierChange = (index: number, field: string, value: string) => {
    const updated = tiers.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : { ...tier }
    );

    const normalized = normalizeTiers(updated);
    setTiers(normalized);
    onChange({ ...data, reward_tiers: normalized });
  };

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const lastFrom = toNumberOrNull(last?.position_initial) ?? 1;
    const lastTo = toNumberOrNull(last?.position_final);
    // Require a valid To on the last tier to chain the next From
    if (lastTo === null || lastTo < lastFrom) return;

    const newTiers = normalizeTiers([
      ...tiers,
      {
        position_initial: lastTo + 1,
        position_final: "",
        title: "Tier",
        payment_amount: 0,
      },
    ]);

    setTiers(newTiers);
    onChange({ ...data, reward_tiers: newTiers });
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      const newTiers = normalizeTiers(tiers.filter((_, i) => i !== index));
      setTiers(newTiers);
      onChange({ ...data, reward_tiers: newTiers });
    }
  };

  const rewardFormatOptions = [
    { value: "tier", label: "Reward tier" },
  ];

  const lastTier = tiers[tiers.length - 1];
  const lastFrom = toNumberOrNull(lastTier?.position_initial) ?? 1;
  const lastTo = toNumberOrNull(lastTier?.position_final);
  const canAddTier = lastTo !== null && lastTo >= lastFrom;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-8">
        Set up the rewards for your campaign
      </h2>

      {/* Reward Format */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Reward Format <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-reward-format"
          options={rewardFormatOptions}
          value={data.rewardFormat || ""}
          onChange={(value) =>
            handleChange(
              "rewardFormat",
              value as CampaignFormData["rewardFormat"]
            )
          }
          placeholder="Select"
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
          onChange={(value) =>
            handleChange(
              "payment_chain",
              Array.isArray(value) ? value[0] ?? "" : value
            )
          }
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
          onChange={(value) =>
            handleChange(
              "payment_token",
              Array.isArray(value) ? value[0] ?? "" : value
            )
          }
          placeholder="Select"
          disabled={!data.payment_chain}
        />
      </div>

      {/* Tiers Distribution or Mindshare Score */}
      {/*         <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="tiers"
            checked={data.useTiers || false}
            onChange={(e) =>
              handleChange(
                "useTiers",
                e.target.checked as CampaignFormData["useTiers"]
              )
            }
            className="w-4 h-4 accent-[var(--color-primary)] bg-transparent border-white/50 rounded"
          />
          <label htmlFor="tiers" className="text-white text-sm">
            Add tiers to distribute your rewards
          </label>
        </div> */}

      {data.rewardFormat === "tier" && (
        <div>
          {data.useTiers ? (
          <div className="space-y-6">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border border-white/10 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-white text-lg font-medium">
                    Tier {index + 1} Winners{" "}
                    <span className="text-[var(--color-primary)]">*</span>
                  </h4>
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-400"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      From
                    </label>
                    <input
                      id={`campaign-tier-${index + 1}-position-initial`}
                      type="number"
                      value={tier.position_initial}
                      disabled
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none transition-all opacity-90 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      To
                    </label>
                    <input
                      id={`campaign-tier-${index + 1}-position-final`}
                      type="number"
                      value={tier.position_final}
                      onChange={(e) =>
                        handleTierChange(
                          index,
                          "position_final",
                          e.target.value
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder={index === 0 ? "e.g. 10" : ""}
                      min={Number(tier.position_initial) || 1}
                      className={`w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border outline-none transition-all ${
                        isTierToInvalid(tier)
                          ? "border-red-400/70 focus:border-red-300"
                          : "border-white/50 focus:border-white"
                      }`}
                    />
                    {isTierToInvalid(tier) && (
                      <p className="mt-2 text-xs text-red-300">
                        The \"To\" value must be greater than or equal to \"From\".
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Reward per winner
                    </label>
                    <input
                      id={`campaign-tier-${index + 1}-payment-amount`}
                      type="number"
                      value={tier.payment_amount}
                      onChange={(e) =>
                        handleTierChange(
                          index,
                          "payment_amount",
                          e.target.value
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTier}
              disabled={!canAddTier}
              className={`w-full border-2 border-dashed py-4 rounded-full transition-colors font-medium ${
                canAddTier
                  ? "cursor-pointer border-white/30 text-white hover:border-white/50"
                  : "cursor-not-allowed border-white/15 text-white/40"
              }`}
            >
              + Add Tier
            </button>
          </div>
        ) : (
          <>
            {/* Number of Winners */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Number of winners{" "}
                <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                id="campaign-winner-count"
                type="number"
                value={data.winner_count || ""}
                onChange={(e) =>
                  handleChange("winner_count", Number(e.target.value))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
                placeholder="133"
              />
            </div>
            {/* Max Participants */}
            <div className="mt-6">
              <label className="block text-white text-sm font-medium mb-2">
                Max participants
              </label>
              <input
                id="campaign-max-participants"
                type="number"
                value={data.max_participants || ""}
                onChange={(e) =>
                  handleChange("max_participants", Number(e.target.value))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
                placeholder="Enter max participants"
              />
            </div>
            {/* Total Reward Pool Input */}
            <div className="mt-6">
              <label className="block text-white text-sm font-medium mb-2">
                Total Reward Pool{" "}
                <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                id="campaign-total-prize-pool"
                type="number"
                value={data.total_prize_pool || ""}
                onChange={(e) =>
                  handleChange("total_prize_pool", Number(e.target.value))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
                placeholder="20"
              />
            </div>
          </>
        )}
        </div>
      )}


      {/* Reward Pool Summary */}
      <div className="bg-[var(--color-card)] rounded-2xl p-6">
        <div className="text-left">
          <h3 className="text-white text-lg font-semibold">
            Total Reward Pool: {data.total_prize_pool || 0} $
            {data.payment_token?.toUpperCase() || ""}
          </h3>
          <p className="text-gray-400 text-sm">
            You can test the campaign before launching it and depositing tokens
          </p>
        </div>
      </div>
    </div>
  );
}
