'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MaintenanceSuggestion, ScheduleData, ScheduleService, ScheduleServiceStatus } from '@/lib/maintenance-suggestions';
import type { RecentThread, TrendingChip, AttachableIssue } from '@/lib/hub-data';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { VehicleSchedule } from '@/lib/owners-manual-schedule';
// OwnersManualSchedule is no longer rendered as its own card — its data
// lives in the `ownersManualSchedule` prop for the integration that
// will feed the existing MaintenanceSchedule timeline card.
// import { OwnersManualSchedule } from '@/components/vehicle/OwnersManualSchedule';
import { useAnonymousLimit } from '@/hooks/useAnonymousLimit';
import { UpgradePrompt, RemainingChatsIndicator } from '@/components/chat/UpgradePrompt';
import { MileageEditor } from '@/components/vehicle/MileageEditor';
import { VehicleHero } from '@/components/vehicle/VehicleHero';

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
  /** Authed user identity for the rail footer. Null when anonymous. */
  user: {
    name: string;
    /** ISO date the User row was created. Drives the "SUBSCRIBER · X MO" tag. */
    joinedAt: string;
    isSubscriber: boolean;
  } | null;
  /** Rich maintenance schedule data for the hero attachment in Au7o's first
   *  reply. Null for anonymous viewers or when there's no logged service
   *  history + no upcoming services to plot. */
  schedule: ScheduleData | null;
  /** Owner's-manual-sourced reference schedule for this vehicle. Distinct
   *  from `schedule` (which is dynamic per-user). Rendered as a static
   *  reference section after the chat opener when a verified entry exists
   *  for this YMMT. Available to ALL viewers (no auth required). */
  ownersManualSchedule?: VehicleSchedule | null;
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
  /** Rich maintenance schedule attachment — only on the auto-opener message. */
  schedule?: ScheduleData;
  /** Top-N Known Issues card for this vehicle — vehicle-level context,
   *  attached to the first assistant message so it stays visible across
   *  Recent-thread switches (re-applied in loadSession). Same data
   *  source as the mobile MobileIssuesCard but works on desktop too
   *  since the card itself uses inline styles. */
  issues?: AttachableIssue[];
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
  user,
  schedule,
  ownersManualSchedule,
}: VehicleHubProps) {
  // Seed the conversation with the pre-rendered opener so the page feels
  // alive on first paint. Subsequent turns get appended here and (in v2)
  // sent to /api/chat for the real reply.
  // Same slice rule as the mobile shell: 4 issues for signed-in users
  // (more vertical room + we know it's their car), 2 for anonymous.
  const openerIssues = attachableIssues.slice(0, isAuthed ? 4 : 2);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: opener.text, timestamp: Date.now(),
      schedule: schedule ?? undefined,
      issues: openerIssues.length > 0 ? openerIssues : undefined },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  // Weekly chat allowance — anonymous users get 5 chats/week (tracked in
  // localStorage); authed users are treated as unlimited by the hook.
  // When the limit is exhausted, send() short-circuits and shows the
  // upgrade prompt inline above the composer.
  const { canChat, consumeChat, remaining, resetDate, isAuthenticated } = useAnonymousLimit();
  const [showUpgrade, setShowUpgrade] = useState(false);
  // Mobile-only drawer with the recent-threads list. The desktop rail
  // shows it inline; under 900px the rail is hidden, so a hamburger in
  // the top bar opens this slide-in panel instead.
  const [threadsOpen, setThreadsOpen] = useState(false);
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

  // Load a previous ChatSession when the user clicks a Recent thread.
  // Replaces the visible conversation with that session's full history
  // and re-points sessionIdRef so the next turn the user sends gets
  // appended to the same row server-side (continuity preserved). Auth-
  // scoped on the server — the endpoint 404s if the session isn't
  // owned by the current user. Also closes the mobile drawer.
  const loadSession = useCallback(async (threadId: string) => {
    if (!threadId || pending) return;
    try {
      const res = await fetch(`/api/hub-chat/session/${encodeURIComponent(threadId)}`);
      if (!res.ok) return;
      const data = await res.json() as { sessionId: string; messages: Array<{ role: 'user' | 'assistant'; content: string }> };
      if (!Array.isArray(data.messages) || data.messages.length === 0) return;
      // Re-attach vehicle-level context cards (Maintenance Schedule
      // + Known Issues) to the first assistant message in the restored
      // history. These are per-vehicle, not per-conversation — they
      // should follow you between threads. DB rows only persist
      // role+content, so without this both rich cards vanish on
      // thread-switch.
      let attached = false;
      const restored = data.messages.map((m) => {
        const base = { role: m.role, content: m.content, timestamp: Date.now() };
        if (!attached && m.role === 'assistant') {
          attached = true;
          return {
            ...base,
            ...(schedule ? { schedule } : {}),
            ...(openerIssues.length > 0 ? { issues: openerIssues } : {}),
          };
        }
        return base;
      });
      setMessages(restored);
      sessionIdRef.current = data.sessionId || threadId;
      setThreadsOpen(false);
    } catch (err) {
      console.warn('[hub] failed to load session', err);
    }
  }, [pending, schedule, openerIssues]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    // Quota gate — anonymous users get 5 chats/week. consumeChat()
    // returns false when the allowance is exhausted; in that case
    // we surface the upgrade prompt instead of firing /api/hub-chat.
    // Authed users always return true (treated as unlimited at the
    // hook level today — premium-tier limits are a future addition).
    if (!consumeChat()) {
      setShowUpgrade(true);
      return;
    }

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
        const errBody = await res.json().catch(() => ({} as { message?: string; gated?: boolean; error?: string }));
        // Server-side weekly quota hit (error: 'quota_exceeded') — open
        // the same upgrade modal we use for the client-side counter,
        // and pop the empty assistant placeholder so the user doesn't
        // see a stuck "…" bubble.
        if (res.status === 429 && errBody.error === 'quota_exceeded') {
          setShowUpgrade(true);
          setMessages((prev) => {
            const idx = streamingIdxRef.current;
            if (idx == null) return prev;
            const copy = [...prev];
            copy.splice(idx, 1);
            return copy;
          });
          setPending(false);
          return;
        }
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
    <>
      {/* Chat-limit modal — fires when anonymous users have used their
          weekly 5-chat allowance. Closes on backdrop click. */}
      {showUpgrade && !isAuthenticated && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(11,18,32,0.55)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpgrade(false); }}
        >
          <div style={{ maxWidth: 480, width: '100%', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowUpgrade(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: -36, right: 0,
                background: 'rgba(255,255,255,0.95)',
                border: 'none', borderRadius: '50%',
                width: 28, height: 28, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0B1220', fontSize: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >×</button>
            <UpgradePrompt variant="full" resetDate={resetDate} />
          </div>
        </div>
      )}
      <div className="hub-stage hub-desktop">
        <VehicleRail
          vehicle={vehicle}
          currentMileage={currentMileage}
          counts={counts}
          recentThreads={recentThreads}
          maintenanceSuggestions={maintenanceSuggestions}
          user={user}
          slug={slug}
          onSelectThread={loadSession}
        />

        <MobileThreadsDrawer
          open={threadsOpen}
          onClose={() => setThreadsOpen(false)}
          vehicle={vehicle}
          currentMileage={currentMileage}
          recentThreads={recentThreads}
          user={user}
          slug={slug}
          onSelectThread={loadSession}
        />

        <section className="hub-col">
          <TopBar vehicle={vehicle} user={user} onOpenThreads={() => setThreadsOpen(true)} />

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

            {/* OwnersManualSchedule card removed — the rich data (fluid
                specs, intervals, capacities, owner alerts from the
                owner's manual) should feed the existing MaintenanceSchedule
                timeline card (4-stat strip + mileage timeline + service
                rows below), NOT render as a second card. The integration
                that pipes `ownersManualSchedule` into the ScheduleData
                that powers MaintenanceSchedule is a follow-up — see TODO
                in /api/hub-chat or lib/maintenance-suggestions. Prop is
                still passed through so the integration can plug in
                without re-touching the component tree. */}

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
                    schedule={m.schedule}
                    issues={m.issues}
                    slug={slug}
                    isAuthed={isAuthed}
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
      </div>

      <MobileHub
        vehicle={vehicle}
        slug={slug}
        isAuthed={isAuthed}
        currentMileage={currentMileage}
        opener={opener}
        schedule={schedule}
        attachableIssues={attachableIssues}
        maintenanceSuggestions={maintenanceSuggestions}
        trending={trending}
        recentThreads={recentThreads}
        user={user}
        onSelectThread={loadSession}
        messages={messages}
        input={input}
        pending={pending}
        threadsOpen={threadsOpen}
        onChangeInput={setInput}
        onSend={(text) => send(text)}
        onOpenThreads={() => setThreadsOpen(true)}
        onCloseThreads={() => setThreadsOpen(false)}
      />

      <style jsx>{`
        /* The desktop and mobile shells coexist; CSS toggles which one is
           visible. This keeps hydration deterministic (no window-width
           probes) and lets the mobile shell get its own dedicated layout
           rather than a media-query reskin of desktop. */
        .hub-desktop { display: flex; }
        @media (max-width: 900px) {
          .hub-desktop { display: none; }
        }
        .hub-stage {
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
    </>
  );
}

/* ─── Mobile hub ─── Dedicated phone-form layout ported from the design
   bundle's MobileA3Hub. This is NOT a media-query reskin of the desktop —
   it's a separate component with its own header (vehicle pill + avatar),
   vertical maintenance timeline, inline known-issues card, stacked
   suggestion chips, and bottom tab bar. The desktop and mobile shells
   are rendered side-by-side; CSS toggles which one is visible based on
   viewport width. */
function MobileHub({
  vehicle, slug, isAuthed, currentMileage, opener, schedule, attachableIssues,
  maintenanceSuggestions, recentThreads, user,
  messages, input, pending, threadsOpen,
  onChangeInput, onSend, onOpenThreads, onCloseThreads, onSelectThread,
}: {
  vehicle: VehicleHubProps['vehicle'];
  slug: string;
  isAuthed: boolean;
  currentMileage: number | null;
  opener: VehicleHubProps['opener'];
  schedule: ScheduleData | null;
  attachableIssues: AttachableIssue[];
  maintenanceSuggestions: MaintenanceSuggestion[];
  trending: TrendingChip[];
  recentThreads: RecentThread[];
  user: VehicleHubProps['user'];
  messages: Message[];
  input: string;
  pending: boolean;
  threadsOpen: boolean;
  onChangeInput: (v: string) => void;
  onSend: (text: string) => void;
  onOpenThreads: () => void;
  onCloseThreads: () => void;
  onSelectThread?: (threadId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // Tap-to-expand for the greeting body. Starts collapsed (faded behind
  // the COMMON ISSUES card); tap reveals the full opener text.
  const [greetExpanded, setGreetExpanded] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  // Anonymous chat allowance — surface the remaining-chats indicator
  // and disable the composer when exhausted. Modal lives at the top-
  // level VehicleHub; this hook call just reads the same localStorage
  // counter for inline UI.
  const { remaining } = useAnonymousLimit();

  // Vehicle initial for the avatar disc — fall back to make's first letter
  // when the model leads with a digit (e.g. Chrysler "300", BMW "3 Series",
  // RAM "1500") so the disc never reads as a number, which looks broken.
  const vehInitial = (() => {
    const modelChar = (vehicle.model || '').trim().charAt(0).toUpperCase();
    const makeChar = (vehicle.make || '').trim().charAt(0).toUpperCase();
    if (!modelChar) return makeChar || '·';
    return /[A-Z]/.test(modelChar) ? modelChar : (makeChar || modelChar);
  })();
  const userInitialsTxt = user ? userInitials(user.name) : '';

  // Derived greeting headline. Two paths matching the design bundle:
  //   • A3 (signed-in): pressing-maintenance-state-driven headline + AI opener
  //   • A2 (anonymous): time-of-day headline + opener as soft tease
  const top = maintenanceSuggestions[0];
  const greeting = (() => {
    if (!isAuthed) {
      return { line1: greetingFor() + '.', line2: "What's on your mind today?" };
    }
    if (!top) {
      return { line1: greetingFor() + (user ? `, ${user.name.split(' ')[0]}.` : '.'), line2: "What's on your mind today?" };
    }
    if (top.status === 'overdue') return { line1: 'Service is overdue.', line2: "Let's tackle it." };
    if (top.status === 'due_now') return { line1: 'Service is due soon.', line2: "Here's what I'd handle next." };
    return { line1: 'You\'re in good shape.', line2: 'What can I help with?' };
  })();

  const eyebrow = isAuthed && user
    ? `WELCOME BACK · ${user.name.toUpperCase().split(' ')[0]}`
    : `AU7O · YOUR ${(vehicle.model || vehicle.make).toUpperCase()}`;

  // Top issues for the inline ranked card. Anon variant shows 2 (matches
  // 04-MobileHubAnonymous.jsx); signed-in shows 4 (matches 05).
  const topIssues = attachableIssues.slice(0, isAuthed ? 4 : 2);

  // Suggestion chip set — the design has two flavors:
  //   • A3 (signed-in): maintenance-leaning (calendar/dollar/book/map)
  //   • A2 (anonymous): diagnostic-leaning (alert/wrench/search/spark)
  type ChipIcon = IconName;
  const suggestions: { icon: ChipIcon; text: string; tone?: 'crit' }[] = (() => {
    if (!isAuthed) {
      // Anon: prompts that map to public surfaces (issues, recalls, parts)
      // — drive engagement before sign-in.
      // Mobile-tight: 2 suggestions only (was 4 — vertical real estate is
      // precious above the fold). The chip strip above the composer
      // surfaces the broader Maintenance/Recalls/Issues/Parts/Trip
      // entrypoints so we don't lose discoverability.
      return [
        { icon: 'alert', text: `What recalls apply to my ${vehicle.model}?`, tone: 'crit' },
        { icon: 'wrench', text: 'Plan my next oil change' },
      ] as const as { icon: ChipIcon; text: string; tone?: 'crit' }[];
    }
    const out: { icon: ChipIcon; text: string }[] = [];
    const ctas = opener.cta || [];
    if (ctas[0]) out.push({ icon: 'calendar', text: ctas[0] });
    if (ctas[1]) out.push({ icon: 'dollar', text: ctas[1] });
    if (ctas[2]) out.push({ icon: 'book', text: ctas[2] });
    out.push({ icon: 'map', text: 'Plan a weekend drive' });
    // Mobile-tight: cap at 2 (was 4) so the section fits above the fold.
    return out.slice(0, 2);
  })();

  // Quick-query chips above the composer — a horizontal scrolling row of
  // category shortcuts. Tapping one drops a starter prompt into the input.
  const quickQueries: { label: string; prompt: string }[] = [
    { label: 'Maintenance', prompt: 'What maintenance is due?' },
    { label: 'Recalls', prompt: 'Are there any recalls on my vehicle?' },
    { label: 'Issues', prompt: 'What problems are common at my mileage?' },
    { label: 'Parts', prompt: 'What parts do I need next?' },
    { label: 'Trip', prompt: 'Plan a nice drive for me' },
  ];

  const submit = () => {
    const t = input.trim();
    if (!t || pending) return;
    onSend(t);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="m-shell">
      <MobileThreadsDrawer
        open={threadsOpen}
        onClose={onCloseThreads}
        vehicle={vehicle}
        currentMileage={currentMileage}
        recentThreads={recentThreads}
        user={user}
        slug={slug}
        onSelectThread={onSelectThread}
      />

      {/* App header — menu icon on the left (was right; the right side
          was being eclipsed by the Google Translate widget), vehicle pill
          next to it, account/user pill on the far right. */}
      <header className="m-head">
        <button
          type="button"
          className="m-icon-btn"
          onClick={onOpenThreads}
          aria-label="Open menu"
          style={{ flexShrink: 0 }}
        >
          <Icon name="list" size={16} />
        </button>
        <div className="m-veh-pill" aria-label={`Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`}>
          <div className="m-veh-meta">
            <Link
              href="/garage"
              aria-label="Change vehicle"
              style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
            >
              <span className="m-veh-name">{vehicle.year} {vehicle.make} {vehicle.model}</span>
              <Icon name="chevron-down" size={11} style={{ color: 'var(--slate-400)' }} />
            </Link>
            <div className="m-veh-sub mono" style={{ marginTop: 6 }}>
              {vehicle.trim ? <span>{vehicle.trim}</span> : null}
              {vehicle.trim ? <span style={{ margin: '0 6px' }}>·</span> : null}
              <MileageEditor
                vehicle={vehicle}
                initialMileage={currentMileage}
                isAuthed={isAuthed}
                compact
              />
            </div>
          </div>
        </div>
        <div className="m-head-right">
          {user ? (
            <Link href="/account" className="m-avatar" aria-label={`${user.name} — account`}>
              {userInitialsTxt}
            </Link>
          ) : (
            <Link href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/vehicle/${slug}`)}`} className="m-avatar m-avatar-anon" aria-label="Sign in">
              <Icon name="user" size={14} />
            </Link>
          )}
        </div>
      </header>

      {/* Scrollable conversation surface */}
      <div ref={scrollRef} className="m-body">
        <div className="m-greet">
          <div className="m-eyebrow-row">
            <span className="au7o-pulse-soft m-pulse-dot" />
            <span className="eyebrow m-greet-eyebrow">{eyebrow}</span>
          </div>
          <h1 className="m-h1">
            {greeting.line1}<br />
            <span className="m-h1-sub">{greeting.line2}</span>
          </h1>
          {/* Body paragraph fades into transparency at the bottom so the
              COMMON AT YOUR MILEAGE card below it becomes the visual focus.
              Tapping expands the full text. Personality stays for SEO +
              screen-reader users; the fade is cosmetic only. */}
          <button
            type="button"
            className={`m-greet-p-wrap ${greetExpanded ? 'm-greet-p-wrap-open' : ''}`}
            onClick={() => setGreetExpanded((v) => !v)}
            aria-expanded={greetExpanded}
            aria-label={greetExpanded ? 'Collapse summary' : 'Read full summary'}
          >
            <p className="m-greet-p">{opener.text}</p>
          </button>
        </div>

        {/* First attachment differs by auth state, matching the bundle:
              • A3 (signed-in): rich vertical maintenance-schedule timeline
              • A2 (anonymous): condensed health card (top 2 issues) */}
        {isAuthed && schedule && schedule.services.length > 0 && (
          <div className="m-attach">
            <MobileMaintenanceCard
              schedule={schedule}
              currentMileage={currentMileage}
              onTaskTap={(_typeId, name) => {
                // Turn the tap into a chat prompt — keeps the user in the
                // hub conversation instead of yanking them to a separate
                // guide page. The opener phrasing matches what an owner
                // would naturally ask.
                onSend(`How do I do a ${name.toLowerCase()} on my ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}?`);
              }}
            />
          </div>
        )}

        {/* Known issues attachment — ranked, on-trim. Anon path lifts this
            to be the FIRST attachment (no schedule above). */}
        {topIssues.length > 0 && (
          <div className={`m-attach ${isAuthed ? 'm-attach-indent' : ''}`}>
            <MobileIssuesCard issues={topIssues} slug={slug} authed={isAuthed} />
          </div>
        )}

        {/* Suggested follow-up rows */}
        {suggestions.length > 0 && (
          <div className="m-suggest">
            <div className="eyebrow m-suggest-eyebrow">SUGGESTED FOR YOU</div>
            <div className="m-suggest-list">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="m-suggest-row"
                  onClick={() => onSend(s.text)}
                  disabled={pending}
                >
                  <Icon
                    name={s.icon}
                    size={13}
                    style={{ color: s.tone === 'crit' ? 'var(--crit)' : 'var(--slate-500)' }}
                  />
                  <span className="m-suggest-text">{s.text}</span>
                  <Icon name="chevron" size={10} style={{ color: 'var(--slate-400)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation turns past the opener (the opener itself is rendered
            into the greeting + attachments above, not as a bubble).
            Assistant turns mirror desktop's Au7oReply behavior: markdown
            inline (so ** / _ render properly instead of leaking raw),
            issue cards matched from the reply text, mini-map for trip
            intent, schedule attachment when present, and follow-up chips. */}
        {messages.slice(1).map((m, idx) => {
          if (m.role === 'user') {
            return (
              <div key={idx} className="m-row-user">
                <div className="m-bubble-user">{m.content}</div>
              </div>
            );
          }
          const matched = matchAttachments(m.content, attachableIssues);
          const { body, followUps } = extractFollowUps(m.content);
          const visibleBody = matched.length > 0
            ? stripIssueTitleLines(body, matched.map((a) => a.title))
            : body;
          const drive = detectDriveIntent(m.content);
          return (
            <div key={idx} className="m-row-au7o">
              <Image src="/og-image.png" alt="" width={22} height={22} className="m-mascot" />
              <div className="m-au7o-body">
                {!m.content
                  ? <span className="m-typing">…</span>
                  : visibleBody.trim().length > 0
                    ? renderMarkdownLite(visibleBody)
                    : null}
                {m.schedule && (
                  <MaintenanceSchedule
                    schedule={m.schedule}
                    onTaskTap={(_typeId, name) => {
                      onSend(`How do I do a ${name.toLowerCase()} on my ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}?`);
                    }}
                  />
                )}
                {matched.length > 0 && <IssueAttachmentGroup issues={matched} />}
                {m.route ? (
                  <MiniRoute
                    route={m.route}
                    onOpenDrive={() => {
                      const dest = m.route!.destination.placeName || (drive?.destination ?? '');
                      const href = dest ? `/drive?to=${encodeURIComponent(dest)}` : '/drive';
                      window.location.href = href;
                    }}
                  />
                ) : (
                  drive && <DriveHandoff destination={drive.destination} />
                )}
                {followUps.length > 0 && (
                  <div className="m-followups">
                    {followUps.map((q, i) => (
                      <button key={i} className="m-followup-chip" onClick={() => onSend(q)} disabled={pending}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer + bottom tab bar */}
      <div className="m-foot">
        <div className="m-quick-row">
          {quickQueries.map((q) => (
            <button
              key={q.label}
              type="button"
              className="m-quick-chip"
              onClick={() => onSend(q.prompt)}
              disabled={pending}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Remaining-chats indicator (anonymous only). Hook is idempotent
            — also called at the top level so values agree. */}
        {remaining !== Infinity && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <RemainingChatsIndicator remaining={remaining} />
          </div>
        )}

        <div className="m-composer">
          <Icon name="chat" size={13} style={{ color: 'var(--slate-400)' }} />
          <textarea
            ref={taRef}
            className="m-composer-input"
            placeholder={remaining === 0 ? 'Subscribe to keep chatting…' : 'Ask Au7o anything…'}
            value={input}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            disabled={pending || remaining === 0}
          />
          <button type="button" className="m-mic-btn" disabled aria-label="Voice (coming soon)" title="Voice — coming soon">
            <Icon name="mic" size={13} />
          </button>
          <button
            type="button"
            className="m-send-btn"
            onClick={submit}
            disabled={pending || !input.trim()}
            aria-label="Send"
          >
            <Icon name="send" size={12} />
          </button>
        </div>

        {/* Bottom nav removed — the chip strip above the composer
            (Maintenance / Recalls / Issues / Parts / Trip) already covers
            navigation, the vehicle pill's chevron at the top opens
            /garage, and Ask is the composer itself. Removing the tab bar
            reclaimed ~50px above the fold. */}
      </div>

      <style jsx>{`
        .m-shell {
          display: none;
          /* 100dvh = "dynamic viewport height" — re-measures as the iOS
             Safari address bar collapses/expands. Plain 100vh on iOS uses
             the *largest* possible viewport which pushes the composer
             below the visible area when the address bar is showing. */
          height: 100dvh;
          /* Fallback for browsers without dvh support (older Safari). */
          height: 100vh;
          height: 100dvh;
          flex-direction: column;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--au7o-font-sans);
          overflow: hidden;
          position: relative;
        }
        @media (max-width: 900px) {
          .m-shell { display: flex; }
        }

        /* ─── Header ─── */
        .m-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 6px 16px 10px;
          background: var(--paper); flex: 0 0 auto;
        }
        .m-veh-pill {
          display: inline-flex; align-items: center; gap: 8px;
          /* Wider horizontal padding now that the disc avatar is gone —
             gives the year/make/model text room to breathe inside the
             rounded pill. */
          padding: 8px 16px;
          background: #fff; border: 1px solid var(--paper-line); border-radius: var(--r-pill);
          color: var(--ink); text-decoration: none;
          min-width: 0; max-width: 70vw;
          /* Stop the meta column from squeezing to wrap — iOS Safari was
             stacking model/year vertically when the row got cramped. */
          flex-wrap: nowrap;
        }
        .m-veh-pill > * { flex-shrink: 0; }
        .m-veh-pill .m-veh-meta { flex-shrink: 1; min-width: 0; }
        .m-veh-meta { line-height: 1.1; min-width: 0; flex: 1; text-align: left; }
        .m-veh-name {
          font-size: 11.5px; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .m-veh-sub {
          font-size: 9.5px; color: var(--slate-500);
        }
        .m-head-right { display: flex; align-items: center; gap: 8px; }
        .m-icon-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: #fff; border: 1px solid var(--paper-line);
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--slate-500); cursor: pointer; padding: 0;
        }
        .m-icon-btn:hover { background: var(--paper); }
        .m-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--au7o-blue), #1e3a8a);
          color: #fff; display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; text-decoration: none;
        }
        .m-avatar-anon {
          background: #fff; color: var(--slate-500); border: 1px solid var(--paper-line);
        }

        /* ─── Body / conversation surface ─── */
        .m-body {
          flex: 1; min-height: 0;
          overflow-y: auto;
          padding: 4px 16px 220px;
          -webkit-overflow-scrolling: touch;
        }
        .m-body::-webkit-scrollbar { width: 6px; }
        .m-body::-webkit-scrollbar-thumb { background: rgba(11,18,32,0.12); border-radius: 3px; }

        .m-greet { margin-top: 10px; }
        .m-greet-p-wrap {
          /* Wrap is a <button> so the whole faded region is tappable —
             tap removes the mask and reveals the full paragraph. */
          position: relative;
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
          cursor: pointer;
          max-height: 56px;
          overflow: hidden;
          transition: max-height 220ms ease-out;
          /* Fade the bottom of the body paragraph into transparency so
             the COMMON AT YOUR MILEAGE card below it becomes the visual
             focus. Mask handles both Safari (webkit) and others. */
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
        .m-greet-p-wrap-open {
          /* Expanded state — clear the mask + uncap height so the full
             paragraph is legible. Generous max-height handles any
             reasonable opener length without animation jitter. */
          max-height: 1000px;
          -webkit-mask-image: none;
          mask-image: none;
        }
        .m-eyebrow-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .m-pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--au7o-blue);
          display: inline-block;
        }
        .m-greet-eyebrow {
          color: var(--au7o-blue);
          font-size: 10px;
        }
        .m-h1 {
          font-size: 22px; font-weight: 600; letter-spacing: -0.02em;
          line-height: 1.2; margin: 0;
        }
        .m-h1-sub { color: var(--slate-500); }
        .m-greet-p {
          font-size: 12.5px; color: var(--slate-700);
          margin: 8px 0 0; line-height: 1.5;
          white-space: pre-wrap;
        }

        .m-attach { margin-top: 14px; }
        .m-attach-indent { margin-left: 30px; }

        /* ─── Suggested rows ─── */
        .m-suggest { margin-top: 22px; }
        .m-suggest-eyebrow { margin-bottom: 8px; font-size: 10px; }
        .m-suggest-list { display: flex; flex-direction: column; gap: 6px; }
        .m-suggest-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: #fff; border: 1px solid var(--paper-line); border-radius: 12px;
          font-family: inherit; font-size: 12.5px; color: var(--ink);
          text-align: left; cursor: pointer; width: 100%;
        }
        .m-suggest-row:disabled { opacity: 0.5; cursor: default; }
        .m-suggest-row:active { background: var(--paper-2); }
        .m-suggest-text { flex: 1; min-width: 0; }

        /* ─── Conversation turns ─── */
        .m-row-user { display: flex; justify-content: flex-end; margin-top: 18px; }
        .m-bubble-user {
          background: var(--ink); color: #fff;
          padding: 8px 12px; border-radius: 14px 14px 4px 14px;
          font-size: 13px; line-height: 1.45; max-width: 82%;
          white-space: pre-wrap;
        }
        .m-row-au7o {
          margin-top: 14px; display: flex; gap: 8px; align-items: flex-start;
        }
        .m-mascot { margin-top: 2px; flex-shrink: 0; }
        .m-au7o-body {
          font-size: 13px; color: var(--ink); line-height: 1.5;
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .m-au7o-body :global(strong) { font-weight: 600; color: var(--ink); }
        .m-au7o-body :global(em) { font-style: italic; color: var(--slate-500); }
        .m-au7o-body :global(ul) { padding-left: 0; margin: 6px 0; list-style: none; }
        .m-au7o-body :global(li) { padding: 2px 0; }
        /* Loosen attachment widths so IssueAttachmentGroup, MiniRoute, and
           MaintenanceSchedule don't get clipped by a desktop max-width. */
        .m-au7o-body :global(.row-au7o) { width: 100%; }
        .m-au7o-body :global(.body) { max-width: 100% !important; gap: 10px !important; }
        .m-typing { color: var(--slate-400); }
        .m-followups { display: flex; flex-direction: column; gap: 6px; }
        .m-followup-chip {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 9px 12px; border-radius: 12px;
          background: #fff; border: 1px solid var(--paper-line);
          color: var(--ink); font-family: inherit; font-size: 12.5px;
          text-align: left; cursor: pointer;
        }
        .m-followup-chip:disabled { opacity: 0.5; cursor: default; }
        .m-followup-chip:active { background: var(--paper-2); }

        /* ─── Composer + tab bar ─── */
        .m-foot {
          position: absolute; left: 0; right: 0; bottom: 0;
          /* Tighter bottom padding now that the tab bar is gone — composer
             sits flush against the iOS Safari address bar / home indicator.
             env(safe-area-inset-bottom) respects iPhone notch + home bar so
             we don't get obscured on devices with a physical home bar. */
          padding: 8px 12px max(6px, env(safe-area-inset-bottom));
          background: linear-gradient(180deg, rgba(247,246,242,0) 0%, rgba(247,246,242,0.92) 30%, var(--paper) 70%);
          z-index: 4;
        }
        .m-quick-row {
          display: flex; gap: 6px; margin-bottom: 8px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .m-quick-row::-webkit-scrollbar { display: none; }
        .m-quick-chip {
          flex-shrink: 0;
          padding: 5px 10px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(10px);
          border: 1px solid var(--paper-line); border-radius: var(--r-pill);
          font-family: inherit; font-size: 11.5px; color: var(--slate-700);
          cursor: pointer;
        }
        .m-quick-chip:disabled { opacity: 0.5; cursor: default; }

        .m-composer {
          background: #fff; border: 1px solid var(--paper-line); border-radius: 18px;
          box-shadow: var(--shadow-2);
          padding: 7px 7px 7px 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .m-composer-input {
          flex: 1; min-width: 0;
          border: none; outline: none; background: transparent;
          font-family: inherit; color: var(--ink);
          /* iOS Safari auto-zooms when an <input>/<textarea> has font-size
             below 16px. Scale the visual size back down via a transform-
             free trick: keep font-size 16px but compensate line-height so
             the composer height stays roughly where the design intends. */
          font-size: 16px;
          resize: none; padding: 2px 0; line-height: 1.3;
          max-height: 120px;
        }
        .m-composer-input::placeholder {
          color: var(--slate-400);
          font-size: 14px;
        }
        .m-mic-btn {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--paper-2); border: none;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--slate-500); cursor: pointer; padding: 0;
        }
        .m-mic-btn:disabled { opacity: 0.55; cursor: default; }
        .m-send-btn {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--ink); border: none;
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff; cursor: pointer; padding: 0;
        }
        .m-send-btn:disabled { background: var(--slate-400); cursor: default; }

        .m-tabs {
          display: flex; justify-content: space-around;
          padding-top: 10px; margin-top: 4px;
          border-top: 1px solid var(--paper-line);
        }
        .m-tab {
          display: flex; flex-direction: column; align-items: center;
          /* Wider gap between glyph and label so the bottom row breathes
             — earlier 2px crammed icon + text into one optical block. */
          gap: 4px;
          background: transparent; border: none; cursor: pointer;
          color: var(--slate-400); text-decoration: none;
          padding: 2px 8px; font-family: inherit;
        }
        .m-tab > span:last-child {
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.01em;
        }
        .m-tab-active { color: var(--ink); }
        .m-tab-active > span:last-child { font-weight: 600; }
      `}</style>
    </div>
  );
}

/* ─── Mobile maintenance schedule card (vertical timeline) ─── */
function MobileMaintenanceCard({
  schedule, currentMileage, onTaskTap,
}: { schedule: ScheduleData; currentMileage: number | null; onTaskTap?: (typeId: string, name: string) => void }) {
  const services = schedule.services.filter((s) => s.status !== 'done').slice(0, 5);
  const overdueCount = schedule.stats.overdueCount;
  const dueSoonCount = services.filter((s) => s.status === 'due_now').length;
  const totalTracked = schedule.services.length;
  const ytdSpent = schedule.stats.ytdSpent;

  // Header status pill: most pressing wins.
  const headerBadge = overdueCount > 0
    ? { text: 'OVERDUE', cls: 'crit' as const }
    : dueSoonCount > 0
      ? { text: 'SOON', cls: 'warn' as const }
      : { text: 'ON TRACK', cls: 'ok' as const };

  const statusColor = (s: ScheduleServiceStatus): string => {
    // Token references inside inline-style values — needs raw values so
    // dot fills + borders can be assembled in JSX. Mirrors the bundle's
    // statusColor() helper and the design's amber-overdue / blue-due-soon
    // / green-done / slate-upcoming palette.
    switch (s) {
      case 'overdue': return '#B45309'; // amber-700, intentionally darker than --warn
      case 'due_now': return 'var(--au7o-blue)';
      case 'done': return 'var(--ok)';
      default: return 'var(--slate-400)';
    }
  };
  const statusLabel = (s: ScheduleServiceStatus): string => {
    switch (s) {
      case 'overdue': return 'OVERDUE';
      case 'due_now': return 'DUE SOON';
      case 'done': return 'DONE';
      default: return 'UPCOMING';
    }
  };

  // Headline summary line — built dynamically since we don't know exact
  // counts at design time.
  const summary = `${totalTracked} services tracked${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}${dueSoonCount > 0 ? ` · ${dueSoonCount} due soon` : ''}`;

  // "Next" stat — miles until next due. Null when nothing is on the
  // horizon; <=0 means overdue.
  const nextDueMiles = schedule.stats.nextDueMiles;
  const nextLabel = nextDueMiles == null ? '—' : nextDueMiles <= 0 ? 'now' : nextDueMiles.toLocaleString();
  const nextUnit = nextDueMiles == null ? 'nothing due' : nextDueMiles <= 0 ? 'overdue' : 'mi to go';

  return (
    <div className="mc">
      <div className="mc-head">
        <div className="mc-head-row">
          <Icon name="wrench" size={12} style={{ color: 'var(--au7o-blue)' }} />
          <span className="eyebrow mc-eyebrow">MAINTENANCE SCHEDULE</span>
          <span className={`mc-status mc-status-${headerBadge.cls}`}>{headerBadge.text}</span>
        </div>
        <div className="mc-summary">{summary}</div>
      </div>

      <div className="mc-stats">
        <div className="mc-stat">
          <div className="eyebrow mc-stat-k">NOW</div>
          <div className="mono mc-stat-v">{currentMileage != null ? currentMileage.toLocaleString() : '—'}</div>
          <div className="mc-stat-u">miles</div>
        </div>
        <div className="mc-stat mc-stat-mid">
          <div className="eyebrow mc-stat-k">NEXT</div>
          <div className="mono mc-stat-v mc-stat-blue">{nextLabel}</div>
          <div className="mc-stat-u">{nextUnit}</div>
        </div>
        <div className="mc-stat">
          <div className="eyebrow mc-stat-k">YTD</div>
          <div className="mono mc-stat-v mc-stat-ok">${ytdSpent.toLocaleString()}</div>
          <div className="mc-stat-u">spent</div>
        </div>
      </div>

      {/* Vertical timeline — "you are here" pill at top, then upcoming services
          ascending in mileage. */}
      <div className="mc-timeline">
        <div className="mc-here">
          <span className="mc-here-dot" />
          <span className="mono mc-here-label">
            YOU ARE HERE · {currentMileage != null ? currentMileage.toLocaleString() : '—'} MI
          </span>
        </div>

        <div className="mc-track">
          <div className="mc-rail" />
          {services.map((s, i) => {
            const c = statusColor(s.status);
            const isPrimary = !!s.primary || (i === 0 && s.status !== 'done');
            const interactive = !!onTaskTap;
            const rowInner = (
              <>
                <span
                  className="mc-dot"
                  style={{
                    width: isPrimary ? 14 : 10,
                    height: isPrimary ? 14 : 10,
                    background: s.status === 'upcoming' ? '#fff' : c,
                    border: `2px solid ${c}`,
                    boxShadow: isPrimary ? '0 0 0 4px rgba(59,130,246,0.18)' : 'none',
                    marginLeft: isPrimary ? -2 : 0,
                  }}
                />
                <div className="mc-row-body">
                  <div className="mc-row-head">
                    <span className="mc-row-name">{s.name}</span>
                    <span className="mono mc-row-status" style={{ color: c }}>{statusLabel(s.status)}</span>
                  </div>
                  <div className="mc-row-meta">
                    <span className="mono mc-row-mi">{Math.round(s.mileage / 1000)}k mi</span>
                    {s.note && <span className="mc-row-note"> · {s.note}</span>}
                  </div>
                </div>
              </>
            );
            // When onTaskTap is provided, render as a button so every
            // service row is tappable. Falls back to a plain div in the
            // (unlikely) case the host hasn't provided a handler.
            return interactive ? (
              <button
                key={s.typeId + i}
                type="button"
                className="mc-row mc-row-btn"
                onClick={() => onTaskTap?.(s.typeId, s.name)}
                aria-label={`Open guide for ${s.name}`}
              >
                {rowInner}
              </button>
            ) : (
              <div key={s.typeId + i} className="mc-row">{rowInner}</div>
            );
          })}
        </div>
      </div>

      <div className="mc-actions">
        <button type="button" className="mc-btn mc-btn-primary">
          <Icon name="calendar" size={11} /> Book all at one visit
        </button>
        <button type="button" className="mc-btn">
          <Icon name="dollar" size={11} /> Estimate
        </button>
      </div>

      <style jsx>{`
        .mc {
          background: #fff; border: 1px solid var(--paper-line); border-radius: var(--r-3);
          overflow: hidden; box-shadow: var(--shadow-1);
        }
        .mc-head { padding: 12px 14px 10px; border-bottom: 1px solid var(--paper-line); }
        .mc-head-row { display: flex; align-items: center; gap: 8px; }
        .mc-eyebrow { color: var(--au7o-blue); font-size: 10px; }
        .mc-status {
          margin-left: auto;
          font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
          letter-spacing: 0.04em;
          font-family: var(--au7o-font-mono);
        }
        .mc-status-crit { background: var(--crit-bg); color: #991B1B; }
        .mc-status-warn { background: var(--warn-bg); color: #92400E; }
        .mc-status-ok { background: var(--ok-bg); color: #065F46; }
        .mc-summary {
          font-size: 14px; font-weight: 600; margin-top: 6px;
          letter-spacing: -0.01em; line-height: 1.3;
        }

        .mc-stats {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid var(--paper-line);
        }
        .mc-stat { padding: 10px 12px; background: #fff; }
        .mc-stat-mid {
          border-left: 1px solid var(--paper-line);
          border-right: 1px solid var(--paper-line);
        }
        .mc-stat-k { font-size: 8.5px; }
        .mc-stat-v {
          font-size: 14px; font-weight: 700; color: var(--ink);
          margin-top: 2px; letter-spacing: -0.01em;
        }
        .mc-stat-blue { color: var(--au7o-blue); }
        .mc-stat-ok { color: var(--ok); }
        .mc-stat-u { font-size: 9.5px; color: var(--slate-500); margin-top: 1px; }

        .mc-timeline { padding: 14px 14px 6px; position: relative; }
        .mc-here { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .mc-here-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink); flex-shrink: 0; }
        .mc-here-label {
          font-size: 10px; font-weight: 700; color: var(--ink); letter-spacing: 0.04em;
        }
        .mc-track { position: relative; padding-left: 24px; }
        .mc-rail {
          position: absolute; left: 7px; top: 0; bottom: 12px;
          width: 2px; background: var(--paper-line);
        }
        .mc-row {
          display: flex; gap: 10px; align-items: flex-start;
          padding-bottom: 14px; position: relative;
        }
        /* Button variant — same layout as div .mc-row, with interactive
           affordances. Reset native button styling so it matches the
           div sibling exactly. */
        .mc-row-btn {
          width: 100%; text-align: left;
          background: transparent; border: none;
          font-family: inherit; color: inherit;
          cursor: pointer;
          padding-left: 0; padding-right: 0;
          border-radius: 8px;
          transition: background 120ms ease;
        }
        .mc-row-btn:hover { background: rgba(11,18,32,0.03); }
        .mc-row-btn:active { background: rgba(11,18,32,0.06); }
        .mc-dot {
          position: absolute; left: -22px; top: 4px;
          border-radius: 50%; box-sizing: content-box;
        }
        .mc-row-body { flex: 1; min-width: 0; }
        .mc-row-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .mc-row-name { font-size: 12.5px; font-weight: 600; letter-spacing: -0.005em; }
        .mc-row-status {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em;
        }
        .mc-row-meta { display: flex; align-items: center; gap: 0; margin-top: 2px; flex-wrap: wrap; }
        .mc-row-mi {
          font-size: 10px; color: var(--slate-500); font-weight: 600;
        }
        .mc-row-note { font-size: 11px; color: var(--slate-700); }

        .mc-actions {
          padding: 8px 14px 12px; display: flex; gap: 6px;
          border-top: 1px solid var(--paper-line);
        }
        .mc-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 10px; border-radius: var(--r-pill);
          background: #fff; border: 1px solid var(--paper-line);
          font-family: inherit; font-size: 12px; font-weight: 600; color: var(--ink);
          cursor: pointer;
        }
        .mc-btn-primary { background: var(--ink); color: #fff; border-color: var(--ink); }
      `}</style>
    </div>
  );
}

/* ─── Mobile inline known-issues card (ranked) ─── */
function MobileIssuesCard({
  issues, slug, authed,
}: { issues: AttachableIssue[]; slug: string; authed: boolean }) {
  // Count high-severity items so the eyebrow can hint at urgency
  // ("X KNOWN · YOUR TRIM · Y HIGH" without overcrowding).
  const highCount = issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
  // Anonymous variant uses the bundle's "COMMON AT 60K+ MILES" framing
  // since we don't yet know if the user owns this car. Signed-in says
  // "YOUR TRIM" because we have their actual vehicle on file.
  // Eyebrow label honesty: only use "AT YOUR MILEAGE" when we actually
  // filter by mileage. We currently rank by severity/popularity, not
  // mileage band, so the old label was misleading — especially on
  // 0-mileage vehicles where it read as "common at 0 miles."
  const eyebrowText = authed
    ? `${issues.length} KNOWN · YOUR TRIM`
    : 'COMMONLY REPORTED ISSUES';
  return (
    <div className="ic">
      <div
        className="ic-head"
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--paper-line)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon name="alert" size={12} style={{ color: 'var(--slate-500)' }} />
        <span className="eyebrow ic-eyebrow" style={{ fontSize: 10 }}>{eyebrowText}</span>
        {highCount > 0 && (
          <span
            className="mono ic-meta"
            style={{ marginLeft: 'auto', fontSize: 10, color: '#B45309', fontWeight: 600 }}
          >
            {highCount} HIGH
          </span>
        )}
      </div>
      {issues.map((iss, i) => {
        const isHigh = iss.severity === 'critical' || iss.severity === 'high';
        const cost = iss.estimatedCost
          ? `$${iss.estimatedCost.low}–${iss.estimatedCost.high >= 1000 ? `${Math.round(iss.estimatedCost.high / 100) / 10}k` : iss.estimatedCost.high}`
          : '—';
        const isLast = i === issues.length - 1;
        return (
          <Link
            key={iss.id}
            href={iss.knownIssuesUrl}
            className="ic-row"
            style={{
              borderBottom: isLast ? 'none' : '1px solid var(--paper-line)',
              // Inline display rules — styled-jsx hash isolation was
              // producing a vertically-stacked layout on mobile in
              // some builds (status dot on a separate row from the
              // title). Inline styles can't be scoped away.
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              // Generous breathing room — earlier rows looked smashed
              // because no padding was set inline (the styled-jsx
              // .ic-row { padding: 10px 14px } rule wasn't applying).
              padding: '14px 18px',
              color: 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <span
              className={`status-dot ${isHigh ? 'crit' : 'warn'}`}
              style={{
                width: 10, height: 10, borderRadius: 999,
                flex: '0 0 auto', display: 'inline-block',
                background: isHigh ? '#DC2626' : '#F59E0B',
              }}
            />
            <div className="ic-body" style={{ flex: 1, minWidth: 0 }}>
              <div className="ic-name">{iss.title}</div>
              <div className="mono ic-cat">{iss.category}</div>
            </div>
            <div className="mono ic-cost" style={{ flexShrink: 0, marginLeft: 8 }}>{cost}</div>
          </Link>
        );
      })}
      {/* Action row — inline-styled to guarantee the two buttons render
          side-by-side. Mobile users were reporting them rendering as a
          single visual blob "See all  Symptom check" likely because the
          styled-jsx .ic-actions hash wasn't being applied in some builds. */}
      <div
        className="ic-actions"
        style={{
          padding: '8px 14px 12px',
          display: 'flex',
          gap: 6,
          borderTop: '1px solid var(--paper-line)',
        }}
      >
        <Link
          href={`/known-issues/${slug}`}
          className="ic-btn ic-btn-primary"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            borderRadius: 999,
            background: 'var(--ink)',
            color: '#fff',
            border: '1px solid var(--ink)',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          See all
        </Link>
        <Link
          href="/symptom-chat"
          className="ic-btn"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            borderRadius: 999,
            background: '#fff',
            color: 'var(--ink)',
            border: '1px solid var(--paper-line)',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Symptom check
        </Link>
      </div>
      <style jsx>{`
        .ic {
          background: #fff; border: 1px solid var(--paper-line); border-radius: var(--r-3);
          overflow: hidden; box-shadow: var(--shadow-1);
        }
        .ic-head {
          padding: 10px 14px; border-bottom: 1px solid var(--paper-line);
          display: flex; align-items: center; gap: 8px;
        }
        .ic-eyebrow { font-size: 10px; }
        .ic-meta {
          margin-left: auto; font-size: 10px; color: #B45309; font-weight: 600;
        }
        .ic-row {
          padding: 10px 14px; display: flex; align-items: center; gap: 10px;
          color: var(--ink); text-decoration: none;
        }
        .ic-row:active { background: var(--paper-2); }
        .ic-body { flex: 1; min-width: 0; }
        .ic-name {
          font-size: 12.5px; font-weight: 600; line-height: 1.25;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ic-cat {
          font-size: 10px; color: var(--slate-500); margin-top: 2px;
          text-transform: capitalize;
        }
        .ic-cost {
          font-size: 11px; color: var(--ink); font-weight: 600; flex-shrink: 0;
        }
        .ic-actions {
          padding: 8px 14px 12px; display: flex; gap: 6px; border-top: 1px solid var(--paper-line);
        }
        .ic-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 10px; border-radius: var(--r-pill);
          background: #fff; border: 1px solid var(--paper-line);
          font-family: inherit; font-size: 12px; font-weight: 600; color: var(--ink);
          text-decoration: none;
        }
        .ic-btn-primary { background: var(--ink); color: #fff; border-color: var(--ink); }
      `}</style>
    </div>
  );
}

/* ─── Vehicle rail ─── */
function VehicleRail({
  vehicle, currentMileage, counts, recentThreads, maintenanceSuggestions, user, slug, onSelectThread,
}: {
  vehicle: VehicleHubProps['vehicle'];
  currentMileage: number | null;
  counts: VehicleHubProps['counts'];
  recentThreads: RecentThread[];
  maintenanceSuggestions: MaintenanceSuggestion[];
  user: VehicleHubProps['user'];
  slug: string;
  onSelectThread?: (threadId: string) => void;
}) {
  const v = vehicle;
  // The most pressing service is the first one — getMaintenanceSuggestions
  // sorts overdue → due_now → upcoming and we cap at 6, so [0] is the top.
  const topService = maintenanceSuggestions[0] ?? null;
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
          {/* VehicleHero renders /vehicles/{slug}.png when present
              (generated by scripts/generate-hero-images.js) and falls
              back to a generic coupe silhouette on 404. Width keeps
              the rail card visually balanced — image was 220px which
              made the card top-heavy. */}
          <VehicleHero vehicle={v} width={160} />
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

      {topService && currentMileage != null && (
        <MaintenanceTile service={topService} currentMileage={currentMileage} />
      )}

      <div className="eyebrow">Recent</div>
      <div className="thread-list">
        {recentThreads.length === 0 ? (
          <div className="thread-empty">No saved conversations yet.</div>
        ) : (
          recentThreads.map((t) => (
            <button
              key={t.id}
              className="thread"
              type="button"
              title={t.preview}
              onClick={() => onSelectThread?.(t.id)}
            >
              <div className="t-meta">
                <div className="t-title">{t.preview || 'Untitled conversation'}</div>
                {/* suppressHydrationWarning — relativeWhen() uses Date.now()
                    which differs between SSR (build time) and client render
                    (browser load time). Without suppression React #418 fires
                    and bails out of hydrating this <button>, so onClick
                    never attaches and clicks do nothing. SSR text stays;
                    client may update on subsequent renders. */}
                <div className="t-when" suppressHydrationWarning>{relativeWhen(t.updatedAt)}</div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="rail-spacer" />

      {/* Bottom action row — replaces the old UserFooter (subscriber tag).
          Account access lives on the global FloatingAuthButton, so this
          row is now task-oriented: jump to Drive, browse Known Issues,
          add another vehicle. The Add-vehicle CTA is shown for everyone
          but gated for non-subscribers when they already have ≥1 saved
          vehicle (multi-vehicle is a premium feature). */}
      <div className="rail-bottom-actions">
        <Link href="/drive" className="rail-action" title="Open Drive">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Open Drive</span>
        </Link>
        <Link
          href={`/known-issues/${v.make.toLowerCase().replace(/\s+/g, '-')}-${v.model.toLowerCase().replace(/\s+/g, '-')}`}
          className="rail-action"
          title="Browse known issues"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M4 19.5A2.5 2.5 0 016.5 22H20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span>Known Issues</span>
        </Link>
        <Link
          href={user?.isSubscriber ? '/garage?add=1' : '/subscribe?reason=multi-vehicle'}
          className="rail-action rail-action-ghost"
          title={user?.isSubscriber ? 'Add another vehicle to your garage' : 'Multi-vehicle requires a subscription'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Add vehicle{user && !user.isSubscriber ? ' · upgrade' : ''}</span>
        </Link>
        {!user && (
          <Link
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/vehicle/${slug}`)}`}
            className="rail-action rail-action-ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 3h6v18h-6M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign in</span>
          </Link>
        )}
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
        /* Bottom action row — Open Drive, Known Issues, Add vehicle. */
        .rail-bottom-actions {
          padding: 12px 14px; border-top: 1px solid #E3DFD4;
          display: flex; flex-direction: column; gap: 4px;
        }
        .rail-action {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          background: transparent; border: 1px solid transparent;
          font-size: 12.5px; font-weight: 500; color: #0B1220;
          text-decoration: none;
          color: #334155;
        }
        .rail-action:hover {
          background: rgba(11,18,32,0.04);
          color: #0B1220;
          border-color: #E3DFD4;
        }
        .rail-action svg { color: #64748B; flex-shrink: 0; }
        .rail-action:hover svg { color: #0B1220; }
        .rail-action-ghost {
          font-size: 12px;
          color: #64748B;
        }
      `}</style>
    </aside>
  );
}

