'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBuildId, getTrace, flushTrace } from '@/lib/upload-trace';

/**
 * Tiny floating badge that shows photo-upload diagnostics. Only mounts
 * when one of these is true:
 *   - URL has ?debug=1
 *   - localStorage has au7o_debug=on
 *
 * Tap the badge to expand: shows running build SHA, the deployed
 * build SHA (from /api/build-id, fetched on open), active SW URL,
 * waiting SW URL, AbortSignal.timeout availability, last upload
 * trace entries, and a "Send debug report" button that flushes the
 * trace to /api/diag for server-side capture.
 *
 * Zero impact on production users — returns null on render unless
 * the flag is set, so the bundle's only cost is one early-exit
 * useEffect.
 */
export function PhotoDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [deployedBuildId, setDeployedBuildId] = useState<string | null>(null);
  const [activeSwUrl, setActiveSwUrl] = useState<string | null>(null);
  const [waitingSwUrl, setWaitingSwUrl] = useState<string | null>(null);
  const [trace, setTrace] = useState<ReturnType<typeof getTrace>>([]);
  const [reportSent, setReportSent] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const flag = url.searchParams.get('debug') === '1';
    if (flag) {
      try { localStorage.setItem('au7o_debug', 'on'); } catch { /* */ }
    }
    const persistFlag = (() => {
      try { return localStorage.getItem('au7o_debug') === 'on'; } catch { return false; }
    })();
    setEnabled(flag || persistFlag);
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setTrace(getTrace());

    // SW URLs.
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      setActiveSwUrl(reg?.active?.scriptURL || null);
      setWaitingSwUrl(reg?.waiting?.scriptURL || null);
    } catch { /* SW APIs may not exist in private mode */ }

    // Deployed build id.
    try {
      const r = await fetch('/api/build-id', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json() as { buildId?: string };
        setDeployedBuildId(j.buildId || null);
      }
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    if (!open) return;
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, [open, refresh]);

  const sendReport = useCallback(() => {
    setReportSent('sending');
    flushTrace('user_button');
    setTimeout(() => setReportSent('sent'), 400);
  }, []);

  const disable = useCallback(() => {
    try { localStorage.removeItem('au7o_debug'); } catch { /* */ }
    setEnabled(false);
  }, []);

  if (!enabled) return null;

  const runningBuildId = getBuildId();
  const buildMatch = deployedBuildId && runningBuildId !== 'dev' && deployedBuildId === runningBuildId;
  const buildMismatch = deployedBuildId && runningBuildId !== 'dev' && deployedBuildId !== runningBuildId;
  const hasAbortTimeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function';

  return (
    <>
      <button
        type="button"
        className="dbg-badge"
        onClick={() => setOpen((o) => !o)}
        aria-label="Au7o debug"
      >
        {buildMismatch ? '⚠ ' : ''}DBG {runningBuildId}
      </button>

      {open && (
        <div className="dbg-panel" role="dialog" aria-label="Photo upload debug">
          <div className="dbg-head">
            <strong>Photo upload debug</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="dbg-row">
            <span className="dbg-label">Running build</span>
            <code>{runningBuildId}</code>
          </div>
          <div className="dbg-row">
            <span className="dbg-label">Deployed build</span>
            <code>{deployedBuildId || '…'}</code>
          </div>
          <div className="dbg-row">
            <span className="dbg-label">Build match</span>
            <code className={buildMatch ? 'ok' : buildMismatch ? 'err' : ''}>
              {buildMatch ? 'YES' : buildMismatch ? 'STALE' : '?'}
            </code>
          </div>
          <div className="dbg-row">
            <span className="dbg-label">AbortSignal.timeout</span>
            <code className={hasAbortTimeout ? 'ok' : 'err'}>
              {hasAbortTimeout ? 'function' : 'missing'}
            </code>
          </div>
          <div className="dbg-row">
            <span className="dbg-label">SW controller</span>
            <code className="dbg-mono">{activeSwUrl ? activeSwUrl.split('/').pop() : 'none'}</code>
          </div>
          {waitingSwUrl && (
            <div className="dbg-row">
              <span className="dbg-label">SW waiting</span>
              <code className="dbg-mono">{waitingSwUrl.split('/').pop()}</code>
            </div>
          )}

          <div className="dbg-sec">Trace ({trace.length})</div>
          <div className="dbg-trace">
            {trace.length === 0 ? (
              <div className="dbg-empty">No upload attempted yet.</div>
            ) : (
              trace.map((e, i) => (
                <div key={i} className="dbg-trace-row">
                  <code>{String(e.dtSinceStart).padStart(5)}ms</code>{' '}
                  <span>{e.phase}</span>
                  {e.extra && Object.keys(e.extra).length > 0 && (
                    <code className="dbg-mono dbg-extra">{JSON.stringify(e.extra)}</code>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="dbg-actions">
            <button type="button" onClick={refresh}>Refresh</button>
            <button
              type="button"
              onClick={sendReport}
              disabled={reportSent === 'sending' || trace.length === 0}
            >
              {reportSent === 'sent' ? 'Sent ✓' : reportSent === 'sending' ? 'Sending…' : 'Send debug report'}
            </button>
            <button type="button" onClick={disable} className="dbg-disable">Disable</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dbg-badge {
          position: fixed; bottom: 12px; left: 12px; z-index: 99999;
          padding: 6px 10px; border-radius: 999px;
          background: rgba(0,0,0,0.78); color: #fff; font-size: 10.5px;
          font-family: 'SF Mono', Menlo, monospace; letter-spacing: 0.04em;
          border: 0; cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        }
        .dbg-panel {
          position: fixed; bottom: 50px; left: 12px; right: 12px;
          max-width: 480px;
          z-index: 99998;
          background: #0B1220; color: #E2E8F0;
          border: 1px solid #334155; border-radius: 10px;
          padding: 10px 12px;
          font-size: 11.5px; line-height: 1.45;
          box-shadow: 0 10px 30px rgba(0,0,0,0.45);
          max-height: 70vh; overflow-y: auto;
        }
        .dbg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .dbg-head button { background: transparent; color: #94A3B8; border: 0; font-size: 16px; cursor: pointer; padding: 0 4px; }
        .dbg-row { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; }
        .dbg-label { color: #94A3B8; }
        .dbg-row code { color: #E2E8F0; font-family: 'SF Mono', Menlo, monospace; }
        .dbg-row code.ok { color: #10B981; }
        .dbg-row code.err { color: #F87171; }
        .dbg-mono { font-family: 'SF Mono', Menlo, monospace; word-break: break-all; max-width: 65%; text-align: right; }
        .dbg-sec { color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; font-size: 9.5px; margin: 10px 0 4px; }
        .dbg-trace { background: #020617; border-radius: 6px; padding: 6px 8px; max-height: 220px; overflow-y: auto; }
        .dbg-trace-row { font-family: 'SF Mono', Menlo, monospace; font-size: 10.5px; padding: 1px 0; }
        .dbg-trace-row code { color: #94A3B8; }
        .dbg-trace-row span { color: #E2E8F0; }
        .dbg-empty { color: #64748B; font-style: italic; padding: 4px 0; }
        .dbg-extra { color: #475569 !important; font-size: 9.5px; margin-left: 4px; }
        .dbg-actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
        .dbg-actions button {
          padding: 6px 10px; border-radius: 6px;
          background: #1E293B; color: #E2E8F0; border: 1px solid #334155;
          font-size: 11px; cursor: pointer;
        }
        .dbg-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
        .dbg-actions button.dbg-disable { margin-left: auto; background: transparent; color: #94A3B8; border-color: #475569; }
      `}</style>
    </>
  );
}
