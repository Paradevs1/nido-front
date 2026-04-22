"use client";

import React from 'react';
import { getBountyById } from '@/data/bounties';
import Button from '@/components/ui/Button';

interface CampaignActionsProps {
  campaignId: string;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({ campaignId }) => {
  const campaign = getBountyById(campaignId);
  
  if (!campaign) {
    return null;
  }

  const handleEdit = () => {};

  const handleDuplicate = () => {};

  const handleShare = () => {};

  const handleArchive = () => {};

  const handleDelete = () => {};

  const handleClose = () => {};

  const handleReopen = () => {};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleEdit}
          >
            ✏️ Edit Campaign
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={handleDuplicate}
          >
            📋 Duplicate Campaign
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleShare}
          >
            🔗 Share
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Status</h3>
        <div className="space-y-3">
          {campaign.status === 'open' ? (
            <Button 
              variant="outline" 
              className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
              onClick={handleClose}
            >
              🔒 Close Campaign
            </Button>
          ) : campaign.status === 'closed' ? (
            <Button 
              variant="outline" 
              className="w-full text-green-600 border-green-600 hover:bg-green-50"
              onClick={handleReopen}
            >
              🔓 Reopen Campaign
            </Button>
          ) : null}
          
          <Button 
            variant="outline" 
            className="w-full text-gray-600 border-gray-600 hover:bg-gray-50"
            onClick={handleArchive}
          >
            📦 Archive
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            🗑️ Delete Campaign
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Actions in this section are irreversible
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID:</span>
            <span className="font-mono text-gray-900">{campaign.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created at:</span>
            <span className="text-gray-900">
              {campaign.createdAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deadline:</span>
            <span className="text-gray-900">
              {campaign.deadline.toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Value:</span>
            <span className="font-semibold text-green-600">
              R$ {campaign.value.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Views:</span>
            <span className="font-semibold text-gray-900">1,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Favorites:</span>
            <span className="font-semibold text-gray-900">56</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shares:</span>
            <span className="font-semibold text-gray-900">23</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignActions;
