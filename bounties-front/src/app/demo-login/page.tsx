"use client";

import { useState } from "react";
import Image from "next/image";

const DEMO_CAMPAIGN_ID = "6a0e1cadead105ec638de666";

const SESSIONS = {
  host: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTA2OGU2YWIyMzdiOWE0ODBhY2Q3MzkiLCJlbWFpbCI6ImRlbW8taG9zdEBuaWRvLmRlbW8iLCJyb2xlIjoiSE9TVCIsInBsYW5OYW1lIjoiQkFTSUMiLCJzdGF0dXMiOiJhY3RpdmUiLCJyZWdpc3RlckNvbXBsZXRlZCI6dHJ1ZSwiaWF0IjoxNzc5MzA3MzI0LCJleHAiOjE3ODcwODMzMjQsImF1ZCI6ImJvdW50aWVzLXVzZXJzIiwiaXNzIjoiYm91bnRpZXMtYXBpIn0.fGWkv26kOTvCtKF2lMcO0FkqPnbuF-ttgVX0YNxoe_M",
    user: { id: "6a068e6ab237b9a480acd739", username: "nido-demo", email: "demo-host@nido.demo", role: "host", registerCompleted: true, accountStatus: "active", active_account_host: true },
    redirect: `/host/campaign/${DEMO_CAMPAIGN_ID}`,
    label: "Entrar como Host",
    description: "Veja o escrow, aprove pagamentos e gerencie disputas.",
    color: "bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600]",
  },
  talent: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDIiLCJlbWFpbCI6ImRlbW8tdGFsZW50QG5pZG8uZGVtbyIsInJvbGUiOiJDUkVBVE9SIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzc5MzA3MzI0LCJleHAiOjE3ODcwODMzMjQsImF1ZCI6ImJvdW50aWVzLXVzZXJzIiwiaXNzIjoiYm91bnRpZXMtYXBpIn0.hhuXuPn2uhxTmQxw6DUZKJ6sYOhvL1vvNm48_LgF40k",
    user: { id: "000000000000000000000002", username: "demo-talent", email: "demo-talent@nido.demo", role: "creator", accountStatus: "active", first_login: false },
    redirect: `/creator/campaign/${DEMO_CAMPAIGN_ID}`,
    label: "Entrar como Talent",
    description: "Registre sua carteira, acompanhe o escrow e abra disputas.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
  },
  admin: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQG5pZG8uZGVtbyIsInJvbGUiOiJBRE1JTiIsInN0YXR1cyI6ImFjdGl2ZSIsInJlZ2lzdGVyQ29tcGxldGVkIjp0cnVlLCJpYXQiOjE3NzkzMDczMjQsImV4cCI6MTc4NzA4MzMyNCwiYXVkIjoiYm91bnRpZXMtdXNlcnMiLCJpc3MiOiJib3VudGllcy1hcGkifQ.Ettdn9zz0hM4m1_PJYuFtrWnXgUmblCuO9EwqvcRdc8",
    user: { id: "000000000000000000000001", username: "admin", email: "admin@nido.demo", role: "admin", registerCompleted: true, accountStatus: "active" },
    redirect: "/admin/stellar-disputes",
    label: "Entrar como Admin",
    description: "Painel de arbitragem — revisar disputas e emitir decisão.",
    color: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700",
  },
} as const;

type Role = keyof typeof SESSIONS;

export default function DemoLoginPage() {
  const [loading, setLoading] = useState<Role | null>(null);

  const handleLogin = (role: Role) => {
    setLoading(role);
    const { token, user, redirect } = SESSIONS[role];
    const userStr = JSON.stringify({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    localStorage.setItem("bounties_token", token);
    localStorage.setItem("auth_user", userStr);
    document.cookie = `bounties_token=${token}; path=/; max-age=2592000; SameSite=Strict`;
    document.cookie = `auth_user=${encodeURIComponent(userStr)}; path=/; max-age=2592000; SameSite=Strict`;
    // Full reload para reinicializar o AuthContext com o novo usuário
    window.location.href = redirect;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-8 px-6">
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
          DEMO · TESTNET
        </span>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {(Object.keys(SESSIONS) as Role[]).map((role) => {
          const s = SESSIONS[role];
          return (
            <div key={role} className="bg-[var(--color-card)] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">{s.label}</p>
                <p className="text-xs text-[#696E72]">{s.description}</p>
              </div>
              <button
                onClick={() => handleLogin(role)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-xl ${s.color} text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === role ? "Entrando…" : s.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-sm bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-1">
        <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide">Rede</p>
        <p className="text-xs text-amber-400 font-semibold">Stellar Testnet — requer Freighter wallet</p>
      </div>

      <p className="text-[11px] text-[#696E72] text-center max-w-xs">
        Demonstração exclusiva do hackathon 37 Graus (NearX × SDF).
      </p>
    </div>
  );
}
