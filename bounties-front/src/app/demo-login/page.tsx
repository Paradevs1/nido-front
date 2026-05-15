"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DEMO_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTA2OGU2YWIyMzdiOWE0ODBhY2Q3MzkiLCJlbWFpbCI6ImRlbW8taG9zdEBuaWRvLmRlbW8iLCJyb2xlIjoiSE9TVCIsInN0YXR1cyI6ImFjdGl2ZSIsInJlZ2lzdGVyQ29tcGxldGVkIjp0cnVlLCJpYXQiOjE3Nzg4MTQ1NzAsImV4cCI6MTc4MTQwNjU3MCwiYXVkIjoiYm91bnRpZXMtdXNlcnMiLCJpc3MiOiJib3VudGllcy1hcGkifQ.qjMdk1XtpdqLkTj39vUfRpYzmytHKCjNlfL6OUvEoFY";

const DEMO_USER = JSON.stringify({
  role: "HOST",
  registerCompleted: true,
  accountStatus: "active",
});

const CAMPAIGN_ID = "6a05df2d69ba03d1c1ecf76e";

export default function DemoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    localStorage.setItem("bounties_token", DEMO_TOKEN);
    localStorage.setItem("auth_user", DEMO_USER);
    document.cookie = `bounties_token=${DEMO_TOKEN}; path=/`;
    document.cookie = `auth_user=${encodeURIComponent(DEMO_USER)}; path=/`;
    router.push(`/host/campaign/${CAMPAIGN_ID}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/assets/nido/logo.svg"
          alt="NIDO"
          width={56}
          height={56}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-2xl font-bold text-white tracking-tight">
          NIDO
        </span>
        <span className="text-xs text-amber-500/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          DEMO · TESTNET
        </span>
      </div>

      <div className="w-full max-w-sm bg-[var(--color-card)] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white">Entrar como Host</h1>
          <p className="text-xs text-[#696E72]">
            Acesso demo para visualizar o fluxo Stellar Escrow na testnet.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-[#696E72]">Conta</span>
            <span className="text-white font-medium">ParaDevs (Demo)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-[#696E72]">Rede</span>
            <span className="text-amber-400 font-medium">Stellar Testnet</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#696E72]">Campanha</span>
            <span className="text-white font-mono">
              {CAMPAIGN_ID.slice(0, 8)}…
            </span>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando…" : "Entrar e ver campanha"}
        </button>
      </div>

      <p className="text-[11px] text-[#696E72] text-center max-w-xs">
        Esta página é exclusiva para demonstração do hackathon 37 Graus.
      </p>
    </div>
  );
}
