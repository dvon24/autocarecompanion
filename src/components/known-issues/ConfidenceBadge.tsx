'use client';

import { formatOwnerReportCount } from '@/lib/owner-report-count';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  humanApproved: boolean;
  lastReportedByOwners: string;
  reviewedOn: string;
  reportCount: number;
}

export function ConfidenceBadge({
  confidence,
  humanApproved,
  lastReportedByOwners,
  reviewedOn,
  reportCount,
}: ConfidenceBadgeProps) {
  const confidenceConfig = {
    high: {
      label: 'High Confidence',
      bgColor: 'bg-[#EFEDE6]',
      textColor: 'text-[#3C313D]',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    medium: {
      label: 'Medium Confidence',
      bgColor: 'bg-[#EFEDE6]',
      textColor: 'text-[#3C313D]',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    low: {
      label: 'Low Confidence',
      bgColor: 'bg-[#EFEDE6]',
      textColor: 'text-[#3C313D]',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const config = confidenceConfig[confidence] || confidenceConfig.medium;

  // Format dates
  const ownerReportDate = lastReportedByOwners ? new Date(lastReportedByOwners) : null;
  const formattedOwnerDate = ownerReportDate && !Number.isNaN(ownerReportDate.getTime())
    ? ownerReportDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  const reviewDate = new Date(reviewedOn);
  const formattedReviewDate = reviewDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const ownerReportCountLabel = formatOwnerReportCount(reportCount);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Confidence badge */}
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#D8D1C3] ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        {config.label}
      </span>

      {/* Human approved badge */}
      {humanApproved && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#D8D1C3] bg-[#F7F4EC] text-[#3C313D]">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      )}

      {/* Report count */}
      {ownerReportCountLabel && <span className="text-gray-500">{ownerReportCountLabel}</span>}

      {/* Last reported by owners */}
      {formattedOwnerDate && (
        <span className="text-gray-500">
          Last reported by owners {formattedOwnerDate}
        </span>
      )}

      {/* Reviewed by us */}
      <span className="text-gray-400">
        Reviewed {formattedReviewDate}
      </span>
    </div>
  );
}
