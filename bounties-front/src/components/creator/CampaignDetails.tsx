"use client";

import React from 'react';
import { getBountyById } from '@/data/bounties';
import { getCategoryById } from '@/data/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface CampaignDetailsProps {
  campaignId: string;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId }) => {
  const campaign = getBountyById(campaignId);
  
  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h2>
          <p className="text-gray-600">The campaign you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const category = getCategoryById(campaign.category);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: category?.color + '20',
                color: category?.color 
              }}
            >
              {category?.name}
            </span>
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                campaign.status === 'open' ? 'bg-green-100 text-green-800' :
                campaign.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {campaign.status === 'open' ? 'Open' :
               campaign.status === 'in_progress' ? 'In Progress' :
               campaign.status === 'completed' ? 'Completed' : 'Closed'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
          <p className="text-gray-600 text-lg">{campaign.description}</p>
        </div>
        <div className="mt-4 lg:mt-0 lg:ml-6">
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatCurrency(campaign.value, campaign.currency)}
            </div>
            <p className="text-gray-600">Reward</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {campaign.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Created at:</span>
              <span className="font-medium">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deadline:</span>
              <span className="font-medium">{formatDate(campaign.deadline)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated at:</span>
              <span className="font-medium">{formatDate(campaign.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">
                {campaign.status === 'open' ? 'Open' :
                 campaign.status === 'in_progress' ? 'In Progress' :
                 campaign.status === 'completed' ? 'Completed' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{category?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span className="font-medium">{campaign.currency}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
        <ul className="space-y-2">
          {campaign.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span className="text-gray-700">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Deliverables</h3>
        <ul className="space-y-2">
          {campaign.deliverables.map((deliverable, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-gray-700">{deliverable}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="primary" 
          className="flex-1"
        >
          Edit Campaign
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1"
        >
          Share
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
        >
          Archive
        </Button>
      </div>
    </div>
  );
};

export default CampaignDetails;
