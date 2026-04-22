"use client";

import Link from "next/link";

export default function AdminPlansPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Planos (Host)</h1>
      <p className="text-white/60 mb-6">Gestão de planos para hosts (em desenvolvimento).</p>
      <Link href="/admin" className="text-[var(--color-primary)] hover:underline">
        ← Voltar ao painel
      </Link>
    </div>
  );
}
