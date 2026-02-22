'use client';

import { useState, useEffect, useCallback } from 'react';

export interface IssueFix {
  id: string;
  knownIssueId: string;
  vehicleId: string;
  status: 'fixed' | 'in_progress' | 'wont_fix';
  solution?: string;
  cost?: number;
  difficultyRating?: number;
  partsUsed?: string;
  shopUsed?: string;
  tips?: string;
  wouldRecommend: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseIssueFixesParams {
  vehicleId?: string;
  knownIssueId?: string;
  includePublic?: boolean;
}

interface UseIssueFixesResult {
  fixes: IssueFix[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getFixForIssue: (issueId: string) => IssueFix | undefined;
}

export function useIssueFixes({
  vehicleId,
  knownIssueId,
  includePublic = false,
}: UseIssueFixesParams = {}): UseIssueFixesResult {
  const [fixes, setFixes] = useState<IssueFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFixes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (knownIssueId) params.append('knownIssueId', knownIssueId);
      if (includePublic) params.append('includePublic', 'true');

      const response = await fetch(`/api/issue-fixes?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch fixes');
      }

      setFixes(data.fixes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFixes([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, knownIssueId, includePublic]);

  useEffect(() => {
    fetchFixes();
  }, [fetchFixes]);

  const getFixForIssue = useCallback(
    (issueId: string) => fixes.find((fix) => fix.knownIssueId === issueId),
    [fixes]
  );

  return {
    fixes,
    loading,
    error,
    refetch: fetchFixes,
    getFixForIssue,
  };
}
