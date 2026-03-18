'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RecallItem {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  manufacturer: string;
  parkIt: boolean;
  parkOutside: boolean;
  severity: 'critical' | 'high' | 'medium';
}

interface UseRecallsParams {
  year: number;
  make: string;
  model: string;
  vin?: string | null;
}

interface UseRecallsResult {
  recalls: RecallItem[];
  loading: boolean;
  error: string | null;
  count: number;
  criticalCount: number;
  refetch: () => void;
}

export function useRecalls({ year, make, model, vin }: UseRecallsParams): UseRecallsResult {
  const [recalls, setRecalls] = useState<RecallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecalls = useCallback(async () => {
    if (!year || !make || !model) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        year: year.toString(),
        make,
        model,
        ...(vin && { vin }),
      });

      const response = await fetch(`/api/recalls?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recalls');
      }

      setRecalls(data.recalls || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecalls([]);
    } finally {
      setLoading(false);
    }
  }, [year, make, model, vin]);

  useEffect(() => {
    fetchRecalls();
  }, [fetchRecalls]);

  const criticalCount = recalls.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  return {
    recalls,
    loading,
    error,
    count: recalls.length,
    criticalCount,
    refetch: fetchRecalls,
  };
}
