'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MaintenanceSuggestion } from '@/lib/maintenance-suggestions';
import type { RecentThread, TrendingChip, AttachableIssue } from '@/lib/hub-data';

/**
 * Conversation-first hub that lives at /vehicle/[slug]. The chat IS the
 * product — vehicle context lives in a slim left rail, and issues / recalls /
 * parts / Drive routes surface as rich attachments inside the conversation.
 *
 * v1 scope:
 *   - Renders the layout
 *   - Auto-generated first message tailored to maintenance suggestions
 *   - Suggested-prompt chips derived from the user's mileage gaps
 *   - Composer wired (sends + appends to local message list, no API call yet)
 *   - Anonymous gate banner when not signed in
 *   - Recent threads / issue attachments / map preview = mock for v1
 *
 * v2:
 *   - Composer hits /api/chat with system-prompt caching + ChatPromptInsight logging
 *   - Real ChatSession persistence powering the recent-threads rail
 *   - Real attachment rendering when Claude returns tool_use blocks
 *   - "Trending for your car" chip group from TrendingIntent
 */

export interface VehicleHubProps {
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim: string;
  };
  /** Slug we're on — used for analytics + Drive deep-link. */
  slug: string;
  /** True when the user is signed in. Drives the anonymous gate banner +
   *  whether maintenance suggestions are surfaced. */
  isAuthed: boolean;
  /** Server-side count of known issues + recalls + cached parts for the
   *  vehicle. Powers the chips on the rail. */
  counts: { knownIssues: number; recalls: number; partsCached: number };
  /** Optional — user's odometer reading from their Vehicle row. Drives the
   *  mileage line on the rail and the maintenance opener. */
  currentMileage: number | null;
  /** Generated server-side via getMaintenanceSuggestions(). Empty when
   *  anonymous OR when there's nothing flagged. */
  maintenanceSuggestions: MaintenanceSuggestion[];
  /** Pre-rendered opener message (from renderOpener) so the first turn
   *  is instant + deterministic. */
  opener: { text: string; cta: string[] };
  /** Recent ChatSession rows for the user. Empty for anonymous viewers. */
  recentThreads: RecentThread[];
  /** Pre-aggregated trending intents for the vehicle's mileage bucket.
   *  Empty until the nightly cron has data — falls back gracefully. */
  trending: TrendingChip[];
  /** Top KnownIssue records for this vehicle, ready to render as inline
   *  attachments when the assistant mentions one in a reply. Bounded to 12. */
  attachableIssues: AttachableIssue[];
}

interface RoutePreview {
  /** Route polyline as [lng,lat][] from Mapbox Directions. */
  geometry: [number, number][];
  /** Origin we requested with — re-used as the "you are here" pin. */
  origin: { lng: number; lat: number };
  /** Destination Mapbox resolved to (may differ slightly from text). */
  destination: { lng: number; lat: number; placeName: string };
  miles: number;
  minutes: number;
  /** True while we're fetching — bubble shows a skeleton during this. */
  loading: boolean;
  /** Set when the request fails (no GPS, geocode miss, etc.). */
  error?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** Inline route preview attached to this turn when trip intent fires. */
  route?: RoutePreview;
}

