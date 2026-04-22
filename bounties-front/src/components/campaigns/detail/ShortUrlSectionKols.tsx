"use client";

import { useState, useEffect } from "react";
import { creatorApi } from "@/lib/api/creator";

interface ShortUrlSectionKolsProps {
  campaignId?: string;
  campaignStatus?: string;
}

export default function ShortUrlSectionKols({ campaignId, campaignStatus }: ShortUrlSectionKolsProps) {
  const [linkReferral, setLinkReferral] = useState("");
  const [shortURL, setShortURL] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingShortUrl, setIsLoadingShortUrl] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setIsLoadingShortUrl(false);
      return;
    }
    const fetchShortUrl = async () => {
      try {
        const result = await creatorApi.getShortenerKols(campaignId);
        if (result.shortURL) {
          setShortURL(result.shortURL);
        }
      } catch {
        // Usuário ainda não tem short URL para esta campanha
      } finally {
        setIsLoadingShortUrl(false);
      }
    };
    fetchShortUrl();
  }, [campaignId]);

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = linkReferral.trim();
    if (!url) {
      setError("Informe o link que deseja encurtar.");
      return;
    }
    if (!campaignId) {
      setError("ID da campanha não encontrado.");
      return;
    }
    try {
      setError(null);
      setIsGenerating(true);
      const response = await creatorApi.createShortenerKols(campaignId, url);
      if (response.success && response.data.shortURL) {
        setShortURL(response.data.shortURL);
      } else {
        setError("Não foi possível encurtar o link.");
      }
    } catch (err: unknown) {
      console.error("Error generating short URL for KOLs:", err);
      setError(err.message || "Erro ao encurtar o link. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!shortURL) return;
    try {
      await navigator.clipboard.writeText(shortURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNewLink = () => {
    setShortURL(null);
    setLinkReferral("");
    setError(null);
  };

  if (isLoadingShortUrl) {
    return (
      <div className="space-y-4 mt-8">
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
        <div className="h-12 w-full bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-white">Encurtador de URL</h3>
        <div className="relative group">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400 cursor-help hover:text-gray-300 transition-colors"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
            <p>Cole aqui o link que você quer encurtar (ex.: seu link de referral ou de conteúdo).</p>
            <div className="absolute left-4 bottom-0 transform translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      </div>

      {!shortURL ? (
        <form onSubmit={handleGenerateLink} className="space-y-3">
          <input
            type="url"
            value={linkReferral}
            onChange={(e) => setLinkReferral(e.target.value)}
            placeholder="https://..."
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            disabled={isGenerating}
          />
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={isGenerating || !linkReferral.trim()}
            className="cursor-pointer w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isGenerating ? "Encurtando..." : "Encurtar link"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shortURL}
              readOnly
              className="flex-1 bg-transparent text-white placeholder:text-white/60 px-4 py-2 rounded-lg border border-white/30 outline-none focus:border-white/60"
            />
            <button
              onClick={handleCopy}
              className="cursor-pointer p-2 bg-[#fe5900] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              title={copied ? "Copiado!" : "Copiar"}
            >
              {copied ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
