'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MaintenanceSuggestion } from '@/lib/maintenance-suggestions';

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
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function VehicleHub({
  vehicle,
  slug,
  isAuthed,
  counts,
  currentMileage,
  maintenanceSuggestions,
  opener,
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

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, timestamp: Date.now() }]);

    // v2 will fire POST /api/chat here with vehicle context + history,
    // stream the reply, persist via ChatSession, log to ChatPromptInsight.
    // For v1 we stub a placeholder reply so the UX feels real during
    // design review.
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '_(v1 stub — chat backend wires in batch 2)_ I have your vehicle context loaded. The next batch hooks me up to the real Claude API with caching, history persistence, and the prompt-injection guardrails we agreed on.',
        timestamp: Date.now(),
      }]);
      setPending(false);
    }, 350);
  };

  return (
    <div className="hub-stage">
      <VehicleRail
        vehicle={vehicle}
        currentMileage={currentMileage}
        counts={counts}
      />

      <section className="hub-col">
        <TopBar slug={slug} />

        {!isAuthed && <AnonymousGate />}

        <div ref={scrollRef} className="hub-conv">
          <div className="hub-ambient">
            <div className="hub-blob b1" /><div className="hub-blob b2" /><div className="hub-blob b3" />
          </div>

          <Greeting
            vehicle={vehicle}
            cta={opener.cta}
            onPick={(prompt) => { setInput(prompt); composerRef.current?.focus(); }}
          />

          {messages.map((m, i) => (
            m.role === 'user'
              ? <div key={i} className="row-user"><div className="bubble-user">{m.content}</div></div>
              : <Au7oReply key={i} content={m.content} />
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
  vehicle, currentMileage, counts,
}: { vehicle: VehicleHubProps['vehicle']; currentMileage: number | null; counts: VehicleHubProps['counts'] }) {
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
        <div className="thread-empty">No saved conversations yet.</div>
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
        .thread-list { padding: 0 24px; }
        .thread-empty { font-size: 12.5px; color: #94A3B8; }
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

/* ─── Top bar ─── */
function TopBar({ slug }: { slug: string }) {
  return (
    <div className="topbar">
      <div className="tb-left">
        <span className="eyebrow-inline">Conversation</span>
        <span className="tb-sep">·</span>
        <span style={{ color: '#334155' }}>Symptoms &amp; maintenance</span>
      </div>
      <div className="tb-right">
        <Link href="/drive" className="chip">Open Drive</Link>
        <a href={`/${slug.split('-').slice(1).join('-')}`} className="chip" style={{ pointerEvents: 'none', opacity: 0.5 }}>Library</a>
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
        .chip {
          padding: 6px 11px; border-radius: 999px;
          background: #fff; border: 1px solid #E3DFD4;
          font-size: 12px; font-weight: 500; color: #0B1220;
          text-decoration: none; cursor: pointer;
        }
        .chip:hover { background: #EFEDE6; }
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
  vehicle, cta, onPick,
}: { vehicle: VehicleHubProps['vehicle']; cta: string[]; onPick: (prompt: string) => void }) {
  return (
    <div className="greet">
      <span className="greet-eyebrow">
        <span className="pulse-dot" /> AU7O FOR YOUR {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()}
      </span>
      <h1>
        {greetingFor()}.
        <span className="muted"> What's on your mind today?</span>
      </h1>
      <div className="prompt-row">
        {cta.map((label, i) => (
          <button key={i} className="chip" onClick={() => onPick(label)}>{label}</button>
        ))}
      </div>
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

/* ─── Au7o reply bubble ─── */
function Au7oReply({ content }: { content: string }) {
  return (
    <div className="row-au7o">
      <Image src="/og-image.png" alt="" width={32} height={32} className="avatar" />
      <div className="body">
        <div className="bubble-au7o">{renderMarkdownLite(content)}</div>
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
      `}</style>
    </div>
  );
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
