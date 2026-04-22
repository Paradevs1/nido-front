"use client";

import HostPaymentGuard from "@/components/host/HostPaymentGuard";
import HostLayout from "@/components/layout/HostLayout";
import { usePathname } from "next/navigation";
import { HOST_PENDING_ACTIVATION_PATH } from "@/lib/auth/hostAccountStatus";

export default function HostLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith(HOST_PENDING_ACTIVATION_PATH)) {
    return <>{children}</>;
  }
  return (
    <HostPaymentGuard>
      <HostLayout>{children}</HostLayout>
    </HostPaymentGuard>
  );
}
