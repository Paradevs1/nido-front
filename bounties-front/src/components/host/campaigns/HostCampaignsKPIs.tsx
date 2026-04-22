"use client";

import { useState, useEffect } from "react";
import { getHostCampaignsCount, HostCampaignsCount } from "@/lib/api/host";

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function KPICard({ title, value, icon, subtitle, isLoading }: KPICardProps) {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-white text-4xl font-bold">{value}</p>
          )}
        </div>
        <div className="text-gray-500">
          {icon}
        </div>
      </div>
       <p className="text-gray-400 text-xs">{subtitle}</p>
    </div>
  );
}

export default function HostCampaignsKPIs() {
  const [kpiData, setKpiData] = useState<HostCampaignsCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setIsLoading(true);
        const data = await getHostCampaignsCount();
        setKpiData(data);
        setError(null);
      } catch (err: unknown) {
        setError(err.message || "Failed to load KPIs");
        setKpiData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, []);
  
  const formatValue = (value: number | undefined) => {
    if (typeof value === 'undefined') return '0';
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return String(value);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {error && <p className="text-red-500 col-span-3">{error}</p>}
      <KPICard
        title="Total Started"
        value={formatValue(kpiData?.campaigns_progress)}
        subtitle="All created campaigns"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        }
      />
      
      <KPICard
        title="Total Completed"
        value={formatValue(kpiData?.campaigns_completed)}
        subtitle="All completed campaigns"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        }
      />
      
      <KPICard
        title="Total Users"
        value={formatValue(kpiData?.total_user_submiteds)}
        subtitle="Total campaign participants"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 18.5H3.5v6h2v-6h2v6h2v-6h2v6h2v-6h2v6h2z"/>
          </svg>
        }
      />
    </div>
  );
}
