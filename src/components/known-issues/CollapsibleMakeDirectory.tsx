'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VehicleEntry {
  slug: string;
  make: string;
  model: string;
  issueCount: number;
  highCount: number;
  yearRange: { min: number; max: number } | null;
}

interface CollapsibleMakeDirectoryProps {
  make: string;
  vehicles: VehicleEntry[];
  totalIssues: number;
}

export function CollapsibleMakeDirectory({ make, vehicles, totalIssues }: CollapsibleMakeDirectoryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id={make.toLowerCase().replace(/\s+/g, '-')}
      className="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">{make}</h2>
          <span className="text-sm text-gray-500">
            {vehicles.length} models &middot; {totalIssues} issues
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.slug}
                href={`/known-issues/${vehicle.slug}`}
                className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    {vehicle.model}
                  </div>
                  {vehicle.yearRange && (
                    <div className="text-xs text-gray-400">
                      {vehicle.yearRange.min}-{vehicle.yearRange.max}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {vehicle.highCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                      {vehicle.highCount} critical
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {vehicle.issueCount}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
