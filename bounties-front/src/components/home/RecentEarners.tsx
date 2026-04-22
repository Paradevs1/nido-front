"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import {
  creatorApi,
  RecentEarners as RecentEarnersType,
} from "@/lib/api/creator";
import TwitterAvatar from "@/components/ui/TwitterAvatar";

export default function RecentEarners() {
  const [earners, setEarners] = useState<RecentEarnersType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current || isFetchingRef.current) return;

    const fetchEarners = async () => {
      isFetchingRef.current = true;
      hasFetchedRef.current = true;
      try {
        setLoading(true);
        const data = await creatorApi.getRecentEarners();
        setEarners(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar recent earners:", err);
        setError("Erro ao carregar recent earners");
        setEarners([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchEarners();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderEarnerCard = (earner: RecentEarnersType, index: number) => (
    <div key={index} className="flex-shrink-0 w-64 rounded-2xl p-4 mx-2">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
          <TwitterAvatar
            src={earner.twitter_profile_image}
            alt={earner.username}
            fallbackInitial={earner.username[0]}
            fill
            className="object-cover"
          />
        </div>

        {/* Nome e Descrição */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {earner.username}
          </h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {earner.description || "..."}
          </p>
        </div>

        {/* USDC Icon e Texto - alinhado à direita */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full"></div>
              <Image
                src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                alt="USDC"
                width={22}
                height={22}
                className="rounded-full relative z-10"
                unoptimized
              />
            </div>
            <span className="text-white text-sm font-semibold">USDC</span>
          </div>
          {/* Valor abaixo do ícone/texto USDC */}
          <span className="text-white text-sm font-semibold">
            $ {formatAmount(earner.amount_earned)}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-8">
        <h2
          className="text-xl font-bold mb-6"
          style={{
            color: "#B8B8B8",
            letterSpacing: "0.05em",
          }}
        >
          RECENT EARNERS
        </h2>
        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-5 z-5 pointer-events-none"
            style={{
              backdropFilter: "blur(1px)",
              WebkitBackdropFilter: "blur(1px)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-5 z-5 pointer-events-none"
            style={{
              backdropFilter: "blur(1px)",
              WebkitBackdropFilter: "blur(1px)",
            }}
          />
          <div className="flex overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 rounded-2xl p-4 mx-2 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-20 bg-gray-700 rounded mb-1.5"></div>
                    <div className="h-3 w-28 bg-gray-700 rounded mt-1"></div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                      <div className="h-3.5 w-10 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-3.5 w-14 bg-gray-700 rounded mt-0.5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || earners.length === 0) {
    return null;
  }

  const duplicatedEarners = [...earners, ...earners];

  return (
    <div className="mt-8">
      <h2
        className="text-xl font-bold mb-6"
        style={{
          color: "#B8B8B8",
          letterSpacing: "0.05em",
        }}
      >
        RECENT EARNERS
      </h2>
      <div className="relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-5 z-5"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        <div
          className="absolute right-0 top-0 bottom-0 w-5 z-5"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        <Marquee speed={30} gradient={false} className="py-2">
          {duplicatedEarners.map((earner, index) =>
            renderEarnerCard(earner, index)
          )}
        </Marquee>
      </div>
    </div>
  );
}
