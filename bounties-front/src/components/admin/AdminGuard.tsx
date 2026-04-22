"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || user?.role !== "admin") {
      // Pequeno atraso para AuthContext hidratar do localStorage (ex.: refresh em /admin)
      const t = setTimeout(() => {
        if (hasRedirected.current) return;
        hasRedirected.current = true;
        router.replace("/");
      }, 100);
      return () => clearTimeout(t);
    }
    hasRedirected.current = false;
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <div className="text-white/80">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
