'use client';

import { useState, useEffect, useCallback } from 'react';
import { KnownIssue } from '@/schemas/knownIssue.schema';

interface UseKnownIssuesParams {
  year: number;
  make: string;
  model: string;
  trim?: string;
}

interface UseKnownIssuesResult {
  issues: KnownIssue[];
  loading: boolean;
  error: string | null;
  total: number;
  severityFilter: ('high' | 'medium' | 'low')[];
  setSeverityFilter: (filter: ('high' | 'medium' | 'low')[]) => void;
  refetch: () => void;
}

export function useKnownIssues({
  year,
  make,
  model,
  trim,
}: UseKnownIssuesParams): UseKnownIssuesResult {
  const [issues, setIssues] = useState<KnownIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<('high' | 'medium' | 'low')[]>([
    'high',
    'medium',
    'low',
  ]);

  const fetchIssues = useCallback(async () => {
    if (!year || !make || !model) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        year: year.toString(),
        make,
        model,
        ...(trim && { trim }),
        severity: severityFilter.join(','),
      });

      const response = await fetch(`/api/known-issues?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch known issues');
      }

      setIssues(data.issues);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIssues([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [year, make, model, trim, severityFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    total,
    severityFilter,
    setSeverityFilter,
    refetch: fetchIssues,
  };
}
