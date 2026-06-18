'use client';

import { useEffect, useState } from 'react';
import { KnownIssueAlertSignup } from './KnownIssueAlertSignup';

const FLAG_KEY = 'au7o.alertCapture';

/**
 * Engagement-triggered popup wrapper around the alert capture. The inline
 * card sits at the bottom and gets missed (Devon: "almost didn't notice it"),
 * so this surfaces the same capture in a modal AFTER the reader engages.
 *
 * SEO-safe: it NEVER appears on page load — only after the user scrolls past
 * ~40% OR ~25s in. Google penalizes load-time interstitials; an
 * engagement-triggered one is fine. Dismissal/submission is remembered in
 * localStorage (shared with the inline card) so a visitor is never asked twice.
 */
export function AlertSignupPopup(props: {
  vehicleName: string;
  context: string;
  headline?: string;
  blurb?: string;
}) {
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
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
    timer = window.setTimeout(fire, 25000);
    window.addEventListener('scroll', onScroll, { passive: true });
    return cleanup;
  }, []);

  if (!open || closed) return null;

  const dismiss = () => {
    try { localStorage.setItem(FLAG_KEY, 'dismissed'); } catch { /* */ }
    setClosed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(11,14,20,0.5)', backdropFilter: 'blur(2px)' }}
    >
      <style>{`@keyframes alertPopIn { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: none } }`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 440, animation: 'alertPopIn 0.2s ease-out' }}>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          style={{ position: 'absolute', top: -10, right: -10, zIndex: 1, width: 30, height: 30, borderRadius: 999, border: '1px solid #E3DFD4', background: '#fff', color: '#64748B', fontSize: 15, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          ✕
        </button>
        <KnownIssueAlertSignup {...props} onDone={() => { window.setTimeout(() => setClosed(true), 1600); }} />
      </div>
    </div>
  );
}
