'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { downscaleImage } from '@/lib/downscale-image';
import { extractVideoFrames } from '@/lib/video-extract';
import { LiveCameraShutter } from '@/components/diagnose/LiveCameraShutter';
import { VisionResultCard, AnnotatedPhoto, type VisionResult } from '@/components/vehicle/VisionResultCard';
import { InlineGateCard, type GateInfo } from '@/components/vehicle/InlineGateCard';

/**
 * ModelIssueSearch — the unified "find your issue" bar on a known-issues page:
 *   • type it   — FREE fuzzy/keyword (client-side, $0, SEO-safe)
 *   • describe it — PLUS AI natural-language match (/api/issue-search, gated)
 *   • show it   — camera (photo/video) → /api/vision, quota-gated per tier
 *
 * Replaces the old standalone ConfirmWithPhotoCTA. Result clicks set the URL
 * hash → KnownIssueCard expands + scrolls to itself. The page stays statically
 * cached (subscriber check is client-side; matcher + vision gate server-side).
 */

type LiteIssue = { id: string; title: string; symptoms?: string[]; dtcCodes?: string[]; severity?: string };
type Result = { id: string; title: string; severity?: string; confidence?: number };

const sevDot = (s?: string) => s === 'high' ? '#DC2626' : s === 'low' ? '#94A3B8' : '#D97706';

