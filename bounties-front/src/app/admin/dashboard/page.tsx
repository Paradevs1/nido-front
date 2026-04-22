"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-white/60">
      Redirecionando...
    </div>
  );
}
