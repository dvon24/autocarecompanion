'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { TwinDataCtx } from '@/components/twin/twin-context';
import { attachKnownIssueDetails, buildDemoTwinPresentation } from '@/components/twin/demo-trees';
import { resolveDemoVehicleTwin } from '@/lib/vehicle-twin-catalog';
import { getTransmissionOptions } from '@/lib/transmission-options';
import type { TwinIssueSummary } from '@/lib/twin-known-issues';

/**
 * The hub is a heavy, entirely interactive screen (car stage + tech-tree canvas
 * + overlays). Loading it client-only keeps it out of the server render — the
 * design's code reaches for window/localStorage in several places, and there is
 * nothing here worth server-rendering for SEO beyond the page metadata.
 */
const Hub = dynamic(
  () => import('@/components/twin/hub/HubRoot').then((m) => ({ default: m.HubRoot })),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--ki-page)', color: 'var(--slate-500)', fontSize: 13 }}>
        Loading your demo car…
      </div>
    ),
  },
);

export function DemoHubClient({ vehicleId, issues = [] }: { vehicleId?: string | null; issues?: TwinIssueSummary[] }) {
  const catalog = useMemo(() => resolveDemoVehicleTwin(vehicleId), [vehicleId]);
  const [paintState, setPaintState] = useState({ catalogId:catalog.id, choice:catalog.identity.paint });
  const transmissionOptions = useMemo(() => getTransmissionOptions(catalog.identity), [catalog]);
  const defaultTransmission = catalog.id === 'camaro' ? 'manual' : 'automatic';
  const [transmissionState, setTransmissionState] = useState({ catalogId:catalog.id, choice:defaultTransmission });
  const transmissionChoice = transmissionState.catalogId === catalog.id ? transmissionState.choice : defaultTransmission;
  const paintChoice = paintState.catalogId === catalog.id ? paintState.choice : catalog.identity.paint;
  const setPaintChoice = useCallback((choice: string) => setPaintState({ catalogId:catalog.id, choice }), [catalog.id]);
  const value = useMemo(() => {
    const trees = attachKnownIssueDetails(buildDemoTwinPresentation(catalog, { mode:'demo', transmission:transmissionChoice }).trees, issues);
    const presentation = buildDemoTwinPresentation(catalog, { mode:'demo', trees, transmission:transmissionChoice });
    return {
      catalog,
      presentation,
      vehicle:{ ...catalog.identity, transmission:transmissionChoice },
      miles:catalog.demoMileage,
      trees,
      issues,
      nextService:null,
      recent:[],
      mode:'demo' as const,
      transmissionControl:transmissionOptions.length > 1 ? {
        model:{ current:transmissionChoice, options:transmissionOptions },
        choice:transmissionChoice,
        state:'idle',
        error:'',
        setChoice:(choice:string)=>setTransmissionState({catalogId:catalog.id,choice}),
      } : null,
      paintControl:catalog.paintPalette?.colors?.length ? {
        current:catalog.identity.paint,
        choice:paintChoice,
        options:catalog.paintPalette.colors,
        state:'idle',
        error:'',
        setChoice:setPaintChoice,
      } : null,
    };
  }, [catalog, issues, paintChoice, setPaintChoice, transmissionChoice, transmissionOptions]);
  return <TwinDataCtx.Provider value={value}><Hub /></TwinDataCtx.Provider>;
}
