"use client";

import React from 'react';
import { getBountyById } from '@/data/bounties';
import { getSubmissionsByCampaignId } from '@/data/submissions';
import StatsCard from './StatsCard';

interface CampaignAnalyticsProps {
  campaignId: string;
}

const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaignId }) => {
  const campaign = getBountyById(campaignId);
  const submissions = getSubmissionsByCampaignId(campaignId);
  
  if (!campaign) {
    return null;
  }

  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
  
  const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;
  const daysSinceCreated = Math.floor((Date.now() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilDeadline = Math.floor((campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const stats = [
    {
      title: 'Total Submissions',
      value: totalSubmissions.toString(),
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Approval Rate',
      value: `${approvalRate.toFixed(1)}%`,
      icon: '✅',
      color: 'green'
    },
    {
      title: 'Pending',
      value: pendingSubmissions.toString(),
      icon: '⏳',
      color: 'yellow'
    },
    {
      title: 'Days Remaining',
      value: daysUntilDeadline > 0 ? daysUntilDeadline.toString() : 'Expirado',
      icon: '⏰',
      color: daysUntilDeadline > 0 ? 'blue' : 'red'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <span className="font-medium">{approvedSubmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-medium">{pendingSubmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="font-medium">{rejectedSubmissions}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="font-medium">{daysSinceCreated} days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deadline</span>
              <span className="font-medium">
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'Expired'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`font-medium ${
                campaign.status === 'open' ? 'text-green-600' :
                campaign.status === 'in_progress' ? 'text-blue-600' :
                campaign.status === 'completed' ? 'text-gray-600' : 'text-red-600'
              }`}>
                {campaign.status === 'open' ? 'Open' :
                 campaign.status === 'in_progress' ? 'In Progress' :
                 campaign.status === 'completed' ? 'Completed' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalSubmissions}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {approvalRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {daysSinceCreated}
            </div>
            <div className="text-sm text-gray-600">Active Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
