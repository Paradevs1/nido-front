"use client";

import { useState } from "react";
import Image from "next/image";
import { IS_MAINNET, NETWORK_BADGE } from "@/lib/stellar/network";
import { API_BASE_URL } from "@/lib/api/config";

// Display-only config — NO tokens here. Tokens are minted server-side by
// POST /api/demo/login (gated by DEMO_LOGIN_ENABLED), signed with the live
// JWT_SECRET. Nothing sensitive ships in the client bundle, and there is no
// admin role: arbitration uses the regular authenticated admin login.

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

type Role = "host" | "talent1" | "talent2" | "talent3" | "talent4" | "talent5";

interface RoleCard {
  label: string;
  description: string;
  color: string;
  badge?: string;
}

const HOST: RoleCard = {
  label: "Entrar como Host",
  description: "Crie o escrow, deposite o USDC e aprove pagamentos.",
  color: "bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600]",
};

const TALENTS: { role: Role; card: RoleCard }[] = [1, 2, 3, 4, 5].map((n) => ({
  role: `talent${n}` as Role,
  card: {
    label: `Talent · Slot ${n}`,
    description: "Registre sua wallet Freighter e aguarde o escrow do Host.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
    badge: `Slot ${n}`,
  },
}));

export default function DemoLoginPage() {
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (role: Role) => {
    setLoading(role);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/demo/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.token) {
        throw new Error(json?.message || "Demo-login indisponível");
      }
      const { token, user, redirect } = json.data;
      const userStr = JSON.stringify({
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem("bounties_token", token);
      localStorage.setItem("auth_user", userStr);
      document.cookie = `bounties_token=${token}; path=/; max-age=2592000; SameSite=Strict`;
      document.cookie = `auth_user=${encodeURIComponent(userStr)}; path=/; max-age=2592000; SameSite=Strict`;
      window.location.href = redirect;
    } catch (e: any) {
      setError(e.message || "Falha ao entrar");
      setLoading(null);
    }
  };

  if (!ENABLED) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="text-2xl font-bold text-white tracking-tight">NIDO</span>
        <p className="text-sm text-[#696E72]">Esta página não está disponível.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/assets/nido/logo.svg"
          alt="NIDO"
          width={56}
          height={56}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="text-2xl font-bold text-white tracking-tight">NIDO</span>
        <span className="text-xs text-amber-500/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          DEMO · {NETWORK_BADGE}
        </span>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Host */}
        <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">{HOST.label}</p>
            <p className="text-xs text-[#696E72]">{HOST.description}</p>
          </div>
          <button
            onClick={() => handleLogin("host")}
            disabled={loading !== null}
            className={`w-full py-2.5 rounded-xl ${HOST.color} text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === "host" ? "Entrando…" : HOST.label}
          </button>
        </div>

        {/* Talent slots */}
        <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">Entrar como Talent</p>
            <p className="text-xs text-[#696E72]">Cada slot é uma campanha independente. Escolha um slot livre.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TALENTS.map(({ role, card }) => (
              <button
                key={role}
                onClick={() => handleLogin(role)}
                disabled={loading !== null}
                className={`py-2.5 rounded-xl ${card.color} text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === role ? "…" : card.badge}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-1">
        <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide">Rede</p>
        <p className="text-xs text-amber-400 font-semibold">Stellar {IS_MAINNET ? "Mainnet" : "Testnet"} — requer Freighter wallet</p>
      </div>

      <p className="text-[11px] text-[#696E72] text-center max-w-xs">
        Demonstração exclusiva do programa 37 Graus (NearX × SDF).
      </p>
    </div>
  );
}
