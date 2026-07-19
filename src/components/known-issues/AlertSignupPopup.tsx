'use client';

import { useEffect, useState } from 'react';
import { KnownIssueAlertSignup } from './KnownIssueAlertSignup';
import { KnownIssuesCaptureSplit } from './KnownIssuesCaptureSplit';

// v2: the popup now carries the live hub-demo "carousel" (not the old email-
// only card). Bumping the key re-shows it once to everyone who dismissed the
// old version — the offer is materially different.
const FLAG_KEY = 'au7o.alertCapture.v2';

/**
 * Engagement popup around the known-issues capture. Surfaces the live
 * hub-demo carousel (KnownIssuesCaptureSplit) in a modal ~5s after the reader
 * lands — Devon wants it to "pop up within 5 seconds," the way the old email
 * popup did. It ALSO fires on a deep scroll, whichever comes first.
 *
 * SEO-safe: it never appears on first paint. Dismissal/submission is
 * remembered in localStorage (shared with the inline card) so a visitor is
 * never asked twice.
 */
export function AlertSignupPopup(props: {
  vehicleName: string;
  context: string;
  headline?: string;
  blurb?: string;
}) {
  const [forceOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('popup') === '1';
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(forceOpen);
  const [closed, setClosed] = useState(false);
  const [isPhone, setIsPhone] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = (event: MediaQueryListEvent) => setIsPhone(event.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    // Force-show override for testing: append ?popup=1 to any known-issues URL
    // and it opens immediately, ignoring the once-per-visitor flag.
    if (forceOpen) return;

    let flag: string | null = null;
    try { flag = localStorage.getItem(FLAG_KEY); } catch { /* private mode */ }
    if (flag) return; // already captured or dismissed → never show

    let fired = false;
    let timer = 0;
    const onScroll = () => {
      const doc = document.documentElement;
      const ratio = (doc.scrollTop + window.innerHeight) / Math.max(1, doc.scrollHeight);
      if (ratio > 0.4) fire();
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
    function fire() {
      if (fired) return;
      fired = true;
      cleanup();
      setOpen(true);
    }
    // Primary trigger: 5 seconds in. Scroll is a faster secondary trigger.
    timer = window.setTimeout(fire, 5000);
    window.addEventListener('scroll', onScroll, { passive: true });
    return cleanup;
  }, [forceOpen]);

  // Wait for the breakpoint probe before mounting modal content so phones
  // never flash the desktop feature carousel for a frame during hydration.
  if (!open || closed || isPhone === null) return null;

  const dismiss = () => {
    try { localStorage.setItem(FLAG_KEY, 'dismissed'); } catch { /* */ }
    setClosed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isPhone ? 12 : 16, background: 'rgba(11,14,20,0.6)', backdropFilter: 'blur(3px)', overflowY: 'auto' }}
    >
      <style>{`@keyframes alertPopIn { from { opacity: 0; transform: translateY(12px) scale(0.985) } to { opacity: 1; transform: none } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: isPhone ? 440 : 960, maxHeight: isPhone ? 'calc(100dvh - 24px)' : '92vh', overflowY: 'auto', animation: 'alertPopIn 0.22s ease-out', margin: 'auto', borderRadius: isPhone ? 16 : 24 }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          style={{ position: 'absolute', top: isPhone ? 8 : 10, right: isPhone ? 8 : 10, zIndex: 2, width: 32, height: 32, borderRadius: 999, border: isPhone ? '1px solid #E3DFD4' : '1px solid rgba(255,255,255,0.25)', background: isPhone ? 'rgba(255,255,255,0.96)' : 'rgba(11,18,32,0.55)', color: isPhone ? '#0B1220' : '#fff', fontSize: 15, lineHeight: 1, cursor: 'pointer', backdropFilter: 'blur(6px)' }}
        >
          ✕
        </button>
        {isPhone ? (
          <KnownIssueAlertSignup
            {...props}
            showCarousel={false}
            onDone={() => setClosed(true)}
          />
        ) : (
          <KnownIssuesCaptureSplit {...props} />
        )}
      </div>
    </div>
  );
}
