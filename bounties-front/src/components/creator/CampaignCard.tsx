"use client";

import React from "react";
import Link from "next/link";
import { Bounty } from "@/types";
import { getCategoryById } from "@/data/categories";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Bounty;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  showActions = false,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const category = getCategoryById(campaign.category);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 min-h-[320px] flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: category?.color + "20",
                color: category?.color,
              }}
            >
              {category?.name}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                campaign.status
              )}`}
            >
              {getStatusLabel(campaign.status)}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight break-words">
            {campaign.title}
          </h3>
        </div>

        {showActions && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Duplicar"
            >
              📋
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Deletar"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
        {campaign.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {campaign.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
        {campaign.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            +{campaign.tags.length - 3} mais
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Created at {formatDate(campaign.createdAt)}</span>
          {campaign.deadline && <span>Deadline: {formatDate(campaign.deadline)}</span>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(campaign.value, campaign.currency)}
          </div>
          <p className="text-xs text-gray-500">Recompensa</p>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/creator/campaign/${campaign.id}`}
          className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
