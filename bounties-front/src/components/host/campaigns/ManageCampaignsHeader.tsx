"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";

interface ManageCampaignsHeaderProps {
  hostName?: string;
  subtitle?: string | null;
  description?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  onCreateClick?: () => void;
}

export default function ManageCampaignsHeader({
  hostName,
  subtitle,
  description,
  ctaHref = "/host/campaign/create",
  ctaLabel = "CREATE NEW CAMPAIGN NOW",
  onCreateClick,
}: ManageCampaignsHeaderProps) {
  const { user } = useAuth();
  const resolvedHostName = hostName ?? user?.username;

  const handleClick = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  return (
    <div className="mb-8">
      {subtitle && (
        <h2 className="text-base font-semibold text-[var(--color-primary)] mb-2">
          {subtitle}
        </h2>
      )}
      {resolvedHostName && (
        <h1 className="text-4xl font-bold text-white mb-4">
          Hi, {resolvedHostName}!
        </h1>
      )}
      {description && (
        <p className="text-gray-300 text-lg mb-6">
          {description}
        </p>
      )}
      {onCreateClick ? (
        <Button 
          variant="default" 
          onClick={handleClick}
          className="px-8 py-3 font-bold border border-[var(--color-primary)] cursor-pointer uppercase"
        >
          {ctaLabel}
        </Button>
      ) : (
        <Link href={ctaHref}>
          <Button variant="default" className="px-8 py-3 font-bold border border-[var(--color-primary)] cursor-pointer uppercase">
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
