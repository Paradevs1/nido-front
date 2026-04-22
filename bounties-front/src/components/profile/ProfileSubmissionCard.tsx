"use client";

import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  campaign_id: string;
  user_id: string;
  username: string;
  submission_url: string;
  submission_text: string;
  submission_data: {
    link: string;
    description: string;
  };
  status: 'APPROVED' | 'UNDER_REVIEW' | 'PENDING' | 'REJECTED';
  score: number;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  campaign: {
    id: string;
    title: string;
    description: string;
    value: number;
    currency: string;
  };
}

interface ProfileSubmissionCardProps {
  submission: Submission;
  statusColor: string;
  statusText: string;
}

export default function ProfileSubmissionCard({ submission, statusColor, statusText }: ProfileSubmissionCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-white">{submission.campaign.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
              {statusText}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-2">{submission.campaign.description}</p>
          <p className="text-gray-400 text-sm flex-grow">{submission.submission_text}</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1">
            {submission.campaign.value.toLocaleString()} {submission.campaign.currency}
          </div>
          <div className="text-sm text-gray-400">Reward</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Submitted {formatDate(submission.submitted_at)}</span>
          </div>
          
          {submission.score > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Score: {submission.score}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open(submission.submission_url, '_blank')}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            View Submission
          </button>
          <button 
            onClick={() => router.push(`/creator/campaign/${submission.campaign_id}`)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            View Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
