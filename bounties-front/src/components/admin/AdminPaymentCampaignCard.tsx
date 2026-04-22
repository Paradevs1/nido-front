"use client";

import type { CampaignOption } from "@/lib/api/admin";

function formatCountryName(name: string): string {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function HostCountries({ country }: { country?: Array<{ name: string }> }) {
  if (!country?.length) {
    return <span className="text-white/50 text-sm">—</span>;
  }
  return (
    <>
      {country.map((c, index) => {
        const countryName = (c.name ?? "").toLowerCase();
        const isBrazil = countryName === "brazil" || countryName === "brasil";
        const isGlobal = countryName === "global" || countryName === "latam";
        return (
          <div key={`${c.name}-${index}`} className="flex items-center gap-1">
            {isBrazil && (
              <svg className="w-5 h-4 shrink-0" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="14" fill="#009739" />
                <path d="M10 1.5L3.5 7L10 12.5L16.5 7L10 1.5Z" fill="#FEDD00" />
                <circle cx="10" cy="7" r="2.8" fill="#012169" />
                <path d="M10 5.2L9 6.5L10 7.8L11 6.5L10 5.2Z" fill="#FFFFFF" />
              </svg>
            )}
            {isGlobal && (
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="text-white font-medium text-sm">{formatCountryName(c.name)}</span>
            {index < country.length - 1 && <span className="text-white">,</span>}
          </div>
        );
      })}
    </>
  );
}

export default function AdminPaymentCampaignCard({
  campaign,
  onSelect,
}: {
  campaign: CampaignOption;
  onSelect: (c: CampaignOption) => void;
}) {
  const hostLabel = campaign.host?.name_company || campaign.host?.username || "Host";
  const initial = (hostLabel || "?").charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect(campaign)}
      className="bg-[var(--color-card)] rounded-3xl cursor-pointer p-6 flex flex-col h-full min-h-[260px] text-left w-full border border-transparent hover:border-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {initial}
          </span>
          <span className="text-white font-medium text-sm truncate">{hostLabel}</span>
          <span className="text-gray-500 shrink-0">|</span>
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            <HostCountries country={campaign.country} />
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full shrink-0 ${
            campaign.isPrivate ? "bg-amber-500" : "bg-emerald-500"
          }`}
          title={campaign.isPrivate ? "Privada" : "Pública"}
        />
      </div>

      <div className="mb-3">
        <h3 className="text-white font-semibold text-lg md:text-xl leading-tight break-words line-clamp-2">
          {campaign.name || "Sem título"}
        </h3>
      </div>

      <p className="text-white/50 text-sm mb-4 flex-grow line-clamp-3">
        Abra para listar pagamentos por criador (pendentes, confirmados, falhas) e links de comprovante quando
        disponíveis.
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
        <span
          className={`px-3 py-1 rounded-full font-medium ${
            campaign.isPrivate ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {campaign.isPrivate ? "Privada" : "Pública"}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="text-white text-sm font-medium">Pagamentos</span>
        <span className="text-[var(--color-primary)] text-sm font-semibold">Ver lista →</span>
      </div>
    </button>
  );
}
