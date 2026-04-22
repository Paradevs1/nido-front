"use client";

import React from 'react';
import { Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface SubmissionCardProps {
  submission: Submission;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onApprove,
  onReject,
  onView
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={submission.submittedBy.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNjY2NjY2MiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNiIgZmlsbD0iIzY2NjY2NiIvPgogIDxwYXRoIGQ9Ik02IDI2YzAtNi42MjcgNC40NzctMTIgMTAtMTJzMTAgNS4zNzMgMTAgMTJIMjZIMTZINnoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L3N2Zz4KPC9zdmc+'}
              alt={submission.submittedBy.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{submission.submittedBy.name}</h4>
              <p className="text-sm text-gray-600">@{submission.submittedBy.username}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
              {getStatusLabel(submission.status)}
            </span>
          </div>
          
          <p className="text-gray-700 mb-3">{submission.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Enviado em: {formatDate(submission.submittedAt)}</span>
            {submission.updatedAt && (
              <span>Atualizado em: {formatDate(submission.updatedAt)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            👁️ Ver Detalhes
          </Button>
          
          {submission.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ✅ Aprovar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                ❌ Rejeitar
              </Button>
            </>
          )}
        </div>
      </div>

      {submission.attachments && submission.attachments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Anexos:</h5>
          <div className="flex flex-wrap gap-2">
            {submission.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                📎 {attachment.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {submission.comments && submission.comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Comentários:</h5>
          <div className="space-y-2">
            {submission.comments.map((comment, index) => (
              <div key={index} className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SubmissionCard);
