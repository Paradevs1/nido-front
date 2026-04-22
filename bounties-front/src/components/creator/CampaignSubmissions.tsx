"use client";

import React, { useState } from 'react';
import { getSubmissionsByCampaignId } from '@/data/submissions';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import SubmissionCard from './SubmissionCard';

interface CampaignSubmissionsProps {
  campaignId: string;
}

const CampaignSubmissions: React.FC<CampaignSubmissionsProps> = ({ campaignId }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const submissions = getSubmissionsByCampaignId(campaignId);
  
  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusCount = (status: string) => {
    return submissions.filter(s => s.status === status).length;
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">
          Submissions ({submissions.length})
        </h2>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', count: submissions.length },
            { key: 'pending', label: 'Pending', count: getStatusCount('pending') },
            { key: 'approved', label: 'Approved', count: getStatusCount('approved') },
            { key: 'rejected', label: 'Rejected', count: getStatusCount('rejected') }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No submissions yet' : `No ${filter === 'pending' ? 'pending' : filter === 'approved' ? 'approved' : 'rejected'} submissions`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Submissions will appear here when developers submit their proposals.'
              : `There are no ${filter === 'pending' ? 'pending' : filter === 'approved' ? 'approved' : 'rejected'} submissions at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard 
              key={submission.id} 
              submission={submission}
              onApprove={() => {}}
              onReject={() => {}}
              onView={() => {}}
            />
          ))}
        </div>
      )}

      {filteredSubmissions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
            >
              Approve All
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
            >
              Reject All
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
            >
              Export List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSubmissions;