function fuzzyRank(query: string, issues: LiteIssue[]): Result[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const toks = q.split(/\s+/).filter((t) => t.length > 1);
  const scored = issues.map((it) => {
    const title = it.title.toLowerCase();
    const hay = `${title} ${(it.symptoms || []).join(' ')} ${(it.dtcCodes || []).join(' ')}`.toLowerCase();
    let s = 0;
    if ((it.dtcCodes || []).some((d) => d.toLowerCase() === q)) s += 100;
    if (title.includes(q)) s += 25;
    for (const t of toks) { if (title.includes(t)) s += 5; else if (hay.includes(t)) s += 2; }
    return { it, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
  return scored.map((x) => ({ id: x.it.id, title: x.it.title, severity: x.it.severity }));
}

export function ModelIssueSearch({
  issues,
  make,
  model,
  hubHref,
}: {
  issues: LiteIssue[];
  make: string;
  model: string;
  hubHref: string;
}) {
  const { data: session } = useSession();
  const isSubscriber = (session?.user as { subscriptionStatus?: string } | undefined)?.subscriptionStatus === 'active';

  const [query, setQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [aiResults, setAiResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [gated, setGated] = useState(false);
  const [searched, setSearched] = useState(false);

  // camera / vision
  const [camOpen, setCamOpen] = useState(false);
  const [vision, setVision] = useState<VisionResult | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionGate, setVisionGate] = useState<GateInfo | null>(null);
  const [visionErr, setVisionErr] = useState<string | null>(null);

  const fuzzy = useMemo(() => (aiMode ? [] : fuzzyRank(query, issues)), [query, issues, aiMode]);

  const runAi = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) return;
    if (!isSubscriber) { setGated(true); return; }
    setLoading(true); setGated(false); setAiResults(null); setSearched(true);
    try {
      const res = await fetch('/api/issue-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, make, model, issues: issues.map((i) => ({ id: i.id, title: i.title, symptoms: i.symptoms, dtcCodes: i.dtcCodes })) }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 402) { setGated(true); setLoading(false); return; }
      const data = await res.json().catch(() => ({}));
      const byId = new Map(issues.map((i) => [i.id, i]));
      const rs: Result[] = (data.matches || [])
        .filter((m: { confidence: number }) => (m.confidence ?? 0) >= 0.45)
        .map((m: { id: string; confidence: number }) => { const it = byId.get(m.id); return it ? { id: it.id, title: it.title, severity: it.severity, confidence: m.confidence } : null; })
        .filter(Boolean);
      setAiResults(rs);
    } catch { setAiResults([]); }
    setLoading(false);
  }, [query, isSubscriber, make, model, issues]);

  // Camera capture → /api/vision (quota-gated per tier, server-side).
  const onCaptured = useCallback(async (kind: 'photo' | 'video', file: File) => {
    setCamOpen(false); setVisionLoading(true); setVision(null); setVisionGate(null); setVisionErr(null);
    const previewUrl = URL.createObjectURL(file);
    try {
      let fd: FormData; let timeout: number;
      if (kind === 'video') {
        const ex = await extractVideoFrames(file, 4);
        if (ex.frames.length === 0) { setVisionErr("Couldn't read that video — try MP4/MOV."); setVisionLoading(false); return; }
        fd = new FormData(); ex.frames.forEach((f, i) => fd.append('frames', f, `frame_${i}.jpg`)); if (ex.audio) fd.append('audio', ex.audio, ex.audio.name); timeout = 90_000;
      } else {
        const ds = await downscaleImage(file); fd = new FormData(); fd.append('image', ds, 'snap.jpg'); timeout = 75_000;
      }
      fd.append('vehicle', JSON.stringify({ make, model }));
      if (typeof navigator !== 'undefined' && navigator.language) fd.append('lang', navigator.language);
      const res = await fetch('/api/vision', { method: 'POST', body: fd, signal: AbortSignal.timeout(timeout) });
      const data = await res.json().catch(() => ({}));
      if ((res.status === 401 || res.status === 429) && data.gated) {
        setVisionGate({ message: data.message ?? 'Upgrade to keep diagnosing.', ctaUrl: data.ctaUrl ?? '/subscribe', ctaLabel: data.ctaLabel ?? 'Upgrade to Plus', secondaryCtaUrl: data.secondaryCtaUrl, secondaryCtaLabel: data.secondaryCtaLabel, resetAt: data.resetAt });
        setVisionLoading(false); return;
      }
      if (!res.ok) { setVisionErr(data.message || 'That didn’t go through — try again.'); setVisionLoading(false); return; }
      const v = (data.vision ?? data) as VisionResult;
      v.imagePreviewUrl = previewUrl;
      setVision(v);
    } catch (e) {
      setVisionErr(e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError') ? 'That took too long — try a shorter, clearer capture.' : 'Upload failed — check your connection.');
    }
    setVisionLoading(false);
  }, [make, model]);

  const jump = (id: string) => {
    try { window.location.hash = `#${id}`; } catch { /* */ }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); if (aiMode) runAi(); };
  const showFuzzy = !aiMode && query.trim().length >= 2;
  const showAi = aiMode && searched && !loading && !gated;

  return (
    <div className="bg-white border border-[#E3DFD4] rounded-xl p-3 sm:p-4 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={() => { setAiMode(false); setGated(false); }}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${!aiMode ? 'bg-[#0B1220] text-white' : 'bg-[#EFEDE6] text-[#475569]'}`}>Search</button>
        <button type="button" onClick={() => setAiMode(true)}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1 ${aiMode ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' : 'bg-[#EFEDE6] text-[#475569]'}`}>
          ✨ AI search {!isSubscriber && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-200 text-amber-800">PLUS</span>}
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (aiMode) { setSearched(false); setAiResults(null); } }}
            placeholder={aiMode ? `Describe it — e.g. "rattles on cold start"` : `Search ${make} ${model} issues, a symptom, or a code…`}
            className="w-full pl-9 pr-11 py-2.5 text-sm bg-[#FAF8F2] border border-[#E3DFD4] rounded-lg outline-none focus:border-blue-400 text-[#0B1220]"
          />
          {/* Camera — snap a photo/video to match (quota-gated per tier). */}
          <button type="button" onClick={() => setCamOpen(true)} aria-label="Show it — snap a photo or video"
            title="Snap a photo or video to match your issue"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-[#475569] hover:bg-[#EFEDE6]">
            <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-3h8l2 3h3v13H3V7z" /><circle cx="12" cy="13" r="4" /></svg>
          </button>
        </div>
        {aiMode && (
          <button type="submit" disabled={loading || query.trim().length < 2}
            className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white disabled:opacity-50">{loading ? '…' : 'Find it'}</button>
        )}
      </form>

      {gated && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-sm font-medium text-indigo-900">Describe it in plain English — AI finds the match.</p>
          <p className="text-xs text-indigo-700 mt-0.5 mb-2">Continue in your vehicle Hub to try Au7o for free. Keyword search stays available here.</p>
          <Link href={hubHref} className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">Try it free in your Hub →</Link>
        </div>
      )}

      {showFuzzy && (
        fuzzy.length > 0 ? (
          <ul className="mt-2 divide-y divide-[#F1EFE8]">
            {fuzzy.map((r) => (
              <li key={r.id}><button type="button" onClick={() => jump(r.id)} className="w-full text-left py-2 px-1 flex items-center gap-2 hover:bg-[#FAF8F2] rounded">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sevDot(r.severity) }} /><span className="text-sm text-[#334155]">{r.title}</span>
              </button></li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-[#64748B] px-1">No keyword match. Try <button type="button" onClick={() => setAiMode(true)} className="text-blue-600 underline">AI search</button> to describe it.</p>
        )
      )}

      {showAi && (
        (aiResults && aiResults.length > 0) ? (
          <ul className="mt-3 divide-y divide-[#F1EFE8]">
            {aiResults.map((r) => (
              <li key={r.id}><button type="button" onClick={() => jump(r.id)} className="w-full text-left py-2 px-1 flex items-center gap-2 hover:bg-[#FAF8F2] rounded">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sevDot(r.severity) }} /><span className="text-sm text-[#334155] flex-1">{r.title}</span>
                {typeof r.confidence === 'number' && r.confidence >= 0.8 && <span className="text-[10px] text-emerald-700 font-medium">strong match</span>}
              </button></li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-lg border border-[#E3DFD4] bg-[#FAF8F2] p-3">
            <p className="text-sm text-[#334155]">Couldn&apos;t pin that to a documented issue — let&apos;s diagnose it directly.</p>
            <Link href={`/diagnose?q=${encodeURIComponent(query.trim())}`} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold bg-[#0B1220] text-white px-3 py-1.5 rounded-md hover:bg-[#1e293b]">Describe it to the mechanic →</Link>
          </div>
        )
      )}

      {/* Vision states */}
      {visionLoading && <p className="mt-3 text-sm text-[#475569] flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" /> Analyzing your {visionGate ? '' : ''}capture…</p>}
      {visionErr && <p className="mt-3 text-sm text-[#B91C1C]">{visionErr}</p>}
      {visionGate && <div className="mt-3"><InlineGateCard gate={visionGate} /></div>}
      {vision && (
        <div className="mt-3">
          <div className="bg-white border border-[#E3DFD4] rounded-lg overflow-hidden mb-2"><AnnotatedPhoto vision={vision} /></div>
          <VisionResultCard vision={vision} />
          <button type="button" onClick={() => { setVision(null); }} className="mt-2 text-xs text-[#64748B] underline">Clear</button>
        </div>
      )}

      {/* Fullscreen camera */}
      {camOpen && (
        <LiveCameraShutter
          onPhoto={(f) => onCaptured('photo', f)}
          onVideo={(f) => onCaptured('video', f)}
          onClose={() => setCamOpen(false)}
          vehicle={{ make, model }}
          vehicleLabel={`${make} ${model}`}
          enableVoice={isSubscriber}
          labels={{ hint: 'Show the part or problem' }}
        />
      )}
    </div>
  );
}
