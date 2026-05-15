"use client";

import { useEffect, useState } from "react";
import { campaignApi, CampaignTier, Campaign } from "@/lib/api/campaign";
import Image from "next/image";

interface CampaignPrizesProps {
  campaignId: string;
  campaign: Campaign;
}

interface CampaignPrizesData {
  reward_tiers: CampaignTier[];
  total_prize_pool: number;
}

const getOrdinalSuffix = (num: number) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const getChainIconUrl = (chain: string): string => {
  const chainLower = chain.toLowerCase();
  const chainIcons: Record<string, string> = {
    ethereum:
      "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png",
    base: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/base/info/logo.png",
    arbitrum:
      "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/arbitrum/info/logo.png",
    berachain: "/assets/chains/berachain.png",
    bsc: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/smartchain/info/logo.png",
    hyperevm: "/assets/chains/hyperevm.png",
    polygon:
      "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/polygon/info/logo.png",
    solana:
      "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
    sui: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/sui/info/logo.png",
  };

  return chainIcons[chainLower] || chainIcons.ethereum;
};

const TOKEN_LOGOS: Record<string, string> = {
  usdc:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  usdt:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  usde:
    "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3/logo.png",
};

const getTokenIconUrl = (token: string): string =>
  TOKEN_LOGOS[token?.toLowerCase() ?? "usdc"] ?? TOKEN_LOGOS.usdc;

const formatQuantity = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
};

export default function CampaignPrizes({
  campaignId,
  campaign,
}: CampaignPrizesProps) {
  const [prizesData, setPrizesData] = useState<CampaignPrizesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignTiers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(campaign);

        // Para campanhas privadas, não busca tiers
        if (campaign.isPrivate) {
          let total = campaign.total_prize_pool || 0;
          if (!campaign.is_cac && campaign.list_kols?.length) {
            total = campaign.list_kols.reduce(
              (sum, kol) => sum + (kol.amount ?? 0),
              0
            );
          }
          setPrizesData({
            reward_tiers: [],
            total_prize_pool: total,
          });
        } else {
          const response = await campaignApi.getCampaignTiers(campaignId);
          setPrizesData({
            reward_tiers: response.reward_tiers || [],
            total_prize_pool: response.total_prize_pool || 0,
          });
        }
      } catch (err: unknown) {
        console.error("Erro ao buscar tiers da campanha:", err);
        setError("Erro ao carregar prêmios");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignTiers();
    }
  }, [campaignId, campaign.isPrivate, campaign.is_cac, campaign.total_prize_pool, campaign.list_kols]);

  if (loading) {
    return (
      <div className="bg-transparent">
        <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-full bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !prizesData) {
    return (
      <div className="bg-transparent">
        <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
        <p className="text-gray-500 text-sm">
          {error || "Erro ao carregar prêmios"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
      <div className="space-y-2">
        {/* Total + token/chain: exibir para todas (pública e privada) quando houver payment_chain */}
        {campaign.payment_chain && (
          <div className="flex items-center gap-2 mb-3">
            <div>
              {!(campaign.isPrivate && !campaign.is_cac) && (
                <p className="text-xl font-bold text-white mt-0.5">
                  ${prizesData.total_prize_pool.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                {campaign.payment_token} - {campaign.payment_chain}
                <Image
                  src={getChainIconUrl(campaign.payment_chain)}
                  alt={campaign.payment_chain}
                  width={16}
                  height={16}
                  className="rounded-full"
                  unoptimized
                />
              </p>
            </div>
          </div>
        )}

        {/* Prize Distribution - Apenas para campanhas públicas */}
        {!campaign.isPrivate && (
          <div className="space-y-2 flex flex-col items-left">
            {prizesData.reward_tiers && prizesData.reward_tiers.length > 0 ? (
              prizesData.reward_tiers.map((tier, index) => {
                // Sempre mostrar apenas um ordinal quando initial === final
                // Converter para número para garantir comparação correta
                const initial = Number(tier.position_initial);
                const final = Number(tier.position_final);
                const positionText =
                  initial === final
                    ? `${initial}${getOrdinalSuffix(initial)}`
                    : `${initial}${getOrdinalSuffix(
                        initial
                      )} - ${final}${getOrdinalSuffix(final)}`;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm py-1 w-full max-w-xs"
                  >
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-gray-400 text-xs">
                        {positionText}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                    <span className="font-semibold text-white text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
                      ${(tier.payment_amount ?? 0).toLocaleString()}{" "}
                      {campaign.payment_token}
                      <Image
                        src={getTokenIconUrl(campaign.payment_token)}
                        alt={campaign.payment_token}
                        width={16}
                        height={16}
                        className="rounded-full"
                        unoptimized
                      />
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No reward tiers available</p>
            )}
          </div>
        )}
        
        {/* Campanha privada não-CAC: lista username ---- amount */}
        {campaign.isPrivate && !campaign.is_cac && campaign.list_kols && campaign.list_kols.length > 0 && (
          <div className="mt-3 space-y-2 flex flex-col">
            {campaign.list_kols.map((kol, index) => {
              const amount = kol.amount ?? 0;
              const displayName = kol.username;
              return (
                <div
                  key={kol.userId || index}
                  className="flex items-center gap-2 text-sm py-1 w-full max-w-xs"
                >
                  <span className="text-white text-sm truncate flex-shrink-0">{displayName}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent min-w-2" />
                  <span className="font-semibold text-white text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
                    ${amount.toLocaleString()} {campaign.payment_token}
                    <Image
                      src={getTokenIconUrl(campaign.payment_token)}
                      alt={campaign.payment_token}
                      width={16}
                      height={16}
                      className="rounded-full"
                      unoptimized
                    />
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Campanha privada CAC: exibir amount_convertion / quantity_conversion format_cac */}
        {campaign.isPrivate && campaign.is_cac && campaign.amount_convertion != null && (
          <div className="mt-2 space-y-1">
            <hr className="border-white/10 my-3" />
            <p className="text-white text-sm font-medium flex items-center gap-1.5">
              {campaign.format_cac === 'view' ? (
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              )}
              ${campaign.amount_convertion}/{formatQuantity(campaign.quantity_conversion || 1)} {campaign.format_cac === 'view' ? 'views' : 'clicks'}
            </p>
            {campaign.limit_amount_convertion != null && (
              <p className="text-gray-400 text-xs">
                Max per creator: ${campaign.limit_amount_convertion}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
