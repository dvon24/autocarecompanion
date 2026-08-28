'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { TwinDataCtx } from '@/components/twin/twin-context';
import { buildDemoTwinPresentation } from '@/components/twin/demo-trees';
import { resolveDemoVehicleTwin } from '@/lib/vehicle-twin-catalog';

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

export function DemoHubClient({ vehicleId }: { vehicleId?: string | null }) {
  const value = useMemo(() => {
    const catalog = resolveDemoVehicleTwin(vehicleId);
    const presentation = buildDemoTwinPresentation(catalog, { mode:'demo' });
    return { catalog, presentation, vehicle:catalog.identity, miles:catalog.demoMileage, trees:presentation.trees, issues:[], nextService:null, recent:[], mode:'demo' as const };
  }, [vehicleId]);
  return <TwinDataCtx.Provider value={value}><Hub /></TwinDataCtx.Provider>;
}
