"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SESSIONS = {
  host: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTA2OGU2YWIyMzdiOWE0ODBhY2Q3MzkiLCJlbWFpbCI6ImRlbW8taG9zdEBuaWRvLmRlbW8iLCJyb2xlIjoiSE9TVCIsInBsYW5OYW1lIjoiQkFTSUMiLCJzdGF0dXMiOiJhY3RpdmUiLCJyZWdpc3RlckNvbXBsZXRlZCI6dHJ1ZSwiaWF0IjoxNzc5MzA3MzI0LCJleHAiOjE3ODcwODMzMjQsImF1ZCI6ImJvdW50aWVzLXVzZXJzIiwiaXNzIjoiYm91bnRpZXMtYXBpIn0.fGWkv26kOTvCtKF2lMcO0FkqPnbuF-ttgVX0YNxoe_M",
    user: { id: "6a068e6ab237b9a480acd739", username: "nido-demo", email: "demo-host@nido.demo", role: "host", registerCompleted: true, accountStatus: "active", active_account_host: true },
    redirect: "/host/campaign/6b0e1cadead105ec638de777",
    label: "Entrar como Host",
    description: "Veja o escrow, aprove pagamentos e gerencie disputas.",
    color: "bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600]",
    badge: null,
  },
  talent1: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDIiLCJlbWFpbCI6ImRlbW8tdGFsZW50QG5pZG8uZGVtbyIsInJvbGUiOiJDUkVBVE9SIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzc5MzA3MzI0LCJleHAiOjE3ODcwODMzMjQsImF1ZCI6ImJvdW50aWVzLXVzZXJzIiwiaXNzIjoiYm91bnRpZXMtYXBpIn0.hhuXuPn2uhxTmQxw6DUZKJ6sYOhvL1vvNm48_LgF40k",
    user: { id: "000000000000000000000002", username: "demo-talent1", email: "demo-talent1@nido.demo", role: "creator", accountStatus: "active", first_login: false },
    redirect: "/creator/campaign/6b0e1cadead105ec638de777",
    label: "Talent · Slot 1",
    description: "Registre sua wallet Freighter e aguarde o escrow do Host.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
    badge: "Slot 1",
  },
  talent2: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDMiLCJlbWFpbCI6ImRlbW8tdGFsZW50MkBuaWRvLmRlbW8iLCJyb2xlIjoiQ1JFQVRPUiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc3OTMwNzMyNCwiZXhwIjoxNzg3MDgzMzI0LCJhdWQiOiJib3VudGllcy11c2VycyIsImlzcyI6ImJvdW50aWVzLWFwaSJ9.KEkznYgetWVfG-TqS9QCDpDlL7UvGc_rutux8p06Fx8",
    user: { id: "000000000000000000000003", username: "demo-talent2", email: "demo-talent2@nido.demo", role: "creator", accountStatus: "active", first_login: false },
    redirect: "/creator/campaign/6b0e1cadead105ec638de778",
    label: "Talent · Slot 2",
    description: "Registre sua wallet Freighter e aguarde o escrow do Host.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
    badge: "Slot 2",
  },
  talent3: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDQiLCJlbWFpbCI6ImRlbW8tdGFsZW50M0BuaWRvLmRlbW8iLCJyb2xlIjoiQ1JFQVRPUiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc3OTMwNzMyNCwiZXhwIjoxNzg3MDgzMzI0LCJhdWQiOiJib3VudGllcy11c2VycyIsImlzcyI6ImJvdW50aWVzLWFwaSJ9.aXNfupe2yrlrUHg7IR5Of7gTrLirHHVxoTE2yOnApVc",
    user: { id: "000000000000000000000004", username: "demo-talent3", email: "demo-talent3@nido.demo", role: "creator", accountStatus: "active", first_login: false },
    redirect: "/creator/campaign/6b0e1cadead105ec638de779",
    label: "Talent · Slot 3",
    description: "Registre sua wallet Freighter e aguarde o escrow do Host.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
    badge: "Slot 3",
  },
  talent4: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDUiLCJlbWFpbCI6ImRlbW8tdGFsZW50NEBuaWRvLmRlbW8iLCJyb2xlIjoiQ1JFQVRPUiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc3OTMwNzMyNCwiZXhwIjoxNzg3MDgzMzI0LCJhdWQiOiJib3VudGllcy11c2VycyIsImlzcyI6ImJvdW50aWVzLWFwaSJ9.CV2tsozAsTYnO2R44bb_2QzBJRksQoym5V7ENtc8fp8",
    user: { id: "000000000000000000000005", username: "demo-talent4", email: "demo-talent4@nido.demo", role: "creator", accountStatus: "active", first_login: false },
    redirect: "/creator/campaign/6b0e1cadead105ec638de77a",
    label: "Talent · Slot 4",
    description: "Registre sua wallet Freighter e aguarde o escrow do Host.",
    color: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700",
    badge: "Slot 4",
  },
  admin: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQG5pZG8uZGVtbyIsInJvbGUiOiJBRE1JTiIsInN0YXR1cyI6ImFjdGl2ZSIsInJlZ2lzdGVyQ29tcGxldGVkIjp0cnVlLCJpYXQiOjE3NzkzMDczMjQsImV4cCI6MTc4NzA4MzMyNCwiYXVkIjoiYm91bnRpZXMtdXNlcnMiLCJpc3MiOiJib3VudGllcy1hcGkifQ.Ettdn9zz0hM4m1_PJYuFtrWnXgUmblCuO9EwqvcRdc8",
    user: { id: "000000000000000000000001", username: "admin", email: "admin@nido.demo", role: "admin", registerCompleted: true, accountStatus: "active" },
    redirect: "/admin/stellar-disputes",
    label: "Entrar como Admin",
    description: "Painel de arbitragem — revisar disputas e emitir decisão.",
    color: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700",
    badge: null,
  },
} as const;

