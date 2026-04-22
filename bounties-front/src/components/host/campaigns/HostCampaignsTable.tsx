"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { getHostCampaigns, CampaignPublic } from "@/lib/api/host";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import Link from "next/link";

type CampaignStatus = CampaignPublic["status"] | "in_review" | "waiting payment";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  submissions: number;
  createdOn: string;
  originalStartDate: Date;
  isPrivate: boolean;
}

const mapBackendStatusToFrontend = (
  status: CampaignPublic["status"]
): CampaignStatus => {
  switch (status) {
    case "active":
    case "completed":
    case "inactive":
    case "cancelled":
      return status;
    default:
      return "in_review";
  }
};

type SortField = "name" | "status" | "submissions" | "createdOn";
type SortDirection = "asc" | "desc";

interface HostCampaignsTableProps {
  searchTerm: string;
}

export default function HostCampaignsTable({
  searchTerm,
}: HostCampaignsTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdOn");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [mobilePage, setMobilePage] = useState(1);
  const itemsPerMobilePage = 6;

  const formatCreatedOn = (date: Date) => {
    const now = new Date();
    const minutes = Math.max(differenceInMinutes(now, date), 0);

    if (minutes < 60) {
      const value = Math.max(minutes, 1);
      return value === 1 ? "1 minute ago" : `${value} minutes ago`;
    }

    const hours = Math.max(differenceInHours(now, date), 1);
    if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    const days = Math.max(differenceInDays(now, date), 1);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const response = await getHostCampaigns();
        const mappedCampaigns = response.campaigns.map((c) => ({
          id: c.id,
          name: c.title,
          status: mapBackendStatusToFrontend(c.status),
          submissions: c.total_submissions,
          createdOn: formatCreatedOn(new Date(c.start_date)),
          originalStartDate: new Date(c.start_date),
          isPrivate: c.isPrivate || false,
        }));
        setCampaigns(mappedCampaigns);
        setError(null);
      } catch (err: unknown) {
        setError(err.message || "Failed to load campaigns");
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleSort = (field: SortField) => {
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campaigns, searchTerm]);

  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      let valA, valB;

      if (sortField === "createdOn") {
        valA = a.originalStartDate.getTime();
        valB = b.originalStartDate.getTime();
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCampaigns, sortField, sortDirection]);

  useEffect(() => {
    setMobilePage(1);
  }, [sortedCampaigns.length, searchTerm]);

  const totalMobilePages = Math.max(
    1,
    Math.ceil(sortedCampaigns.length / itemsPerMobilePage)
  );

  const currentMobilePage = Math.min(mobilePage, totalMobilePages);
  const mobileCampaigns = sortedCampaigns.slice(
    (currentMobilePage - 1) * itemsPerMobilePage,
    currentMobilePage * itemsPerMobilePage
  );

  const getStatusComponent = (status: Campaign["status"]) => {
    const color =
      status === "active"
        ? "bg-green-500"
        : status === "in_review"
        ? "bg-yellow-500"
        : status === "waiting payment"
        ? "bg-yellow-500"
        : status === "completed"
        ? "bg-red-500"
        : "bg-gray-500";
    return <div className={`w-2.5 h-2.5 rounded-full mr-2 ${color}`}></div>;
  };

  const getStatusLabel = (status: Campaign["status"]) => {
    if (status === "in_review") return "In Review";
    if (status === "waiting payment") return "waiting payment";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <FaSort className="inline ml-2 text-gray-500" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-2" />
    ) : (
      <FaSortDown className="inline ml-2" />
    );
  };

  const headers: { key: SortField | null; label: string }[] = [
    { key: "name", label: "Name Campaign" },
    { key: "status", label: "Status" },
    { key: null, label: "Action" },
    { key: "submissions", label: "Submission" },
    { key: "createdOn", label: "Created on" },
  ];

  const renderStateMessage = (message: string, isError = false) => (
    <div
      className={`text-center py-8 px-4 rounded-2xl border border-dashed ${
        isError ? "border-red-500/40 text-red-400" : "border-white/10 text-gray-400"
      }`}
    >
      {message}
    </div>
  );

  const renderMobileCards = () => {
    if (isLoading) {
      return renderStateMessage("Loading campaigns...");
    }

    if (error) {
      return renderStateMessage(error, true);
    }

    if (sortedCampaigns.length === 0) {
      return renderStateMessage("No campaigns found.");
    }

    return (
      <div className="space-y-6">
        {mobileCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#061C2C]/80 to-[#04111A]/80 shadow-[0_16px_40px_rgba(3,17,29,0.55)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-white font-semibold text-lg">
                  {campaign.name}
                </h4>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40 mt-2">
                  Created • {campaign.createdOn}
                </p>
              </div>
              <div className="bg-transparent border border-white/10 text-xs uppercase tracking-widest text-white px-3 py-1.5 rounded-full shadow-inner inline-flex items-center gap-2">
                {getStatusComponent(campaign.status)}
                <span>{getStatusLabel(campaign.status)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl px-4 py-2 border border-white/5 bg-[#0D2436]/60 text-sm text-gray-200">
              <span className="uppercase tracking-[0.2em] text-xs text-white/60">
                Submissions
              </span>
              <span className="font-semibold text-white">
                {campaign.submissions.toLocaleString()}
              </span>
            </div>

            <Link
              href={campaign.isPrivate ? `/host/campaign/manage/private/${campaign.id}` : `/host/campaign/manage/${campaign.id}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <FiExternalLink />
              Manage Campaign
            </Link>
          </div>
        ))}

        {totalMobilePages > 1 && (
          <div className="flex items-center justify-between pt-2 text-sm text-gray-400">
            <button
              onClick={() => setMobilePage((prev) => Math.max(1, prev - 1))}
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={currentMobilePage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentMobilePage} of {totalMobilePages}
            </span>
            <button
              onClick={() =>
                setMobilePage((prev) =>
                  Math.min(totalMobilePages, prev + 1)
                )
              }
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={currentMobilePage === totalMobilePages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-black/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.label}
                className="text-left py-5 px-6 text-gray-300 font-medium whitespace-nowrap"
              >
                {header.key ? (
                  <button
                    onClick={() => handleSort(header.key as SortField)}
                    className="flex items-center uppercase"
                  >
                    {header.label}
                    <SortIcon field={header.key as SortField} />
                  </button>
                ) : (
                  <span className="uppercase">{header.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-8 text-gray-400"
              >
                Loading campaigns...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-8 text-red-500"
              >
                {error}
              </td>
            </tr>
          ) : sortedCampaigns.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-8 text-gray-400"
              >
                No campaigns found.
              </td>
            </tr>
          ) : (
            sortedCampaigns.map((campaign, index) => (
              <tr
                key={campaign.id}
                className={`${
                  index % 2 === 1 ? "bg-black/20" : "bg-transparent"
                }`}
              >
                <td className="py-4 px-6 text-white font-medium">
                  {campaign.name}
                </td>
                <td className="py-4 px-6 text-white">
                  <div className="flex items-center">
                    {getStatusComponent(campaign.status)}
                    {getStatusLabel(campaign.status)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Link
                    href={campaign.isPrivate ? `/host/campaign/manage/private/${campaign.id}` : `/host/campaign/manage/${campaign.id}`}
                        className="text-[var(--color-text)] flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors"
                  >
                    <FiExternalLink />
                    Manage Campaign
                  </Link>
                </td>
                <td className="py-4 px-6 text-white">
                  {campaign.submissions.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-gray-300">
                  {campaign.createdOn}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        </div>

        <div className="hidden md:flex items-center justify-between mt-4 text-sm text-gray-400 px-6 pb-2">
          <div></div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 hover:text-white disabled:opacity-50"
            disabled
          >
            &lt;&lt;
          </button>
          <button
            className="px-2 py-1 hover:text-white disabled:opacity-50"
            disabled
          >
            &lt;
          </button>
          <span className="px-2">Page 1 of 1</span>
          <button className="px-2 py-1 hover:text-white" disabled>
            &gt;
          </button>
          <button className="px-2 py-1 hover:text-white" disabled>
            &gt;&gt;
          </button>
        </div>
      </div>
      </div>

      <div className="md:hidden">{renderMobileCards()}</div>
    </div>
  );
}
