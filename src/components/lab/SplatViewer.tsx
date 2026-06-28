'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Browser Gaussian-splat viewer (founder lab). Renders a .ply/.ksplat splat with
 * orbit controls. Uses @mkkellogg/gaussian-splats-3d, imported lazily inside the
 * effect so it never runs during SSR.
 *
 * sharedMemoryForWorkers:false → no cross-origin-isolation (COOP/COEP) headers
 * needed; works on a normal Vercel page (slightly slower sort, fine for a demo).
 */
export default function SplatViewer({ splatUrl }: { splatUrl: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | null = null;

    (async () => {
      try {
        const GS = await import('@mkkellogg/gaussian-splats-3d');
        if (cancelled || !hostRef.current) return;
        const v = new GS.Viewer({
          rootElement: hostRef.current,
          sharedMemoryForWorkers: false,
          useBuiltInControls: true,
          cameraUp: [0, 1, 0],
          initialCameraPosition: [0, 0, 4],
          initialCameraLookAt: [0, 0, 0],
          dynamicScene: false,
        });
        dispose = () => { try { v.dispose(); } catch { /* ignore teardown errors */ } };
        await v.addSplatScene(splatUrl, {
          showLoadingUI: false,
          splatAlphaRemovalThreshold: 5,
          progressiveLoad: true,
        });
        if (cancelled) { dispose(); return; }
        v.start();
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [splatUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0B1220', borderRadius: 14, overflow: 'hidden' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#94A3B8', fontSize: 13 }}>
          Loading 3D model…
        </div>
      )}
      {status === 'error' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#FCA5A5', fontSize: 12, padding: 16, textAlign: 'center' }}>
          Couldn&apos;t load the splat.<br />{err}
        </div>
      )}
      {status === 'ready' && (
        <div style={{ position: 'absolute', left: 10, bottom: 8, color: '#64748B', fontSize: 11, pointerEvents: 'none' }}>
          drag to orbit · scroll to zoom
        </div>
      )}
    </div>
  );
}