const ADMIN_CODE = "g7Xk2mPq";

type Role = keyof typeof SESSIONS;

export default function DemoLoginPage() {
  const [loading, setLoading] = useState<Role | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowAdmin(params.get("admin") === ADMIN_CODE);
  }, []);

  const visibleRoles = (Object.keys(SESSIONS) as Role[]).filter(
    (r) => r !== "admin" || showAdmin
  );

  const handleLogin = (role: Role) => {
    setLoading(role);
    const { token, user, redirect } = SESSIONS[role];
    const userStr = JSON.stringify({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    localStorage.setItem("bounties_token", token);
    localStorage.setItem("auth_user", userStr);
    document.cookie = `bounties_token=${token}; path=/; max-age=2592000; SameSite=Strict`;
    document.cookie = `auth_user=${encodeURIComponent(userStr)}; path=/; max-age=2592000; SameSite=Strict`;
    window.location.href = redirect;
  };

  const hostSession = SESSIONS.host;
  const talentRoles = visibleRoles.filter((r) => r !== "host" && r !== "admin");
  const adminRoles = visibleRoles.filter((r) => r === "admin");

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
          DEMO · TESTNET
        </span>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Host */}
        <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">{hostSession.label}</p>
            <p className="text-xs text-[#696E72]">{hostSession.description}</p>
          </div>
          <button
            onClick={() => handleLogin("host")}
            disabled={loading !== null}
            className={`w-full py-2.5 rounded-xl ${hostSession.color} text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === "host" ? "Entrando…" : hostSession.label}
          </button>
        </div>

        {/* Talent slots */}
        <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">Entrar como Talent</p>
            <p className="text-xs text-[#696E72]">Cada slot é uma campanha independente. Escolha um slot livre.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {talentRoles.map((role) => {
              const s = SESSIONS[role];
              return (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  disabled={loading !== null}
                  className={`py-2.5 rounded-xl ${s.color} text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === role ? "…" : ("badge" in s && s.badge) ? s.badge : s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin (hidden unless ?admin=CODE) */}
        {adminRoles.map((role) => {
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
