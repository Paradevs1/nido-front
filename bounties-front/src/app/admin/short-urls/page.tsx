"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCampaignsCombo,
  getCampaignShortUrls,
  type CampaignOption,
  type ShortUrlItem,
  type CampaignShortUrlsResponse,
} from "@/lib/api/admin";

const PAGE_SIZE = 10;
const CAMPAIGNS_PER_PAGE = 9;

function ShortUrlsTableWithPagination({
  items,
  page,
  onPageChange,
  pageSize,
}: {
  items: ShortUrlItem[];
  page: number;
  onPageChange: (p: number) => void;
  pageSize: number;
}) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0)),
    [items]
  );
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-white/80 font-semibold text-sm w-20">Posição</th>
              <th className="px-4 py-3 text-white/80 font-semibold text-sm">Twitter / @</th>
              <th className="px-4 py-3 text-white/80 font-semibold text-sm">Short URL</th>
              <th className="px-4 py-3 text-white/80 font-semibold text-sm">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item: ShortUrlItem, i: number) => {
              const rank = start + i + 1;
              const isFirst = rank === 1;
              const isLast = rank === total;
              return (
                <tr
                  key={start + i}
                  className={`border-b border-white/5 transition-colors ${
                    isFirst
                      ? "bg-amber-500/10 border-l-4 border-l-amber-400"
                      : isLast
                        ? "bg-white/5 border-l-4 border-l-white/30"
                        : "hover:bg-white/5"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={isFirst ? "text-amber-400 font-bold" : isLast ? "text-white/50 font-medium" : "text-white/70"}>
                      {rank}°
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {item.twitter_username ? `@${item.twitter_username}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/80 font-mono text-sm break-all">
                    {item.shortURL}
                  </td>
                  <td className="px-4 py-3 text-white/80 font-medium">
                    {typeof item.clicks === "number"
                      ? item.clicks.toLocaleString("pt-BR")
                      : "0"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <p className="text-white/50 text-sm">
            {total} resultado(s) · página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminShortUrlsPage() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignOption | null>(null);
  const [shortUrlsData, setShortUrlsData] = useState<CampaignShortUrlsResponse | null>(null);
  const [shortUrlsLoading, setShortUrlsLoading] = useState(false);
  const [shortUrlsError, setShortUrlsError] = useState<string | null>(null);
  const [shortUrlsPage, setShortUrlsPage] = useState(1);
  const [campaignsPage, setCampaignsPage] = useState(1);

  const totalCampaignPages = Math.max(1, Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE));
  const currentCampaignsPage = Math.min(Math.max(1, campaignsPage), totalCampaignPages);
  const paginatedCampaigns = useMemo(
    () =>
      campaigns.slice(
        (currentCampaignsPage - 1) * CAMPAIGNS_PER_PAGE,
        currentCampaignsPage * CAMPAIGNS_PER_PAGE
      ),
    [campaigns, currentCampaignsPage]
  );

  useEffect(() => {
    getCampaignsCombo()
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const openCampaign = (campaign: CampaignOption) => {
    setSelectedCampaign(campaign);
    setShortUrlsData(null);
    setShortUrlsError(null);
    setShortUrlsLoading(true);
    getCampaignShortUrls(campaign.id)
      .then(setShortUrlsData)
      .catch((err) => setShortUrlsError(err instanceof Error ? err.message : "Erro ao carregar"))
      .finally(() => setShortUrlsLoading(false));
  };

  const closeDetail = () => {
    setSelectedCampaign(null);
    setShortUrlsData(null);
    setShortUrlsError(null);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Short URLs</h1>
        <p className="text-white/60 mt-1">
          Selecione uma campanha para ver todas as short URLs e cliques por creator.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Campanhas</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : campaigns.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
          Carregando campanhas...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
          Nenhuma campanha encontrada.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {paginatedCampaigns.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border p-5 transition-colors ${
                  selectedCampaign?.id === c.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <h3 className="text-white font-semibold mb-4 line-clamp-2">
                  {c.name || "Sem título"}
                </h3>
                <button
                  type="button"
                  onClick={() => openCampaign(c)}
                  className="w-full py-2 px-4 rounded-lg bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Ver short URLs
                </button>
              </div>
            ))}
          </div>
          {totalCampaignPages > 1 && (
            <div className="flex items-center justify-between mb-8 pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm">
                {campaigns.length} campanha(s) · página {currentCampaignsPage} de {totalCampaignPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignsPage((p) => Math.max(1, p - 1))}
                  disabled={currentCampaignsPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignsPage((p) => Math.min(totalCampaignPages, p + 1))}
                  disabled={currentCampaignsPage >= totalCampaignPages}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedCampaign && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">
              Short URLs — {shortUrlsData?.campaignTitle ?? selectedCampaign.name}
            </h2>
            <button
              type="button"
              onClick={closeDetail}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <div className="p-6">
            {shortUrlsLoading ? (
              <div className="p-12 text-center text-white/60">Carregando short URLs...</div>
            ) : shortUrlsError ? (
              <div className="p-6 text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                {shortUrlsError}
              </div>
            ) : shortUrlsData && shortUrlsData.items.length === 0 ? (
              <div className="p-12 text-center text-white/50">Nenhuma short URL nesta campanha.</div>
            ) : shortUrlsData ? (
              <ShortUrlsTableWithPagination
                items={shortUrlsData.items}
                page={shortUrlsPage}
                onPageChange={setShortUrlsPage}
                pageSize={PAGE_SIZE}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