/* ─── Maintenance tile (signed-in, glanceable next service) ─── */
function MaintenanceTile({
  service, currentMileage,
}: { service: MaintenanceSuggestion; currentMileage: number }) {
  // Progress from "last service" to "next due". Falls back to a 0-baseline
  // when the user has never logged this service — in that case the bar
  // visualises progress toward the manufacturer interval.
  const baseline = service.lastServiceMileage ?? 0;
  const span = Math.max(1, service.nextDueMileage - baseline);
  const elapsed = currentMileage - baseline;
  const pct = Math.max(0, Math.min(100, (elapsed / span) * 100));

  const remaining = service.milesUntilDue;
  const remainingLabel = remaining < 0
    ? `${Math.abs(remaining).toLocaleString()} mi past due`
    : `in ${remaining.toLocaleString()} mi`;

  const badge =
    service.status === 'overdue' ? { text: 'OVERDUE', cls: 'crit' } :
    service.status === 'due_now' ? { text: 'SOON', cls: 'warn' } :
    { text: 'UPCOMING', cls: 'info' };

  return (
    <div className="mt-wrap">
      <button className="mt-card" type="button">
        <div className="mt-head">
          <span className="mt-eyebrow">NEXT SERVICE</span>
          <span className={`mt-badge mt-badge-${badge.cls}`}>{badge.text}</span>
        </div>
        <div className="mt-name">{service.name}</div>
        <div className="mt-meta mono">{remainingLabel}</div>
        <div className="mt-bar"><div className="mt-fill" style={{ width: `${pct}%` }} /></div>
        <div className="mt-ticks mono">
          <span>{Math.round(baseline / 1000).toLocaleString()}k</span>
          <span>{Math.round(service.nextDueMileage / 1000).toLocaleString()}k</span>
        </div>
      </button>
      <style jsx>{`
        .mt-wrap { padding: 12px 16px 0; }
        .mt-card {
          width: 100%; text-align: left; cursor: pointer;
          background: #fff; border: 1px solid #E3DFD4; border-radius: 12px;
          padding: 12px 14px; display: block;
          font-family: var(--font-geist-sans, system-ui, sans-serif); color: #0B1220;
        }
        .mt-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .mt-eyebrow {
          font-size: 9.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #64748B;
        }
        .mt-badge {
          font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
          letter-spacing: 0.04em;
          font-family: var(--font-geist-mono, ui-monospace, monospace);
        }
        .mt-badge-crit { background: #FEE2E2; color: #991B1B; }
        .mt-badge-warn { background: #FEF3C7; color: #92400E; }
        .mt-badge-info { background: rgba(59,130,246,0.12); color: #1D4ED8; }
        .mt-name { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; }
        .mt-meta { font-size: 10.5px; color: #64748B; margin-top: 2px;
          font-family: var(--font-geist-mono, ui-monospace, monospace); font-feature-settings: "tnum" 1; }
        .mt-bar { margin-top: 10px; height: 4px; background: #E3DFD4; border-radius: 2px; overflow: hidden; position: relative; }
        .mt-fill { height: 100%; background: linear-gradient(90deg, #3B82F6, #2563EB); border-radius: 2px; }
        .mt-ticks { display: flex; justify-content: space-between; margin-top: 4px;
          font-size: 9.5px; color: #94A3B8;
          font-family: var(--font-geist-mono, ui-monospace, monospace); }
      `}</style>
    </div>
  );
}

