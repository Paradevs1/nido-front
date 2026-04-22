"use client";

import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-[var(--color-background)]">
      <AdminSidebar />
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
