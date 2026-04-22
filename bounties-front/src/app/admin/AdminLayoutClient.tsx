"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