/* ─── Signed-in user footer (avatar + name + subscriber tag) ─── */
function UserFooter({ user }: { user: NonNullable<VehicleHubProps['user']> }) {
  const initials = (() => {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '·';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  const monthsJoined = (() => {
    const joined = new Date(user.joinedAt);
    if (isNaN(joined.getTime())) return null;
    const now = new Date();
    const m = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
    return Math.max(0, m);
  })();

  const tag = user.isSubscriber
    ? (monthsJoined != null ? `SUBSCRIBER · ${monthsJoined} MO` : 'SUBSCRIBER')
    : (monthsJoined != null ? `FREE · ${monthsJoined} MO` : 'FREE');

  return (
    <Link href="/account" className="uf">
      <div className="uf-avatar">{initials}</div>
      <div className="uf-meta">
        <div className="uf-name">{user.name || 'Your account'}</div>
        <div className="uf-tag mono">{tag}</div>
      </div>
      <svg className="uf-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <style jsx>{`
        .uf {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-top: 1px solid #E3DFD4;
          color: #0B1220; text-decoration: none;
        }
        .uf:hover { background: rgba(11,18,32,0.03); }
        .uf-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1e3a8a);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .uf-meta { flex: 1; min-width: 0; line-height: 1.1; }
        .uf-name {
          font-size: 12.5px; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .uf-tag {
          font-size: 9.5px; color: #64748B; margin-top: 2px;
          font-family: var(--font-geist-mono, ui-monospace, monospace);
          letter-spacing: 0.04em;
        }
        .uf-chev { color: #94A3B8; flex-shrink: 0; }
      `}</style>
    </Link>
  );
}

/* ─── Top bar ─── A3-design: eyebrow on the left, quick-action pills
 (Drive / Library) in the middle, user pill on the right when signed in.
 The Translate widget docks to the right of the user pill via global CSS. */
function TopBar({
  vehicle, user, onOpenThreads,
}: { vehicle: VehicleHubProps['vehicle']; user: VehicleHubProps['user']; onOpenThreads: () => void }) {
  // Vehicle + user props retained for layout/aria purposes but no
  // longer rendered in the topbar — Open Drive / Library / duplicate
  // user pill all moved to the rail's action row, and the global
  // FloatingAuthButton handles the avatar.
  void vehicle; void user;
  return (
    <div className="topbar">
      <div className="tb-left">
        {/* Mobile-only hamburger — desktop has the rail with these threads
            already pinned to the side. */}
        <button type="button" className="tb-burger" onClick={onOpenThreads} aria-label="Open recent conversations">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Mobile-only brand chip — the desktop brand lives in the (hidden) rail. */}
        <Link href="/" className="tb-brand-mobile" aria-label="Au7o home">
          <Image src="/og-image.png" alt="" width={22} height={22} />
        </Link>
        <span className="eyebrow-inline">Conversation</span>
        <span className="tb-sep">·</span>
        <span style={{ color: '#334155' }}>Maintenance check-in</span>
      </div>
      <div className="tb-right">
        {/* Open Drive / Library pills removed — now live in the rail's
            bottom action row. The duplicate user pill (avatar + name)
            was also removed because the global FloatingAuthButton in
            the layout already shows the user avatar to the right of
            the Translate widget; having two avatars side-by-side read
            as a bug. Keeps just the translate-button spacer so the
            global widget at top-right has room to land. */}
        <span className="tb-translate-spacer" aria-hidden />
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
        .tb-right { display: flex; gap: 8px; align-items: center; }
        .tb-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 11px; border-radius: 999px;
          background: #fff; border: 1px solid #E3DFD4;
          font-size: 12px; font-weight: 500; color: #0B1220;
          text-decoration: none;
        }
        .tb-pill:hover { background: #FAF8F2; }
        .tb-sepline {
          width: 1px; height: 18px; background: #E3DFD4; margin: 0 4px;
        }
        .tb-user {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 11px 4px 4px; border-radius: 999px;
          background: transparent; border: 1px solid #E3DFD4;
          font-size: 12px; font-weight: 500; color: #0B1220;
          text-decoration: none;
        }
        .tb-user:hover { background: #FAF8F2; }
        .tb-avatar {
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1e3a8a);
          color: #fff; display: inline-flex; align-items: center; justify-content: center;
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.02em;
        }
        .tb-username {
          max-width: 110px; overflow: hidden;
          white-space: nowrap; text-overflow: ellipsis;
        }
        .tb-brand-mobile {
          display: none;
          align-items: center;
          padding: 4px 6px; border-radius: 8px;
          text-decoration: none;
        }
        .tb-brand-mobile :global(img) { display: block; }
        .tb-burger {
          display: none;
          align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: transparent; border: 1px solid #E3DFD4;
          border-radius: 10px; color: #0B1220;
          cursor: pointer; padding: 0;
          margin-right: 4px;
        }
        .tb-burger:hover { background: #FAF8F2; }
        .tb-translate-spacer { width: 110px; display: inline-block; }
        @media (max-width: 900px) {
          .tb-brand-mobile { display: inline-flex; }
          .tb-burger { display: inline-flex; }
          .tb-translate-spacer { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ─── Mobile threads drawer ─── Slide-in panel that mirrors the rail's
   recent-threads list when the desktop sidebar is collapsed (≤900px). The
   panel is rendered at all viewport sizes but the wrapper is display:none
   above 900px, so it costs nothing on desktop. */
function MobileThreadsDrawer({
  open, onClose, vehicle, currentMileage, recentThreads, user, slug, onSelectThread,
}: {
  open: boolean;
  onClose: () => void;
  vehicle: VehicleHubProps['vehicle'];
  currentMileage: number | null;
  recentThreads: RecentThread[];
  user: VehicleHubProps['user'];
  slug: string;
  onSelectThread?: (threadId: string) => void;
}) {
  // Lock body scroll while the drawer is open and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`md-shell ${open ? 'md-open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="md-backdrop"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
      />
      <aside className="md-panel" role="dialog" aria-label="Recent conversations">
        <div className="md-head">
          <Link href="/" className="md-brand" onClick={onClose}>
            <Image src="/og-image.png" alt="" width={24} height={24} />
            <span>Au<span className="md-accent">7</span>o</span>
          </Link>
          <button type="button" className="md-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="md-veh">
          <div className="md-veh-name">{vehicle.year} {vehicle.make} {vehicle.model}</div>
          <div className="md-veh-meta">
            {vehicle.trim}
            {currentMileage != null && <> · <span className="md-mono">{currentMileage.toLocaleString()} mi</span></>}
          </div>
        </div>

        <div className="md-eyebrow">Recent</div>
        <div className="md-list">
          {recentThreads.length === 0 ? (
            <div className="md-empty">No saved conversations yet.</div>
          ) : (
            recentThreads.map((t) => (
              <button
                key={t.id}
                className="md-thread"
                type="button"
                title={t.preview}
                onClick={() => { onSelectThread?.(t.id); onClose(); }}
              >
                <div className="md-t-title">{t.preview || 'Untitled conversation'}</div>
                {/* See note in VehicleRail — suppressHydrationWarning so the
                    Date.now() mismatch in relativeWhen() doesn't fail hydration
                    and strip the button's onClick handler. */}
                <div className="md-t-when" suppressHydrationWarning>{relativeWhen(t.updatedAt)}</div>
              </button>
            ))
          )}
        </div>

        <div className="md-spacer" />

        <div className="md-foot">
          <Link href="/garage" className="md-link" onClick={onClose}>
            Garage
          </Link>
          <Link href="/drive" className="md-link" onClick={onClose}>
            Drive
          </Link>
          <Link href={`/known-issues/${slug}`} className="md-link" onClick={onClose}>
            Known issues page
          </Link>
          {user ? (
            <Link href="/account" className="md-link md-link-primary" onClick={onClose}>
              {user.name} · Account
            </Link>
          ) : (
            <Link
              href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/vehicle/${slug}`)}`}
              className="md-link md-link-primary"
              onClick={onClose}
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>

      <style jsx>{`
        .md-shell {
          display: none;
          position: fixed; inset: 0;
          z-index: 50;
          pointer-events: none;
        }
        @media (max-width: 900px) {
          .md-shell { display: block; }
        }
        .md-backdrop {
          position: absolute; inset: 0;
          background: rgba(11,18,32,0.45);
          opacity: 0;
          transition: opacity 180ms ease;
          border: 0; padding: 0; cursor: pointer;
          pointer-events: none;
        }
        .md-open .md-backdrop {
          opacity: 1;
          pointer-events: auto;
        }
        .md-panel {
          position: absolute; top: 0; bottom: 0; left: 0;
          width: min(86vw, 320px);
          background: #FAF8F2;
          border-right: 1px solid #E3DFD4;
          transform: translateX(-100%);
          transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
          display: flex; flex-direction: column;
          color: #0B1220;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
          pointer-events: none;
        }
        .md-open .md-panel {
          transform: translateX(0);
          pointer-events: auto;
          box-shadow: 0 12px 40px rgba(11,18,32,0.18);
        }
        .md-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 12px;
        }
        .md-brand {
          display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none; color: #0B1220;
          font-size: 18px; font-weight: 600; letter-spacing: -0.02em;
        }
        .md-accent { color: #3B82F6; }
        .md-close {
          width: 32px; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid #E3DFD4; border-radius: 8px;
          color: #0B1220; cursor: pointer; padding: 0;
        }
        .md-close:hover { background: #EFEDE6; }
        .md-veh {
          margin: 4px 16px 0; padding: 12px 14px;
          background: #fff; border: 1px solid #E3DFD4; border-radius: 12px;
        }
        .md-veh-name { font-size: 13.5px; font-weight: 600; line-height: 1.3; }
        .md-veh-meta { font-size: 11.5px; color: #64748B; margin-top: 2px; }
        .md-mono { font-family: var(--font-geist-mono, ui-monospace, monospace); font-feature-settings: "tnum" 1; }
        .md-eyebrow {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #64748B; padding: 18px 20px 8px;
        }
        .md-list { padding: 0 12px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
        .md-empty { font-size: 12.5px; color: #94A3B8; padding: 0 12px; }
        .md-thread {
          display: block; width: 100%; text-align: left;
          background: transparent; border: 0; cursor: pointer;
          padding: 10px 12px; border-radius: 10px; color: #0B1220;
        }
        .md-thread:hover { background: rgba(11,18,32,0.04); }
        .md-t-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .md-t-when { font-size: 10.5px; color: #64748B; margin-top: 2px; }
        .md-spacer { flex: 0 0 4px; }
        .md-foot {
          padding: 12px 16px 18px; border-top: 1px solid #E3DFD4;
          display: flex; flex-direction: column; gap: 8px;
        }
        .md-link {
          display: flex; align-items: center; justify-content: center;
          padding: 11px 12px; border-radius: 10px;
          background: #fff; border: 1px solid #E3DFD4;
          font-size: 13px; font-weight: 500; color: #0B1220;
          text-decoration: none;
        }
        .md-link:hover { background: #EFEDE6; }
        .md-link-primary {
          background: #0B1220; color: #fff; border-color: #0B1220;
        }
        .md-link-primary:hover { background: #1e293b; }
      `}</style>
    </div>
  );
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  content, attachments = [], driveHandoff = null, route, schedule, issues, slug, isAuthed, onFollowUp,
}: {
  content: string;
  attachments?: AttachableIssue[];
  driveHandoff?: { destination: string | null } | null;
  route?: RoutePreview;
  schedule?: ScheduleData;
  issues?: AttachableIssue[];
  slug?: string;
  isAuthed?: boolean;
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
        {schedule && (
          <MaintenanceSchedule
            schedule={schedule}
            onTaskTap={(_typeId, name) => {
              // Au7oReply doesn't have direct vehicle context, but the
              // hub chat agent already has it from the system prompt.
              // Sending "How do I do an oil change?" inside an
              // established conversation resolves correctly.
              onFollowUp?.(`How do I do a ${name.toLowerCase()}?`);
            }}
          />
        )}
        {/* Known Issues card — vehicle-level context, parallel to the
            Maintenance Schedule above. Reuses MobileIssuesCard since
            that component is fully inline-styled and works at any
            viewport width (the "Mobile" prefix is historical — it was
            built for the mobile shell first). */}
        {issues && issues.length > 0 && slug && (
          <MobileIssuesCard issues={issues} slug={slug} authed={!!isAuthed} />
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
        <div className="composer-actions">
          <div className="comp-chips">
            <button className="comp-chip" type="button" disabled title="Coming soon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 12.5l-9 9a5.5 5.5 0 01-7.78-7.78L13 4.94a3.67 3.67 0 015.18 5.19L9.41 18.9a1.83 1.83 0 01-2.59-2.59L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Attach
            </button>
            <button className="comp-chip" type="button" disabled title="Coming soon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7h3l2-3h8l2 3h3v13H3V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Photo
            </button>
            <button className="comp-chip" type="button" disabled title="Voice is on Drive — coming to chat soon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 11a7 7 0 01-14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Voice
            </button>
          </div>
          <button className="icon-square icon-send" onClick={onSend} disabled={pending} title="Send">
            {pending ? '…' : '↑'}
          </button>
        </div>
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
          padding: 12px 14px;
          display: flex; flex-direction: column; gap: 8px;
        }
        textarea {
          width: 100%; border: 0; outline: 0; resize: none;
          font-family: inherit; font-size: 14.5px; line-height: 1.5; color: #0B1220;
          padding: 4px 4px;
          background: transparent;
          max-height: 120px;
        }
        .composer-actions {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .comp-chips { display: flex; gap: 6px; }
        .comp-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 9px; border-radius: 999px;
          background: #FAF8F2; border: 1px solid #E3DFD4;
          color: #0B1220; font-family: inherit; font-size: 11.5px; font-weight: 500;
          cursor: pointer;
        }
        .comp-chip:hover:not(:disabled) { background: #F2EFE5; }
        .comp-chip:disabled { opacity: 0.55; cursor: not-allowed; }
        .comp-chip svg { color: #64748B; }
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
/* ─── Maintenance Schedule (rich attachment for Au7o's first reply) ───
 * Mirrors the A3 design: 4-stat strip, mileage timeline with "you are here"
 * marker + service dots, and grouped service rows. All inline styles to
 * survive styled-jsx oddities (same lesson as IssueAttachmentGroup). */
function MaintenanceSchedule({
  schedule, onTaskTap,
}: { schedule: ScheduleData; onTaskTap?: (typeId: string, name: string) => void }) {
  const { services, stats, timelineMin, timelineMax } = schedule;
  const span = Math.max(1, timelineMax - timelineMin);
  const pct = (m: number) => Math.max(0, Math.min(100, ((m - timelineMin) / span) * 100));

  // Tick marks every ~5k miles, capped at 8 to avoid clutter.
  const tickStep = span > 30000 ? 10000 : 5000;
  const ticks: number[] = [];
  const firstTick = Math.ceil(timelineMin / tickStep) * tickStep;
  for (let m = firstTick; m <= timelineMax; m += tickStep) ticks.push(m);

  const grouped = {
    overdue: services.filter((s) => s.status === 'overdue'),
    due_now: services.filter((s) => s.status === 'due_now'),
    upcoming: services.filter((s) => s.status === 'upcoming'),
    done: services.filter((s) => s.status === 'done'),
  };

  const trackedCount = services.length;
  const overdueCount = grouped.overdue.length;
  const dueSoonCount = grouped.due_now.length;

  return (
    <div style={{
      background: '#fff', border: '1px solid #E3DFD4', borderRadius: 16,
      padding: '20px 22px', boxShadow: '0 1px 2px rgba(11,18,32,.06)',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Header */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#3B82F6',
        }}>MAINTENANCE SCHEDULE</div>
        <div style={{
          fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em',
          marginTop: 4, lineHeight: 1.25,
        }}>
          {trackedCount} service{trackedCount === 1 ? '' : 's'} tracked
          {overdueCount > 0 && <> · <span style={{ color: '#B45309' }}>{overdueCount} overdue</span></>}
          {dueSoonCount > 0 && <> · <span style={{ color: '#3B82F6' }}>{dueSoonCount} due soon</span></>}
        </div>
      </div>

      {/* 4-stat strip */}
      <div className="maint-stats-strip" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid #E3DFD4', borderRadius: 10, overflow: 'hidden',
      }}>
        {[
          { k: 'NOW', v: stats.nowMileage.toLocaleString(), u: 'miles', color: '#0B1220' },
          { k: 'NEXT DUE', v: stats.nextDueMiles != null ? stats.nextDueMiles.toLocaleString() : '—',
            u: stats.nextDueMiles != null ? 'mi to go' : 'on track', color: '#3B82F6' },
          { k: 'OVERDUE', v: String(stats.overdueCount),
            u: stats.overdueCount === 1 ? 'service' : 'services',
            color: stats.overdueCount > 0 ? '#B45309' : '#94A3B8' },
          { k: 'YR-TO-DATE', v: stats.ytdSpent > 0 ? `$${Math.round(stats.ytdSpent).toLocaleString()}` : '—',
            u: 'spent on maint.', color: '#10B981' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '12px 14px',
            borderRight: i < 3 ? '1px solid #E3DFD4' : 'none',
            background: '#fff',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#64748B',
            }}>{s.k}</div>
            <div style={{
              fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
              fontFeatureSettings: '"tnum" 1',
              fontSize: 18, fontWeight: 700, color: s.color,
              marginTop: 4, letterSpacing: '-0.02em',
            }}>{s.v}</div>
            <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }}>{s.u}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', padding: '32px 0 8px' }}>
        <div style={{ position: 'relative', height: 40 }}>
          {/* baseline */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 18, height: 4,
            background: '#E3DFD4', borderRadius: 2 }}/>
          {/* travelled portion */}
          <div style={{ position: 'absolute', left: 0, top: 18, height: 4,
            width: `${pct(stats.nowMileage)}%`,
            background: 'linear-gradient(90deg, #10B981, #3B82F6)',
            borderRadius: 2 }}/>

          {/* tick labels */}
          {ticks.map((m, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${pct(m)}%`, top: 0,
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{
                fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
                fontSize: 10, color: '#94A3B8', fontWeight: 500,
              }}>{m / 1000}k</span>
              <span style={{ width: 1, height: 8, background: '#E3DFD4' }}/>
            </div>
          ))}

          {/* Service dots */}
          {services.map((s, i) => {
            const left = pct(s.mileage);
            const yOffset = (i % 2) * 6;
            const color =
              s.status === 'done' ? '#10B981' :
              s.status === 'overdue' ? '#B45309' :
              s.status === 'due_now' ? '#3B82F6' : '#94A3B8';
            const isUpcoming = s.status === 'upcoming';
            return (
              <div key={i} title={`${s.name} · ${s.mileage.toLocaleString()} mi`} style={{
                position: 'absolute', left: `${left}%`, top: 14 + yOffset,
                transform: 'translateX(-50%)',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: s.primary ? 14 : 10, height: s.primary ? 14 : 10,
                  borderRadius: '50%',
                  background: isUpcoming ? '#fff' : color,
                  border: `2px solid ${color}`,
                  boxShadow: s.primary ? '0 0 0 4px rgba(59,130,246,0.18)' : 'none',
                }}/>
              </div>
            );
          })}

          {/* "you are here" marker */}
          <div style={{
            position: 'absolute', left: `${pct(stats.nowMileage)}%`, top: -10,
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
              fontSize: 9.5, fontWeight: 700, color: '#0B1220',
              background: '#fff', padding: '2px 6px', borderRadius: 4,
              border: '1px solid #E3DFD4', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>YOU · {stats.nowMileage.toLocaleString()}</span>
            <span style={{ width: 2, height: 22, background: '#0B1220', marginTop: 4 }}/>
          </div>
        </div>
      </div>

      {/* Service rows */}
      <div>
        <ScheduleGroup title="Overdue" subtitle="Past the recommended interval — handle this next."
          color="#B45309" services={grouped.overdue} onTaskTap={onTaskTap}/>
        <ScheduleGroup title="Due now" subtitle="Pair these in one visit to save labor."
          color="#3B82F6" services={grouped.due_now} onTaskTap={onTaskTap}/>
        <ScheduleGroup title="On the horizon" subtitle="More than 500 mi out — plan ahead."
          color="#64748B" services={grouped.upcoming} onTaskTap={onTaskTap}/>
        <ScheduleGroup title="Recently completed" subtitle="Logged in the last 12 months."
          color="#10B981" services={grouped.done} collapsed onTaskTap={onTaskTap}/>
      </div>
    </div>
  );
}

function ScheduleGroup({
  title, subtitle, color, services, collapsed, onTaskTap,
}: { title: string; subtitle: string; color: string; services: ScheduleService[]; collapsed?: boolean; onTaskTap?: (typeId: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  if (services.length === 0) return null;
  const visible = collapsed && !expanded ? services.slice(0, 1) : services;
  return (
    <div style={{ borderTop: '1px solid #E3DFD4', padding: '14px 0 12px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }}/>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
          <span style={{
            fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
            fontSize: 10, color: '#94A3B8', fontWeight: 600,
          }}>{services.length}</span>
        </div>
        <span style={{ fontSize: 11.5, color: '#64748B' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.map((s, i) => (
          <ScheduleRow key={i} service={s} accent={color} onTap={onTaskTap}/>
        ))}
        {collapsed && services.length > 1 && (
          <button onClick={() => setExpanded((e) => !e)} style={{
            background: 'transparent', border: 'none', padding: '6px 0',
            fontSize: 11.5, color: '#64748B', textAlign: 'left', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            {expanded ? `– hide ${services.length - 1}` : `+ show ${services.length - 1} more completed`}
          </button>
        )}
      </div>
    </div>
  );
}

function ScheduleRow({
  service, accent, onTap,
}: { service: ScheduleService; accent: string; onTap?: (typeId: string, name: string) => void }) {
  // When onTap is provided, render as a button so the entire row is
  // tappable and accessible. Click forwards (typeId, name) so the
  // host can pivot it into a chat prompt or guide-generation call.
  const interactive = !!onTap;
  const baseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '10px 14px',
    background: service.primary ? 'rgba(59,130,246,0.05)' : '#FAF8F2',
    border: `1px solid ${service.primary ? 'rgba(59,130,246,0.22)' : '#E3DFD4'}`,
    borderRadius: 10,
    width: '100%',
    textAlign: 'left',
    color: 'inherit',
    fontFamily: 'inherit',
    cursor: interactive ? 'pointer' : 'default',
    transition: 'background 120ms ease, border-color 120ms ease',
  };
  const body = (
    <>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: '#fff', border: `1px solid ${accent}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: accent, fontSize: 12, fontWeight: 700,
      }}>{statusGlyph(service.status)}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline',
        gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{service.name}</span>
        <span style={{
          fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
          fontFeatureSettings: '"tnum" 1',
          fontSize: 11, color: '#64748B', fontWeight: 500,
        }}>{service.mileage.toLocaleString()} mi</span>
        <span style={{ fontSize: 11.5, color: '#475569' }}>· {service.note}</span>
      </div>
      {interactive && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#94A3B8', flexShrink: 0 }} aria-hidden>
          <path d="m9 6 6 6-6 6"/>
        </svg>
      )}
    </>
  );
  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onTap?.(service.typeId, service.name)}
        style={baseStyle}
        aria-label={`Open guide for ${service.name}`}
      >
        {body}
      </button>
    );
  }
  return <div style={baseStyle}>{body}</div>;
}

function statusGlyph(status: ScheduleServiceStatus): string {
  switch (status) {
    case 'done': return '\u2713'; // ✓
    case 'overdue': return '!';
    case 'due_now': return '\u23F1'; // ⏱ (clock)
    case 'upcoming': return '\u2192'; // →
  }
}

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
