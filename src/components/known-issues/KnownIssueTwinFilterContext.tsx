'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface TwinFilterValue {
  selectedTrim: string | null;
  setSelectedTrim: (trim: string | null) => void;
  activeIssueIds: ReadonlySet<string> | null;
  setActiveIssueIds: (ids: readonly string[] | null) => void;
  showAll: boolean;
  setShowAll: (showAll: boolean) => void;
  revealIssue: (issueId: string) => void;
  visualInteractionActive: boolean;
  setVisualInteractionActive: (active: boolean) => void;
}

const KnownIssueTwinFilterContext = createContext<TwinFilterValue | null>(null);

export function KnownIssueTwinFilterProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[] | null>(null);
  const activeIds = useRef<string[] | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);
  const [visualInteractionActive, setVisualInteractionActive] = useState(false);
  const setActiveIssueIds = useCallback((next: readonly string[] | null) => {
    activeIds.current = next ? [...new Set(next)] : null;
    setIds(activeIds.current);
  }, []);
  // Navigation is an explicit transition. A hash left in the URL must not
  // undo a later intentional mileage selection on every render.
  const revealIssue = useCallback((issueId: string) => {
    if (activeIds.current && !activeIds.current.includes(issueId)) {
      setShowAll(true);
      setActiveIssueIds(null);
    }
  }, [setActiveIssueIds]);
  const value = useMemo<TwinFilterValue>(() => ({
    activeIssueIds: ids ? new Set(ids) : null,
    setActiveIssueIds,
    selectedTrim, setSelectedTrim,
    showAll, setShowAll, revealIssue, visualInteractionActive, setVisualInteractionActive,
  }), [ids, setActiveIssueIds, showAll, revealIssue, visualInteractionActive, selectedTrim]);
  return <KnownIssueTwinFilterContext.Provider value={value}>{children}</KnownIssueTwinFilterContext.Provider>;
}

export function useKnownIssueTwinFilter(): TwinFilterValue | null {
  return useContext(KnownIssueTwinFilterContext);
}

export function KnownIssueTwinIssueHeading({ total }: { total: number }) {
  const twinFilter = useKnownIssueTwinFilter();
  const filteredCount = twinFilter?.activeIssueIds?.size;
  const count = filteredCount ?? total;
  return (
    <h2 className="text-xl font-semibold mb-4" style={{ color: '#0B1220' }}>
      {filteredCount === undefined ? 'All ' : ''}{count} Known {count === 1 ? 'Issue' : 'Issues'}
      {filteredCount !== undefined ? ' at this mileage' : ''}
    </h2>
  );
}
