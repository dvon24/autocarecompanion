'use client';

import dynamic from 'next/dynamic';

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

export function DemoHubClient() {
  return <Hub />;
}