export function VehicleHub({
  vehicle,
  slug,
  isAuthed,
  counts,
  currentMileage,
  maintenanceSuggestions,
  opener,
  recentThreads,
  trending,
  attachableIssues,
}: VehicleHubProps) {
  // Seed the conversation with the pre-rendered opener so the page feels
  // alive on first paint. Subsequent turns get appended here and (in v2)
  // sent to /api/chat for the real reply.
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: opener.text, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  // Server-issued sessionId — set after the first reply so subsequent
  // turns are tied to the same ChatSession row + history is loaded
  // server-side instead of being shipped over the wire each turn.
  const sessionIdRef = useRef<string | null>(null);
  // Tracks the index of the assistant message we're currently streaming
  // INTO so each token append targets the right bubble.
  const streamingIdxRef = useRef<number | null>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setInput('');

    // Append the user's message + an empty assistant placeholder. The
    // placeholder gets filled in token-by-token as SSE chunks arrive.
    setMessages((prev) => {
      const next = [
        ...prev,
        { role: 'user' as const, content: trimmed, timestamp: Date.now() },
        { role: 'assistant' as const, content: '', timestamp: Date.now() },
      ];
      streamingIdxRef.current = next.length - 1;
      return next;
    });

    // ── Trip intent detected on the USER's message (not the AI's reply).
    // Detection on the user side is far more reliable: regex finds clear
    // signal in "plan a road trip / take me to X / scenic drive", and we
    // can fire the route fetch in parallel with the chat stream so the
    // map renders by the time the assistant finishes writing.
    //
    // We pass the user's literal text as the transcript to
    // /api/drive/plan-route — the same endpoint that powers voice nav,
    // which already handles natural language ("plan a scenic drive" with
    // no specific destination → it picks one). No regex destination
    // extraction needed; let the routing endpoint do its job.
    const tripIntent = looksLikeTripQuestion(trimmed);
    console.log('[hub] trip-intent for', JSON.stringify(trimmed), '→', tripIntent);
    if (tripIntent) {
      const placeholderIdx = streamingIdxRef.current!;
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[placeholderIdx]) {
          copy[placeholderIdx] = {
            ...copy[placeholderIdx],
            route: {
              geometry: [],
              origin: { lng: 0, lat: 0 },
              destination: { lng: 0, lat: 0, placeName: 'Plotting…' },
              miles: 0, minutes: 0, loading: true,
            },
          };
        }
        return copy;
      });
      console.log('[hub] firing fetchRoutePreview…');
      fetchRoutePreview(trimmed).then((route) => {
        console.log('[hub] route fetch returned', {
          ok: !route.error && route.geometry.length > 0,
          error: route.error,
          geometryPts: route.geometry.length,
          miles: route.miles,
        });
        setMessages((prev) => {
          const copy = [...prev];
          if (copy[placeholderIdx]) copy[placeholderIdx] = { ...copy[placeholderIdx], route };
          return copy;
        });
      });
    }

    // Read cached GPS (set the first time the route fetcher needed it)
    // so the chat AI can anchor regional suggestions. Don't trigger a
    // permission prompt here — only use it if it's already cached. The
    // route preview path will prompt naturally when the user actually
    // asks about a trip.
    let userLocation: { lng: number; lat: number } | undefined;
    try {
      const cached = sessionStorage.getItem('au7o-hub-gps');
      if (cached) {
        const parsed = JSON.parse(cached) as { lng: number; lat: number; t: number };
        if (Date.now() - parsed.t < 15 * 60_000) {
          userLocation = { lng: parsed.lng, lat: parsed.lat };
        }
      }
    } catch { /* ignore */ }

    try {
      const res = await fetch('/api/hub-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
            currentMileage: currentMileage ?? undefined,
          },
          sessionId: sessionIdRef.current,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: trimmed },
          ],
          // Hand the assistant our exact KnownIssue titles so it can
          // reference them verbatim — that's how the inline issue
          // attachment cards get matched + rendered.
          knownIssueTitles: attachableIssues.map((i) => ({ id: i.id, title: i.title })),
          userLocation,
        }),
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({} as { message?: string; gated?: boolean }));
        const fallbackMessage = res.status === 429
          ? (errBody.message || 'Daily limit reached.')
          : (errBody.message || `Chat failed (HTTP ${res.status}).`);
        setMessages((prev) => {
          const idx = streamingIdxRef.current;
          if (idx == null) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], content: fallbackMessage };
          return copy;
        });
        setPending(false);
        return;
      }

      // Parse SSE stream — each line that starts with `data: ` is a
      // JSON event. We split on `\n\n` per the SSE spec but tolerate a
      // partial last frame between reads.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith('data: ')) continue;
          let event: { type: string; text?: string; sessionId?: string; message?: string };
          try { event = JSON.parse(line.slice(6)); }
          catch { continue; }
          if (event.type === 'session' && event.sessionId) {
            sessionIdRef.current = event.sessionId;
          } else if (event.type === 'token' && event.text) {
            setMessages((prev) => {
              const idx = streamingIdxRef.current;
              if (idx == null) return prev;
              const copy = [...prev];
              copy[idx] = { ...copy[idx], content: copy[idx].content + event.text };
              return copy;
            });
          } else if (event.type === 'error' && event.message) {
            setMessages((prev) => {
              const idx = streamingIdxRef.current;
              if (idx == null) return prev;
              const copy = [...prev];
              copy[idx] = { ...copy[idx], content: copy[idx].content || event.message! };
              return copy;
            });
          }
          // 'done' has token-usage info we could surface later.
        }
      }

      // (route fetch fires in parallel with the stream — see below)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error.';
      setMessages((prev) => {
        const idx = streamingIdxRef.current;
        if (idx == null) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], content: copy[idx].content || `Couldn't reach the chat service: ${errMsg}` };
        return copy;
      });
    } finally {
      setPending(false);
      streamingIdxRef.current = null;
    }
  };

  /**
   * Plan a route from the user's GPS using their literal trip-question
   * text as the transcript to /api/drive/plan-route. Re-uses the same
   * endpoint that powers voice nav — it accepts natural language and
   * handles "plan a scenic drive" (no destination, picks one) just as
   * well as "take me to Austin". GPS cached in sessionStorage so
   * back-to-back trip questions don't re-prompt.
   */
  const fetchRoutePreview = async (transcript: string): Promise<RoutePreview> => {
    let origin: { lng: number; lat: number };
    try {
      origin = await getCachedGeolocation();
      console.log('[hub] geolocation ok →', origin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Location permission needed';
      console.warn('[hub] geolocation failed:', msg);
      return {
        geometry: [], origin: { lng: 0, lat: 0 },
        destination: { lng: 0, lat: 0, placeName: 'Plotting…' },
        miles: 0, minutes: 0, loading: false, error: msg,
      };
    }

    try {
      console.log('[hub] POST /api/drive/plan-route', { transcript });
      const res = await fetch('/api/drive/plan-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          origin,
          conversationHistory: [],
          vehicle: { year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim || '' },
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.warn('[hub] plan-route HTTP', res.status, errBody.slice(0, 200));
        throw new Error(`Route service returned ${res.status}`);
      }
      const data = await res.json() as {
        geometry?: { coordinates: [number, number][] };
        destinationCoords?: { lng: number; lat: number };
        destination?: string;
        miles?: number;
        minutes?: number;
        intent?: 'navigate' | 'clarify' | 'chat';
      };
      if (!data.geometry?.coordinates || !data.destinationCoords) {
        console.warn('[hub] plan-route returned no geometry', data);
        // When the voice-nav endpoint returns intent=clarify, it's not an
        // error — it's saying "I need more info". The AI's chat response
        // already handles the clarification ("Where are you headed?"), so
        // don't show an error tile that would just duplicate that. Return
        // a non-error empty route so the bubble renders the chat reply
        // without any map artifact below it.
        return {
          geometry: [], origin,
          destination: { lng: 0, lat: 0, placeName: data.destination || 'destination' },
          miles: 0, minutes: 0, loading: false,
          error: data.intent === 'clarify' ? undefined : 'Could not plot that route',
        };
      }
      return {
        geometry: data.geometry.coordinates,
        origin,
        destination: {
          lng: data.destinationCoords.lng,
          lat: data.destinationCoords.lat,
          placeName: data.destination || 'destination',
        },
        miles: data.miles || 0,
        minutes: data.minutes || 0,
        loading: false,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Route failed';
      return {
        geometry: [], origin,
        destination: { lng: 0, lat: 0, placeName: 'destination' },
        miles: 0, minutes: 0, loading: false, error: msg,
      };
    }
  };

  return (
    <div className="hub-stage">
      <VehicleRail
        vehicle={vehicle}
        currentMileage={currentMileage}
        counts={counts}
        recentThreads={recentThreads}
      />

      <section className="hub-col">
        <TopBar />

        {!isAuthed && <AnonymousGate />}

        <div ref={scrollRef} className="hub-conv">
          <div className="hub-ambient">
            <div className="hub-blob b1" /><div className="hub-blob b2" /><div className="hub-blob b3" />
          </div>

          <Greeting
            vehicle={vehicle}
            cta={opener.cta}
            trending={trending}
            onPick={(prompt) => { send(prompt); }}
          />

          {messages.map((m, i) => (
            m.role === 'user'
              ? <div key={i} className="row-user"><div className="bubble-user">{m.content}</div></div>
              : (
                <Au7oReply
                  key={i}
                  content={m.content}
                  // Match issues whose title appears in the assistant's reply
                  // and render them as inline cards. Cheap substring match —
                  // good enough for v1; v2 could use the tool-use API to have
                  // the model itself emit issue ids.
                  attachments={matchAttachments(m.content, attachableIssues)}
                  // Detect trip-planning intent (the assistant ends with
                  // "open in Drive" / "plan it in Drive" by system-prompt
                  // convention). When `route` is attached, the message
                  // already has a real Mapbox geometry — show the inline
                  // mini-map. When it isn't (intent detected but route
                  // not yet fetched / failed silently), fall back to the
                  // simple Drive handoff button.
                  driveHandoff={detectDriveIntent(m.content)}
                  route={m.route}
                  // Pick chip-able follow-up prompts to send next.
                  onFollowUp={(prompt) => send(prompt)}
                />
              )
          ))}
        </div>

        <Composer
          ref={composerRef}
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          pending={pending}
          isAuthed={isAuthed}
        />
      </section>

      <style jsx>{`
        .hub-stage {
          display: flex;
          height: 100vh;
          background: #ECE9DF;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
          color: #0B1220;
          overflow: hidden;
        }
        .hub-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          min-width: 0;
        }
        .hub-conv {
          flex: 1;
          overflow-y: auto;
          position: relative;
          z-index: 1;
          padding: 32px 56px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .hub-conv::-webkit-scrollbar { width: 8px; }
        .hub-conv::-webkit-scrollbar-thumb { background: rgba(11,18,32,0.12); border-radius: 4px; }
        .hub-ambient { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .hub-blob { position: absolute; border-radius: 50%; }
        .b1 { left: -10%; top: -20%; width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(59,130,246,0.10), transparent 60%);
          animation: floatA 22s ease-in-out infinite; }
        .b2 { right: -15%; top: 30%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.08), transparent 60%);
          animation: floatB 28s ease-in-out infinite; }
        .b3 { left: 30%; bottom: -25%; width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(245,158,11,0.06), transparent 60%);
          animation: floatC 34s ease-in-out infinite; }
        @keyframes floatA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,30px); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,40px); } }
        @keyframes floatC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }

        .row-user { display: flex; justify-content: flex-end; margin-top: 14px; }
        :global(.bubble-user) {
          background: #0B1220; color: #fff;
          padding: 12px 16px; border-radius: 18px 18px 4px 18px;
          font-size: 14.5px; line-height: 1.5; max-width: 580px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}

/* ─── Vehicle rail ─── */
function VehicleRail({
  vehicle, currentMileage, counts, recentThreads,
}: { vehicle: VehicleHubProps['vehicle']; currentMileage: number | null; counts: VehicleHubProps['counts']; recentThreads: RecentThread[] }) {
  const v = vehicle;
  return (
    <aside className="rail">
      <div className="rail-top">
        <Link href="/" className="brand">
          <Image src="/og-image.png" alt="Au7o" width={28} height={28} />
          <span className="brand-text">Au<span className="accent">7</span>o</span>
        </Link>
      </div>

      <div className="veh-card">
        <div className="veh-silhouette">
          <CoupeSilhouette />
        </div>
        <div className="veh-name">{v.year} {v.make} {v.model}</div>
        <div className="veh-meta">
          {v.trim}
          {currentMileage != null && <> · <span className="mono">{currentMileage.toLocaleString()} mi</span></>}
        </div>
        <div className="veh-chips">
          {counts.knownIssues > 0 && <span className="chip-mini warn">{counts.knownIssues} issues</span>}
          {counts.recalls > 0 && <span className="chip-mini crit">{counts.recalls} recalls</span>}
          {counts.partsCached > 0 && <span className="chip-mini ok">{counts.partsCached} parts</span>}
        </div>
      </div>

      <div className="eyebrow">Recent</div>
      <div className="thread-list">
        {recentThreads.length === 0 ? (
          <div className="thread-empty">No saved conversations yet.</div>
        ) : (
          recentThreads.map((t) => (
            <button key={t.id} className="thread" title={t.preview}>
              <div className="t-meta">
                <div className="t-title">{t.preview || 'Untitled conversation'}</div>
                <div className="t-when">{relativeWhen(t.updatedAt)}</div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="rail-spacer" />

      <div className="rail-bottom">
        <Link href={`/known-issues/${v.make.toLowerCase().replace(/\s+/g, '-')}-${v.model.toLowerCase().replace(/\s+/g, '-')}`}
              className="rail-link">Known issues page</Link>
        <Link href="/drive" className="rail-link">Open Drive</Link>
      </div>

      <style jsx>{`
        .rail {
          width: 300px; flex: 0 0 300px;
          background: rgba(255,255,255,0.5); backdrop-filter: blur(20px);
          border-right: 1px solid #E3DFD4;
          display: flex; flex-direction: column;
        }
        .rail-top { padding: 22px 24px 18px; }
        .brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #0B1220; }
        .brand-text { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
        .accent { color: #3B82F6; }
        .veh-card {
          margin: 0 16px; padding: 16px;
          background: linear-gradient(180deg, #fff, #FAF8F2);
          border: 1px solid #E3DFD4; border-radius: 14px;
        }
        .veh-silhouette { display: flex; justify-content: center; margin-bottom: 8px; }
        .veh-name { font-size: 13.5px; font-weight: 600; line-height: 1.3; }
        .veh-meta { font-size: 11.5px; color: #64748B; margin-top: 2px; }
        .mono { font-family: var(--font-geist-mono, ui-monospace, monospace); font-feature-settings: "tnum" 1; }
        .veh-chips { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
        :global(.chip-mini) {
          font-size: 10.5px; font-weight: 600; padding: 3px 8px; border-radius: 999px;
          font-family: var(--font-geist-mono, ui-monospace, monospace);
        }
        :global(.chip-mini.ok) { background: #D1FAE5; color: #065F46; }
        :global(.chip-mini.warn) { background: #FEF3C7; color: #92400E; }
        :global(.chip-mini.crit) { background: #FEE2E2; color: #991B1B; }
        .eyebrow {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #64748B; padding: 18px 24px 8px;
        }
        .thread-list { padding: 0 12px; display: flex; flex-direction: column; gap: 2px; max-height: 240px; overflow-y: auto; }
        .thread-empty { font-size: 12.5px; color: #94A3B8; padding: 0 12px; }
        .thread {
          display: block; width: 100%; text-align: left;
          background: transparent; border: 0; cursor: pointer;
          padding: 9px 12px; border-radius: 10px; color: #0B1220;
        }
        .thread:hover { background: rgba(11,18,32,0.04); }
        .t-title { font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .t-when { font-size: 10.5px; color: #64748B; margin-top: 1px; }
        .rail-spacer { flex: 1; }
        .rail-bottom {
          padding: 12px 16px; border-top: 1px solid #E3DFD4;
          display: flex; flex-direction: column; gap: 6px;
        }
        .rail-link {
          display: flex; align-items: center; justify-content: center;
          padding: 10px 12px; border-radius: 12px;
          background: #fff; border: 1px solid #E3DFD4;
          font-size: 13px; font-weight: 500; color: #0B1220;
          text-decoration: none;
        }
        .rail-link:hover { background: #EFEDE6; }
      `}</style>
    </aside>
  );
}

/* ─── Top bar ─── Drive + Library buttons removed in batch 3 — Drive
 lives in the rail footer ("Open Drive"), and Library is folded into the
 conversation itself (you ask, the AI surfaces relevant articles inline).
 The right side is intentionally empty so the global Translate widget
 can dock there without overlap. The reserved-spacer keeps the title
 centered visually. */
function TopBar() {
  return (
    <div className="topbar">
      <div className="tb-left">
        <span className="eyebrow-inline">Conversation</span>
        <span className="tb-sep">·</span>
        <span style={{ color: '#334155' }}>Symptoms &amp; maintenance</span>
      </div>
      <div className="tb-right" aria-hidden="true">
        {/* Reserved space for the global Translate button (~110px wide). */}
        <span style={{ width: 110, display: 'inline-block' }} />
      </div>
      <style jsx>{`
        .topbar {
          height: 56px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #E3DFD4;
          background: rgba(255,255,255,0.5); backdrop-filter: blur(20px);
          position: relative; z-index: 5; flex: 0 0 auto;
        }
        .tb-left { display: flex; align-items: center; gap: 12px; font-size: 13px; }
        .eyebrow-inline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #64748B;
        }
        .tb-sep { color: #CBD5E1; }
        .tb-right { display: flex; gap: 8px; }
      `}</style>
    </div>
  );
}

/* ─── Anonymous gate ─── */
function AnonymousGate() {
  return (
    <div className="gate">
      <span>
        <strong>Sign in to save</strong> your conversations, log maintenance, and unlock pre-trip safety checks.
      </span>
      <Link href="/auth/signin" className="gate-cta">Sign in</Link>
      <style jsx>{`
        .gate {
          margin: 14px 56px 0; padding: 12px 14px;
          background: #FFF7E8; border: 1px solid #F5E5BD;
          border-radius: 12px; font-size: 12.5px; color: #92400E;
          display: flex; align-items: center; gap: 10px;
        }
        .gate-cta {
          margin-left: auto; padding: 6px 12px; border-radius: 8px;
          background: #0B1220; color: #fff; font-size: 12px; font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

/* ─── Greeting + suggested prompts ─── */
function Greeting({
  vehicle, cta, trending, onPick,
}: {
  vehicle: VehicleHubProps['vehicle'];
  cta: string[];
  trending: TrendingChip[];
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="greet">
      <span className="greet-eyebrow">
        <span className="pulse-dot" /> AU7O FOR YOUR {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()}
      </span>
      <h1>
        {greetingFor()}.
        <span className="muted"> What's on your mind today?</span>
      </h1>

      {/* Suggested prompts derived from the maintenance opener — these are
          ALWAYS the user's own context (overdue items, mileage milestones).
          Trending shows BELOW so the user's own prompts read first. */}
      <div className="prompt-row">
        {cta.map((label, i) => (
          <button key={`cta-${i}`} className="chip" onClick={() => onPick(label)}>{label}</button>
        ))}
      </div>

      {/* Trending — only renders once we have data. Empty state keeps the
          UI from looking unfinished while the nightly cron warms up. */}
      {trending.length > 0 && (
        <>
          <div className="trending-label">Drivers like you also asked</div>
          <div className="prompt-row">
            {trending.map((t, i) => (
              <button key={`trend-${i}`} className="chip chip-trend" onClick={() => onPick(t.exampleQuestion)} title={`${t.count} drivers asked`}>
                {t.exampleQuestion}
              </button>
            ))}
          </div>
        </>
      )}
      <style jsx>{`
        .greet { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; max-width: 720px; }
        .greet-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #3B82F6;
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #3B82F6;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
        h1 { font-size: 38px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; }
        .muted { color: #94A3B8; }
        .prompt-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .chip {
          padding: 6px 11px; border-radius: 999px;
          background: #fff; border: 1px solid #E3DFD4;
          font-family: inherit; font-size: 12px; font-weight: 500; color: #0B1220;
          cursor: pointer;
        }
        .chip:hover { background: #EFEDE6; }
        .trending-label {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #64748B;
          margin-top: 16px; margin-bottom: -4px;
        }
        /* Trending chips read slightly different so the user knows the
           source — community-derived rather than their own context. */
        .chip-trend { background: #F1F5F9; border-color: #CBD5E1; color: #334155; }
        .chip-trend:hover { background: #E2E8F0; }
      `}</style>
    </div>
  );
}

function greetingFor() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "3 days ago" / "2h ago" / "just now" formatter for the recent-threads rail. */
function relativeWhen(iso: string): string {
  const then = new Date(iso).getTime();
  const ms = Date.now() - then;
  if (ms < 60_000) return 'just now';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─── Au7o reply bubble ─── */
function Au7oReply({
  content, attachments = [], driveHandoff = null, route, onFollowUp,
}: {
  content: string;
  attachments?: AttachableIssue[];
  driveHandoff?: { destination: string | null } | null;
  route?: RoutePreview;
  onFollowUp?: (prompt: string) => void;
}) {
  // Split out any "→ follow-up question" lines the AI emitted at the end
  // of the reply. Body shows the cleaned content; chips render below as
  // clickable suggestions for the next user turn.
  const { body, followUps } = extractFollowUps(content);
  // When we're rendering issue cards inline, strip any verbatim issue
  // titles from the prose so the user doesn't see "- Water Pump Failure"
  // listed as plain text immediately above the same title rendered as
  // a card. Keeps the bubble tight + the cards do the work the system
  // prompt is now asking the AI to delegate to them.
  const visibleBody = attachments.length > 0
    ? stripIssueTitleLines(body, attachments.map((a) => a.title))
    : body;
  return (
    <div className="row-au7o">
      <Image src="/og-image.png" alt="" width={32} height={32} className="avatar" />
      <div className="body">
        {visibleBody.trim().length > 0 && (
          <div className="bubble-au7o">{renderMarkdownLite(visibleBody)}</div>
        )}
        {attachments.length > 0 && <IssueAttachmentGroup issues={attachments} />}
        {/* Trip preview hierarchy: when we have a real Mapbox route
            attached to this turn, show the inline mini-map. Otherwise
            fall back to the simple Drive handoff button (for trips
            where intent was detected but the route fetch hasn't fired
            yet, or for the user's GPS denial case). */}
        {route ? (
          <MiniRoute
            route={route}
            onOpenDrive={() => {
              const dest = route.destination.placeName || (driveHandoff?.destination ?? '');
              const href = dest ? `/drive?to=${encodeURIComponent(dest)}` : '/drive';
              window.location.href = href;
            }}
          />
        ) : (
          driveHandoff && <DriveHandoff destination={driveHandoff.destination} />
        )}
        {followUps.length > 0 && onFollowUp && (
          <div className="followups">
            {followUps.map((q, i) => (
              <button key={i} className="chip-followup" onClick={() => onFollowUp(q)}>{q}</button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .row-au7o { display: flex; gap: 14px; align-items: flex-start; }
        :global(.row-au7o .avatar) {
          width: 32px; height: 32px; margin-top: 2px; border-radius: 8px; flex: 0 0 auto;
          object-fit: contain;
        }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; max-width: 720px; }
        :global(.bubble-au7o) {
          background: #fff;
          border: 1px solid #E3DFD4;
          border-radius: 18px 18px 18px 4px;
          padding: 14px 18px;
          font-size: 14.5px; line-height: 1.55;
          box-shadow: 0 1px 2px rgba(11,18,32,.06);
          white-space: pre-wrap;
        }
        :global(.bubble-au7o strong) { font-weight: 600; color: #0B1220; }
        :global(.bubble-au7o em) { font-style: italic; color: #64748B; }
        :global(.bubble-au7o ul) { padding-left: 0; margin: 8px 0; list-style: none; }
        :global(.bubble-au7o li) { padding: 2px 0; }
        /* Follow-up suggestion chips — moved from a nested <style jsx>
           block into the main one because styled-jsx doesn't allow more
           than one style block per component. */
        .followups { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .chip-followup {
          padding: 6px 11px; border-radius: 999px;
          background: #fff; border: 1px solid #E3DFD4;
          font-family: inherit; font-size: 12px; font-weight: 500; color: #0B1220;
          cursor: pointer;
        }
        .chip-followup:hover { background: #EFEDE6; }
      `}</style>
    </div>
  );
}

/**
 * Pull "→ follow-up question" lines out of the assistant's reply. The
 * system prompt instructs the model to emit suggested follow-ups on
 * their own lines at the very end, prefixed with "→ ". We strip them
 * from the rendered body so they don't show as awkward arrow text in
 * the bubble, then render them as clickable chips below.
 */
function extractFollowUps(text: string): { body: string; followUps: string[] } {
  if (!text) return { body: '', followUps: [] };
  const lines = text.split('\n');
  const followUps: string[] = [];
  // Walk lines from the end, peeling off arrow-prefixed lines until we
  // hit non-arrow content. Anything in front of that boundary is the body.
  let cutAt = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === '') continue; // blank lines between body + follow-ups are fine
    if (line.startsWith('→ ') || line.startsWith('-> ') || line.startsWith('→')) {
      const q = line.replace(/^(?:→|->)\s*/, '').trim();
      if (q.length > 0 && q.length < 120) {
        followUps.unshift(q);
        cutAt = i;
        continue;
      }
    }
    break;
  }
  const body = lines.slice(0, cutAt).join('\n').replace(/\s+$/, '');
  return { body, followUps: followUps.slice(0, 4) };
}

/**
 * Remove lines from the assistant body that are verbatim issue titles
 * (with optional bullet prefix and **bold** wrapping). The cards render
 * those titles below the bubble; keeping them in the prose causes
 * visual duplication. Preserves all other body content.
 *
 * Match is conservative — only strips a line when its trimmed content,
 * after removing list bullets and **bold** markers, exactly equals one
 * of the matched issue titles. Won't accidentally eat a sentence that
 * mentions an issue name in passing.
 */
function stripIssueTitleLines(body: string, attachedTitles: string[]): string {
  if (!body || attachedTitles.length === 0) return body;
  const titleSet = new Set(attachedTitles.map((t) => t.toLowerCase().trim()));
  const lines = body.split('\n');
  const kept: string[] = [];
  for (const line of lines) {
    const stripped = line
      .replace(/^\s*[-*]\s+/, '')   // bullets
      .replace(/\*\*(.+?)\*\*/g, '$1') // bold markers
      .trim()
      .toLowerCase();
    if (titleSet.has(stripped)) continue;
    kept.push(line);
  }
  // Collapse 3+ consecutive blank lines that result from removed items
  // back down to a single blank line so the bubble doesn't have weird gaps.
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Tiny markdown renderer for **bold**, _italic_, and `- ` list items.
 * Keeps the bundle small + safe (no HTML injection — we only emit known
 * elements). Real markdown library can come in v2 if we need links/code.
 */
function renderMarkdownLite(text: string) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    out.push(<ul key={`ul-${key}`}>{listBuffer.map((item, idx) => <li key={idx}>{inlineFormat(item)}</li>)}</ul>);
    listBuffer = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ')) { listBuffer.push(line.slice(2)); continue; }
    flushList(String(i));
    if (line.trim() === '') out.push(<div key={`br-${i}`} style={{ height: 8 }} />);
    else out.push(<div key={`p-${i}`}>{inlineFormat(line)}</div>);
  }
  flushList('end');
  return out;
}
function inlineFormat(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let buffer = '';
  let i = 0;
  let key = 0;
  while (i < s.length) {
    if (s.slice(i, i + 2) === '**') {
      const end = s.indexOf('**', i + 2);
      if (end === -1) { buffer += s[i]; i++; continue; }
      if (buffer) { parts.push(buffer); buffer = ''; }
      parts.push(<strong key={`b-${key++}`}>{s.slice(i + 2, end)}</strong>);
      i = end + 2;
    } else if (s[i] === '_') {
      const end = s.indexOf('_', i + 1);
      if (end === -1) { buffer += s[i]; i++; continue; }
      if (buffer) { parts.push(buffer); buffer = ''; }
      parts.push(<em key={`i-${key++}`}>{s.slice(i + 1, end)}</em>);
      i = end + 1;
    } else {
      buffer += s[i];
      i++;
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

/* ─── Composer ─── */
const Composer = ({
  ref, value, onChange, onSend, pending, isAuthed,
}: {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  pending: boolean;
  isAuthed: boolean;
}) => {
  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={ref}
          rows={1}
          placeholder="Ask anything about your car — symptoms, parts, recalls, or plan a trip."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={pending}
        />
        <button className="icon-square icon-send" onClick={onSend} disabled={pending} title="Send">
          {pending ? '…' : '↑'}
        </button>
      </div>
      <div className="composer-meta">
        <span>{isAuthed ? "Au7o knows your vehicle context" : "Sign in to save context across sessions"} · responses may need verifying with a mechanic</span>
        <span className="keys"><span>↵ to send · ⇧↵ for new line</span></span>
      </div>

      <style jsx>{`
        .composer-wrap {
          padding: 18px 56px 28px;
          border-top: 1px solid #E3DFD4;
          background: rgba(255,255,255,0.6); backdrop-filter: blur(20px);
          flex: 0 0 auto;
        }
        .composer {
          background: #fff; border: 1px solid #E3DFD4; border-radius: 18px;
          box-shadow: 0 6px 16px rgba(11,18,32,.08);
          padding: 10px 12px 10px 18px;
          display: flex; align-items: flex-end; gap: 10px;
        }
        textarea {
          flex: 1; border: 0; outline: 0; resize: none;
          font-family: inherit; font-size: 14.5px; line-height: 1.5; color: #0B1220;
          padding: 8px 0;
          background: transparent;
          max-height: 120px;
        }
        .icon-square {
          width: 36px; height: 36px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex: 0 0 auto;
          border: 0; background: #0B1220; color: #fff; font-size: 18px;
        }
        .icon-send:hover:not(:disabled) { background: #19223A; }
        .icon-square:disabled { opacity: 0.5; cursor: not-allowed; }
        .composer-meta {
          display: flex; justify-content: space-between; margin-top: 8px; padding: 0 6px;
          font-size: 11px; color: #64748B;
        }
        .keys { display: flex; gap: 14px; }
      `}</style>
    </div>
  );
};

/**
 * Match assistant-message text against the user's vehicle's known-issues
 * library and return up to 4 matched cards. Cheap substring match — if
 * the model named an issue word-for-word (which it now does because the
 * system prompt feeds it our exact titles), it gets attached. v2 swap-in
 * is to use Anthropic tool_use so the model itself emits issue ids.
 *
 * Dedupes by issue id, caps at 4 attachments per reply so the bubble
 * stays scannable. Whichever match has the longest title (more
 * specific match) wins ranking.
 */
function matchAttachments(text: string, available: AttachableIssue[]): AttachableIssue[] {
  if (!text || available.length === 0) return [];
  const lower = text.toLowerCase();
  const matches = available.filter((iss) => {
    const title = iss.title.toLowerCase();
    if (title.length < 6) return false; // skip very short titles to avoid false positives
    return lower.includes(title);
  });
  matches.sort((a, b) => b.title.length - a.title.length);
  return matches.slice(0, 4);
}

/**
 * Detect when the assistant's reply is a trip-planning recommendation,
 * triggered by the convention phrases the system prompt asks Claude to
 * use ("open in Drive" / "plan it in Drive"). Cheap regex match, no
 * extra LLM calls.
 *
 * Tries to extract a destination if the reply mentions "to <Place>" —
 * good enough for v1. Returns { destination: null } when intent is
 * detected but no destination can be parsed (still useful — the card
 * just becomes a generic Drive handoff).
 */
/**
 * Cheap heuristic: does the user's message look like a trip / driving /
 * route question? Used to fire the inline route preview in parallel with
 * the chat stream. False positives are fine — the route endpoint will
 * return an error tile gracefully if the user wasn't actually asking
 * for a drive ("How long is a drive belt?" vs "How long is the drive
 * to Austin?"). False NEGATIVES are the bug — we'd silently skip the
 * map. So lean permissive.
 */
function looksLikeTripQuestion(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  // Direct trip-planning verbs/phrases.
  if (/(?:plan|plot|map|chart|find).+(?:trip|route|drive|drives|driving|destination)/.test(lower)) return true;
  if (/\b(?:road trip|scenic drive|cruise|joyride|sunday drive|day trip|weekend (?:drive|trip))\b/.test(lower)) return true;
  // "Take me to X", "Drive me to X", "Get me to X", "Route me to X"
  if (/\b(?:take|drive|get|route|head|navigate|bring)\s+(?:me\s+)?(?:to|towards|over to)\s+\S/.test(lower)) return true;
  // "Where can I drive", "where should I go", "best drive near"
  if (/\bwhere\s+(?:can|should|to)\s+(?:i|we)\s+(?:drive|go)\b/.test(lower)) return true;
  if (/\bbest\s+(?:drive|route|road)\b/.test(lower)) return true;
  // "How long is the drive to X" / "fastest way to X"
  if (/\b(?:how (?:long|far)|fastest way|shortest route)\b.+\bto\s+\S/.test(lower)) return true;
  return false;
}

function detectDriveIntent(text: string): { destination: string | null } | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hasIntent = /open in drive|plan it in drive|plot (it|this) in drive|outline (it|this) in drive/.test(lower);
  if (!hasIntent) return null;
  // Naive destination extraction: "trip to <X>" / "drive to <X>" / "head to <X>".
  // Captures up to the first sentence-ending punctuation.
  const m = /(?:trip|drive|head|cruise|route)\s+(?:up|down|out|over)?\s*to\s+([A-Z][^.!?,;\n]{2,60})/.exec(text);
  const destination = m ? m[1].trim() : null;
  return { destination };
}

/* ─── Drive handoff card (rendered inline beneath a trip-planning reply) ─── */
function DriveHandoff({ destination }: { destination: string | null }) {
  // Pre-fill the destination via a query param so /drive can pick it up
  // and start routing immediately. Falls back to a plain /drive deeplink
  // when no destination was extractable.
  const href = destination
    ? `/drive?to=${encodeURIComponent(destination)}`
    : '/drive';
  return (
    <Link href={href} className="drive-handoff">
      <div className="dh-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>
        </svg>
      </div>
      <div className="dh-body">
        <div className="dh-title">
          {destination ? `Plan the route to ${destination}` : 'Plan this in Drive'}
        </div>
        <div className="dh-sub">Open Au7o Drive — voice navigation, vehicle-aware traffic + fuel</div>
      </div>
      <span className="dh-cta">Open Drive →</span>
      <style jsx>{`
        .drive-handoff {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(180deg, #fff, #FAF8F2);
          border: 1px solid #E3DFD4; border-radius: 12px;
          padding: 12px 14px;
          text-decoration: none; color: #0B1220;
          box-shadow: 0 1px 2px rgba(11,18,32,.06);
        }
        .drive-handoff:hover { background: #FAF8F2; }
        .dh-icon {
          width: 36px; height: 36px; flex: 0 0 36px;
          background: #EFF6FF; color: #3B82F6;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .dh-body { flex: 1; min-width: 0; }
        .dh-title { font-size: 13.5px; font-weight: 600; line-height: 1.3; }
        .dh-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
        .dh-cta {
          font-size: 11px; font-weight: 600; color: #3B82F6;
          white-space: nowrap;
        }
      `}</style>
    </Link>
  );
}

/* ─── Issue attachment GROUP (stacked-card style from the prototype) ───
 * Switched from styled-jsx to inline styles + a tiny Tailwind hover
 * helper. Reason: previous styled-jsx layout looked "smashed left" in
 * production because the styled-jsx + next/link combo was occasionally
 * dropping the scoped flex rules — the chevron stayed inline, the
 * severity dot lost its width, and the body text didn't push the
 * chevron right. Inline `style` attributes have the highest specificity
 * and cannot be defeated by any of the above. */
function IssueAttachmentGroup({ issues }: { issues: AttachableIssue[] }) {
  // Use the first issue's slug-derivable URL as the "See all" target.
  // All matched issues for one reply belong to the same vehicle so this
  // is safe — they share the same /known-issues/{make-model} page.
  const seeAllHref = (() => {
    if (issues.length === 0) return '/known-issues';
    return issues[0].knownIssuesUrl.split('#')[0];
  })();
  const sevColor = (sev: string) =>
    sev === 'critical' || sev === 'high' ? '#EF4444'
    : sev === 'medium' ? '#F59E0B'
    : '#94A3B8';
  // Tailwind hover via group-* doesn't help here because our parent
  // already participates in styled-jsx; using a tiny class that we
  // attach a global hover rule for is the cleanest path.
  const rowBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#0B1220',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  };
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E3DFD4',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(11,18,32,.06)',
    }}>
      {/* Header strip: "4 known issues · filtered to your trim · See all →" */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E3DFD4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto' }}>
            <path d="M12 9v4M12 17h.01"/>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
          </svg>
          <span style={{ fontWeight: 600 }}>
            {issues.length} known issue{issues.length === 1 ? '' : 's'}
          </span>
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>
            · filtered to your trim
          </span>
        </div>
        <Link
          href={seeAllHref}
          style={{
            background: 'transparent',
            border: 0,
            color: '#64748B',
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          See all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6"/>
          </svg>
        </Link>
      </div>

      {/* Rows. Hover via JS rather than CSS so we don't depend on any
          styled-jsx scoping interactions with next/link. */}
      {issues.map((iss, idx) => (
        <IssueAttachmentRow
          key={iss.id}
          issue={iss}
          isLast={idx === issues.length - 1}
          baseStyle={rowBase}
          sevColor={sevColor(iss.severity)}
        />
      ))}
    </div>
  );
}

/**
 * One row in the IssueAttachmentGroup. Pulled into its own component so
 * we can use a useState-based hover style (the only way to get reliable
 * hover on a Next.js <Link> when our parent is using styled-jsx).
 */
function IssueAttachmentRow({
  issue, isLast, baseStyle, sevColor,
}: {
  issue: AttachableIssue;
  isLast: boolean;
  baseStyle: React.CSSProperties;
  sevColor: string;
}) {
  const [hover, setHover] = useState(false);
  const costStr = issue.estimatedCost
    ? `$${issue.estimatedCost.low.toLocaleString()}–${issue.estimatedCost.high.toLocaleString()}`
    : null;
  return (
    <Link
      href={issue.knownIssuesUrl}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...baseStyle,
        background: hover ? '#FAF8F2' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid #E3DFD4',
      }}
    >
      {/* Severity dot — fixed width + flex-shrink:0 keeps it round. */}
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: sevColor,
          flex: '0 0 10px',
        }}
      />

      {/* Body — flex: 1 here is what pushes the chevron to the far right. */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5,
          fontWeight: 500,
          lineHeight: 1.3,
          color: '#0B1220',
          // Truncate single-line titles on tight widths.
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {issue.title}
        </div>
        <div style={{
          fontSize: 11.5,
          color: '#64748B',
          marginTop: 2,
          display: 'flex',
          gap: 6,
          alignItems: 'baseline',
        }}>
          {costStr && (
            <span style={{
              fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
              fontFeatureSettings: '"tnum" 1',
            }}>{costStr}</span>
          )}
          {costStr && <span style={{ color: '#CBD5E1' }}>·</span>}
          <span style={{ textTransform: 'capitalize' }}>{issue.severity}</span>
        </div>
      </div>

      {/* Chevron — flex-shrink:0 + auto margin-left so it always docks right. */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94A3B8"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flex: '0 0 14px' }}
      >
        <path d="m9 6 6 6-6 6"/>
      </svg>
    </Link>
  );
}

/* ─── Issue attachment card (rendered inline beneath an Au7o reply) ─── */
function IssueAttachment({ issue }: { issue: AttachableIssue }) {
  const sevColor =
    issue.severity === 'critical' || issue.severity === 'high'
      ? '#EF4444'
      : issue.severity === 'medium'
        ? '#F59E0B'
        : '#94A3B8';
  return (
    <Link href={issue.knownIssuesUrl} className="issue-attach">
      <div className="issue-bar" style={{ background: sevColor }} />
      <div className="issue-body">
        <div className="issue-title">{issue.title}</div>
        <div className="issue-sub">
          {issue.category} · {issue.severity}
          {issue.estimatedCost && (
            <> · <span className="mono">${issue.estimatedCost.low.toLocaleString()}–${issue.estimatedCost.high.toLocaleString()}</span></>
          )}
        </div>
      </div>
      <span className="issue-cta">Read more →</span>
      <style jsx>{`
        .issue-attach {
          display: flex; align-items: stretch; gap: 0;
          background: #fff; border: 1px solid #E3DFD4; border-radius: 12px;
          text-decoration: none; color: #0B1220;
          overflow: hidden; box-shadow: 0 1px 2px rgba(11,18,32,.06);
        }
        .issue-attach:hover { background: #FAF8F2; }
        .issue-bar { width: 4px; flex: 0 0 4px; }
        .issue-body { flex: 1; padding: 10px 14px; min-width: 0; }
        .issue-title { font-size: 13px; font-weight: 600; line-height: 1.3; }
        .issue-sub { font-size: 11px; color: #64748B; margin-top: 2px; text-transform: capitalize; }
        .mono { font-family: var(--font-geist-mono, ui-monospace, monospace); }
        .issue-cta {
          font-size: 11px; font-weight: 600; color: #3B82F6;
          padding: 10px 14px; align-self: center; white-space: nowrap;
        }
      `}</style>
    </Link>
  );
}

/**
 * Browser geolocation with sessionStorage cache. First trip-intent call
 * in a session triggers the OS permission prompt; subsequent calls in
 * the same session re-use the cached coords (15-min TTL — short enough
 * that long sessions still get reasonably-fresh GPS, long enough that
 * back-to-back trip questions don't double-prompt).
 *
 * Throws on denial / unsupported / timeout so the caller can surface a
 * helpful error in the route preview.
 */
const GEO_CACHE_KEY = 'au7o-hub-gps';
const GEO_CACHE_TTL_MS = 15 * 60_000;
function getCachedGeolocation(): Promise<{ lng: number; lat: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported on this device'));
      return;
    }
    try {
      const cached = sessionStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { lng: number; lat: number; t: number };
        if (Date.now() - parsed.t < GEO_CACHE_TTL_MS) {
          resolve({ lng: parsed.lng, lat: parsed.lat });
          return;
        }
      }
    } catch { /* fall through to fresh fetch */ }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ ...coords, t: Date.now() })); } catch { /* ignore */ }
        resolve(coords);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject(new Error('Location permission denied — share your location to plot a route'));
        else if (err.code === err.POSITION_UNAVAILABLE) reject(new Error('Could not detect your location right now'));
        else reject(new Error('Location request timed out'));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/**
 * Inline route preview — projects the Mapbox geometry into a small SVG
 * with a paper-style background, route line, and origin/destination
 * pins. Renders a skeleton loader while loading=true, an error tile
 * with a retry/Drive-handoff CTA on error.
 */
function MiniRoute({ route, onOpenDrive }: { route: RoutePreview; onOpenDrive: () => void }) {
  if (route.loading) {
    return (
      <div className="mini-route-loading">
        <div className="skeleton" />
        <div className="loading-text">Plotting route to {route.destination.placeName}…</div>
        <style jsx>{`
          .mini-route-loading {
            background: #F2EEE3; border: 1px solid #E3DFD4; border-radius: 16px;
            overflow: hidden; height: 220px; position: relative;
            display: flex; align-items: center; justify-content: center;
          }
          .skeleton {
            position: absolute; inset: 0;
            background: linear-gradient(90deg, transparent, rgba(11,18,32,0.04), transparent);
            background-size: 200% 100%;
            animation: shimmer 1.4s ease-in-out infinite;
          }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .loading-text { position: relative; z-index: 1; font-size: 13px; color: #64748B; }
        `}</style>
      </div>
    );
  }

  // No route + no error = the routing service asked for clarification
  // (e.g., user said "plan a road trip" before the prompt-tuning landed,
  // or genuinely needs more info). The AI's chat reply already tells
  // the user what's missing, so we render NOTHING here rather than
  // duplicating that with an error tile.
  if (!route.error && route.geometry.length < 2) {
    return null;
  }

  if (route.error || route.geometry.length < 2) {
    return (
      <div className="mini-route-error">
        <div className="err-msg">
          {route.error || `Couldn't plot a route to ${route.destination.placeName}.`}
        </div>
        <button className="err-cta" onClick={onOpenDrive}>Open in Drive →</button>
        <style jsx>{`
          .mini-route-error {
            background: #FFF7E8; border: 1px solid #F5E5BD; border-radius: 12px;
            padding: 14px; display: flex; align-items: center; gap: 10px;
            font-size: 13px; color: #92400E;
          }
          .err-msg { flex: 1; }
          .err-cta {
            background: #0B1220; color: #fff; border: 0;
            padding: 6px 12px; border-radius: 8px;
            font: 600 12px var(--font-geist-sans, system-ui);
            cursor: pointer; white-space: nowrap;
          }
        `}</style>
      </div>
    );
  }

  // Compute SVG viewBox bounds from geometry. Lng/lat lives in geographic
  // space; we project linearly into a 720x220 box (matches the prototype
  // mini-map). Adequate for at-a-glance preview at this scale; not a
  // proper Mercator projection.
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of route.geometry) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  // Pad bounds by 8% so pins at the edges don't get clipped.
  const lngPad = (maxLng - minLng) * 0.08 || 0.01;
  const latPad = (maxLat - minLat) * 0.08 || 0.01;
  minLng -= lngPad; maxLng += lngPad; minLat -= latPad; maxLat += latPad;
  const W = 720, H = 220;
  const project = (lng: number, lat: number): [number, number] => [
    ((lng - minLng) / (maxLng - minLng)) * W,
    H - ((lat - minLat) / (maxLat - minLat)) * H,
  ];
  // Sample down to ~120 points for a smoother SVG render; full geometry
  // can be 1000+ vertices for a long trip.
  const stride = Math.max(1, Math.floor(route.geometry.length / 120));
  const pathD = route.geometry
    .filter((_, i) => i % stride === 0)
    .map((coord, i) => {
      const [x, y] = project(coord[0], coord[1]);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const [originX, originY] = project(route.origin.lng, route.origin.lat);
  const [destX, destY] = project(route.destination.lng, route.destination.lat);

  // Strip postal codes / country names from the destination label so the
  // pill shows a friendly city-only string.  "Heilbronn, Germany" stays
  // as-is, but "Heilbronn, 74072 Heilbronn, Germany" collapses to
  // "Heilbronn".  Cheap prefix-extract; falls back to the raw string.
  const friendlyDest = (() => {
    const raw = route.destination.placeName || 'Destination';
    const head = raw.split(',')[0].trim();
    return head || raw;
  })();

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E3DFD4',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(11,18,32,.06), 0 1px 1px rgba(11,18,32,.04)',
    }}>
      {/* Map well — paper-style background, decorative ground layers
          (water + parks + road grid), then the real route line + pins. */}
      <div style={{ position: 'relative', height: 220 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: 'block' }}
        >
          <defs>
            {/* Water gradient — same as prototype. */}
            <linearGradient id="mr-water" x1="0" x2="1">
              <stop offset="0" stopColor="#C9DCE6" />
              <stop offset="1" stopColor="#B5CCD9" />
            </linearGradient>
          </defs>
          {/* Tan paper base. */}
          <rect width={W} height={H} fill="#F2EEE3" />
          {/* Decorative water swath — adds depth + matches prototype.
              Doesn't represent real water; it's purely a visual ground
              layer so the map well doesn't look like a flat tile. */}
          <path
            d="M-20 130 C 100 110 220 150 320 130 C 420 110 540 150 740 130 L 740 220 L -20 220 Z"
            fill="url(#mr-water)" opacity="0.55"
          />
          {/* Decorative park rectangles. */}
          <rect x="40" y="30" width="80" height="50" rx="4" fill="#D5E2C9" opacity="0.7" />
          <rect x="180" y="20" width="60" height="40" rx="4" fill="#D5E2C9" opacity="0.7" />
          <rect x="420" y="40" width="100" height="60" rx="4" fill="#D5E2C9" opacity="0.7" />
          <rect x="600" y="20" width="80" height="50" rx="4" fill="#D5E2C9" opacity="0.7" />
          {/* Road grid (white lines under the route). */}
          <path d="M0 100 L720 90" stroke="#FFFFFF" strokeWidth="6" opacity="0.7" />
          <path d="M0 160 L720 165" stroke="#FFFFFF" strokeWidth="4" opacity="0.7" />
          <path d="M180 0 L200 220" stroke="#FFFFFF" strokeWidth="4" opacity="0.7" />
          <path d="M540 0 L560 220" stroke="#FFFFFF" strokeWidth="4" opacity="0.7" />
          {/* Real route line — white halo + blue stroke for that Mapbox feel. */}
          <path d={pathD} stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Origin pin — blue dot in white halo. */}
          <circle cx={originX} cy={originY} r="9" fill="#fff" />
          <circle cx={originX} cy={originY} r="5" fill="#3B82F6" />
          {/* Destination pin — dark with white center. */}
          <circle cx={destX} cy={destY} r="11" fill="#0B1220" />
          <circle cx={destX} cy={destY} r="5" fill="#fff" />
        </svg>

        {/* Top-left destination chip — matches the prototype's
            "📍 Healdsburg" label overlay. */}
        <div style={{
          position: 'absolute', top: 12, left: 14,
          display: 'flex', gap: 6,
        }}>
          <span style={{
            background: '#fff',
            border: '1px solid #E3DFD4',
            borderRadius: 999,
            padding: '5px 10px',
            fontSize: 11.5,
            fontWeight: 500,
            color: '#0B1220',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 2px rgba(11,18,32,.06)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {friendlyDest}
          </span>
        </div>

        {/* Bottom-right CTA — dark "Open in Drive" pill. */}
        <button
          onClick={onOpenDrive}
          style={{
            position: 'absolute', bottom: 12, right: 12,
            background: '#0B1220', color: '#fff', border: 0,
            padding: '6px 12px', borderRadius: 999,
            font: '600 11.5px var(--font-geist-sans, system-ui, sans-serif)',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: '0 1px 2px rgba(11,18,32,.18)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
          </svg>
          Open in Drive
        </button>
      </div>

      {/* Footer strip — miles · minutes · destination · "Plotted by Au7o" byline. */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12.5, color: '#334155',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
            <path d="M9 4v14M15 6v14" />
          </svg>
          <strong style={{
            fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
            fontFeatureSettings: '"tnum" 1',
            fontWeight: 600,
            color: '#0B1220',
          }}>{route.miles.toFixed(0)} mi</strong>
        </span>
        <span style={{ color: '#CBD5E1' }}>·</span>
        <span style={{
          fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
          fontFeatureSettings: '"tnum" 1',
        }}>{Math.round(route.minutes)} min</span>
        <span style={{ color: '#CBD5E1' }}>·</span>
        <span
          title={route.destination.placeName}
          style={{
            color: '#64748B', fontSize: 11.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0,
          }}
        >{friendlyDest}</span>
        {/* Right-docked attribution. */}
        <span style={{
          marginLeft: 'auto',
          color: '#64748B', fontSize: 11,
          whiteSpace: 'nowrap',
        }}>Plotted by Au7o · live traffic</span>
      </div>
    </div>
  );
}

/* ─── Generic muscle-coupe silhouette ─── */
function CoupeSilhouette() {
  return (
    <svg viewBox="0 0 320 100" width="160" height="50">
      <ellipse cx="160" cy="92" rx="138" ry="3.5" fill="rgba(11,18,32,0.12)"/>
      <path
        d="M14,76 C18,66 30,62 50,60
           C58,46 80,38 116,36
           L160,30 C198,28 230,32 260,46
           L292,52 C302,54 308,58 308,68
           L308,80 C308,84 304,86 298,86
           L268,86 A22,22 0 0 0 224,86
           L114,86 A22,22 0 0 0 70,86
           L24,86 C16,86 12,82 12,80 Z"
        fill="#1a1a1a"/>
      <path d="M112,40 L160,32 C190,30 216,34 234,42 L234,58 L108,58 Z" fill="#3B82F6" opacity="0.18"/>
      <circle cx="92" cy="86" r="16" fill="#0B1220"/><circle cx="92" cy="86" r="7" fill="#3a3f4d"/>
      <circle cx="246" cy="86" r="16" fill="#0B1220"/><circle cx="246" cy="86" r="7" fill="#3a3f4d"/>
    </svg>
  );
}
