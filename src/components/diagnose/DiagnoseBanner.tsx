'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

/**
 * Slim "diagnose with a photo" banner for the known-issues surface.
 * Ported from BMAD au7o(4)/03-WebKnownIssues `KIDiagnoseBanner`.
 *
 * Known-issues pages are organic-search landings — visitors arrive
 * mid-intent ("is THIS my problem?") and never see the homepage. This
 * surfaces the anonymous photo/video diagnose flow (/diagnose) right
 * where the doubt peaks.
 *
 * Dismiss state lives in sessionStorage so it doesn't re-nag across the
 * KI pages in a session. We read it via useSyncExternalStore with a
 * server snapshot of `false` — so the crawlable `<a href="/diagnose">`
 * is always in the SSR HTML (Googlebot sees it), and hydration matches
 * the server before syncing to the real dismissed state. No
 * setState-in-effect, no hydration flash.
 */
const DISMISS_KEY = 'au7o.kiDiagBannerDismissed';

let listeners: Array<() => void> = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function getSnapshot() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}
function getServerSnapshot() {
  return false;
}

export function DiagnoseBanner({ className = '' }: { className?: string }) {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* sessionStorage unavailable (private mode) — banner just won't persist dismissal */
    }
    listeners.forEach((l) => l());
  };

  return (
    <div
      className={`flex items-center gap-3.5 ${className}`}
      style={{
        padding: '11px 16px',
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.16)',
        borderRadius: 12,
      }}
    >
      <span
        className="inline-flex items-center justify-center flex-shrink-0"
        style={{ width: 30, height: 30, borderRadius: 8, background: '#3B82F6', color: '#fff' }}
      >
        <Icon name="camera" size={15} />
      </span>
      <div className="flex-1 text-[13.5px] leading-snug" style={{ color: '#0B1220' }}>
        <span
          className="inline-flex items-center text-[9px] font-bold uppercase text-white align-middle mr-2"
          style={{ letterSpacing: '0.06em', background: '#3B82F6', padding: '2px 6px', borderRadius: 999 }}
        >
          New
        </span>
        <b>Can&apos;t find your exact symptom?</b>{' '}
        <span style={{ color: '#475569' }}>
          Snap a photo or video of the problem and Au7o will match it to known issues for your car.
        </span>
      </div>
      <Link
        href="/diagnose"
        className="inline-flex items-center gap-1.5 flex-shrink-0 font-semibold text-[12.5px] text-white hover:opacity-90 transition-opacity"
        style={{ padding: '8px 15px', background: '#3B82F6', borderRadius: 9 }}
      >
        <Icon name="camera" size={12} /> Diagnose with a photo
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 inline-flex p-1 transition-colors"
        style={{ color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
