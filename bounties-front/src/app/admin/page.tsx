"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminDashboardCounts } from "@/lib/api/admin";

const CARDS = [
  {
    title: "Creators",
    description: "Listar creators, buscar por username e gerenciar usuários.",
    href: "/admin/creators",
  },
  {
    title: "Participação em campanhas",
    description: "Creators com contagem de campanhas em que participaram (busca e paginação).",
    href: "/admin/creators/participation-stats",
  },
  {
    title: "Creators recorrentes",
    description: "Quem participou de todas as últimas N campanhas; ajuste lastN e veja a janela.",
    href: "/admin/creators/recurring",
  },
  {
    title: "Creator Insights",
    description: "Resumo de usernames e average views por post (com detalhes completos).",
    href: "/admin/creators/insights",
  },
  {
    title: "Hosts",
    description: "Listar hosts, combos e atualizar planos.",
    href: "/admin/hosts",
  },
  {
    title: "Pagamentos",
    description: "Lista unificada de pagamentos (winners, campanhas, reembolsos, planos).",
    href: "/admin/payments",
  },
  {
    title: "Campanhas",
    description: "Contagens, short URLs por campanha e estatísticas.",
    href: "/admin/campaigns",
  },
  {
    title: "Exportações",
    description: "Exportar creators, hosts, pagamentos e short URLs em Excel.",
    href: "/admin/exports",
  },
] as const;

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Awaited<ReturnType<typeof getAdminDashboardCounts>> | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardCounts()
      .then(setCounts)
      .catch(() => setCounts(null))
      .finally(() => setCountsLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
        <p className="text-white/60 mt-1">
          Use os atalhos abaixo para acessar as áreas da API.
        </p>
      </div>

      {/* KPIs: totais da API */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/creators"
          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <p className="text-white/60 text-sm font-medium">Creators</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : counts?.creatorsTotal ?? "—"}
          </p>
        </Link>
        <Link
          href="/admin/hosts"
          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <p className="text-white/60 text-sm font-medium">Hosts</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : counts?.hostsTotal ?? "—"}
          </p>
        </Link>
        <Link
          href="/admin/campaigns"
          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <p className="text-white/60 text-sm font-medium">Campanhas</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : counts?.campaignsTotal ?? "—"}
          </p>
          {!countsLoading && counts && (counts.campaignsPublic > 0 || counts.campaignsPrivate > 0) && (
            <p className="text-white/50 text-xs mt-1">
              {counts.campaignsPublic} públicas · {counts.campaignsPrivate} privadas
            </p>
          )}
        </Link>
        <Link
          href="/admin/payments"
          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <p className="text-white/60 text-sm font-medium">Pagamentos</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : counts?.paymentsTotal ?? "—"}
          </p>
        </Link>
      </div>

      {/* Atalhos */}
      <h2 className="text-lg font-semibold text-white mb-4">Atalhos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-white/60">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
