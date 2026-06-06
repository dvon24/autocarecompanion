/**
 * Photo-upload trace buffer.
 *
 * Ring buffer of phase events used to debug "spinner sits forever"
 * failures end-to-end. Pushed to /api/diag on demand (Send debug
 * report button) or automatically on error / visibilitychange-hidden
 * via navigator.sendBeacon so the trace survives the page suspending.
 *
 * Zero behavior coupling — every pushTrace call is additive and
 * cannot fail the upload itself.
 */

const MAX_ENTRIES = 80;

export interface TraceEntry {
  phase: string;
  t: number;
  dtSinceStart: number;
  extra?: Record<string, unknown>;
}

let buffer: TraceEntry[] = [];
let startedAt = 0;
let buildId: string | null = null;
let reqId: string | null = null;

export function getBuildId(): string {
  if (buildId) return buildId;
  const env = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  buildId = env ? env.slice(0, 7) : 'dev';
  return buildId;
}

export function clearTrace(): void {
  buffer = [];
  startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  reqId = null;
}

export function setReqId(id: string | null): void {
  reqId = id;
}

export function pushTrace(phase: string, extra?: Record<string, unknown>): void {
  const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const dt = startedAt ? Math.round(t - startedAt) : 0;
  buffer.push({ phase, t: Math.round(t), dtSinceStart: dt, extra });
  if (buffer.length > MAX_ENTRIES) buffer.splice(0, buffer.length - MAX_ENTRIES);
}

export function getTrace(): TraceEntry[] {
  return [...buffer];
}

/**
 * POST the trace to /api/diag. Uses navigator.sendBeacon when reason
 * is 'visibility' or 'unload' so the request survives the page being
 * suspended/torn down. Falls back to fetch() with keepalive for other
 * reasons. Never throws — diagnostics must not break the upload path.
 */
export function flushTrace(reason: string, extraContext?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (buffer.length === 0) return;

  const payload = {
    reason,
    buildId: getBuildId(),
    reqId,
    userAgent: navigator.userAgent,
    swController: navigator.serviceWorker?.controller?.scriptURL || null,
    trace: getTrace(),
    when: new Date().toISOString(),
    ...extraContext,
  };

  const body = JSON.stringify(payload);
  const url = '/api/diag';

  try {
    if ((reason === 'visibility' || reason === 'unload') && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => { /* diag is best-effort */ });
  } catch {
    /* never throw from a diagnostic helper */
  }
}
