'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorLayout } from '@/components/layout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUser } from '@/lib/contexts/UserContext';

export default function CreatorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        const returnTo = `${window.location.pathname}${window.location.search || ""}`;
        router.replace(`/?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <CreatorLayout>
      {children}
    </CreatorLayout>
  );
}
