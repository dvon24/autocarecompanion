'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';

interface Vehicle {
  slug: string;
  make: string;
  model: string;
  issueCount: number;
}

interface DTCCode {
  code: string;
  name: string;
}

interface IssueSearchProps {
  vehicles: Vehicle[];
  dtcCodes: DTCCode[];
}

export function IssueSearch({ vehicles, dtcCodes }: IssueSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const vehicleFuse = useMemo(
    () =>
      new Fuse(vehicles, {
        keys: [
          { name: 'make', weight: 0.4 },
          { name: 'model', weight: 0.6 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [vehicles]
  );

  const dtcFuse = useMemo(
    () =>
      new Fuse(dtcCodes, {
        keys: [
          { name: 'code', weight: 0.6 },
          { name: 'name', weight: 0.4 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [dtcCodes]
  );

  const vehicleResults = query.length >= 2 ? vehicleFuse.search(query, { limit: 8 }) : [];
  const dtcResults = query.length >= 2 ? dtcFuse.search(query, { limit: 8 }) : [];
  const hasResults = vehicleResults.length > 0 || dtcResults.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mb-8">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search vehicles or error codes..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {isOpen && query.length >= 2 && hasResults && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {vehicleResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                Vehicles
              </div>
              {vehicleResults.map(({ item }) => (
                <Link
                  key={item.slug}
                  href={`/known-issues/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm text-gray-900 font-medium">
                    {item.make} {item.model}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.issueCount} {item.issueCount === 1 ? 'issue' : 'issues'}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {dtcResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                Error Codes
              </div>
              {dtcResults.map(({ item }) => (
                <Link
                  key={item.code}
                  href={`/known-issues/dtc/${item.code}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    {item.code.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-700 truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && query.length >= 2 && !hasResults && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            No vehicles or error codes found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
