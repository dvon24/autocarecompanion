'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import { TechTree } from '@/components/twin/stage/TechTree';
import { TwinDataCtx } from '@/components/twin/twin-context';
import {
  filterKnownIssueViewHistory,
  issuesAtMileage,
  KNOWN_ISSUE_TWIN_PILOT,
  registerDistinctIssueView,
  retainKnownIssueSelection,
  type KnownIssueTwinHotspotId,
  type KnownIssueTwinIssue,
} from '@/lib/known-issue-twin-pilot';

const BASE = '/twin-stage/cadillac/known-issues/base-satin-steel-transparent.webp';
const EFFECTS: Partial<Record<KnownIssueTwinHotspotId, string>> = {
  hood: '/twin-stage/cadillac/known-issues/glow-hood-satin-steel-transparent.webp',
  wheel: '/twin-stage/cadillac/known-issues/glow-wheel-satin-steel-transparent.webp',
  rearwheel: '/twin-stage/cadillac/known-issues/glow-rearwheel-satin-steel-transparent.webp',
  rad: '/twin-stage/cadillac/known-issues/xray-radiator-satin-steel-transparent.webp',
  trans: '/twin-stage/cadillac/known-issues/glow-trans-satin-steel-transparent.webp',
};

const VEHICLE = { year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Sport', engine: '3.6L V6' };

const KnownIssueTechTree = TechTree as unknown as (props: {
  branch: string;
  setBranch: (branch: string) => void;
  miles: number;
  onClose: () => void;
  startNode?: string;
  vertical?: boolean;
  compact?: boolean;
  detailMode?: 'sheet' | null;
  initialView?: 'tree';
  readOnly?: boolean;
  showSchedule?: boolean;
  footer?: ReactNode;
}) => ReactElement;

function issueTitle(issue: KnownIssueTwinIssue): string {
  return issue.title.trim() || 'Published issue — title not recorded';
}

function mileageLabel(issue: KnownIssueTwinIssue): string {
  if (!issue.typicalMileage) return 'Mileage not established';
  return `${issue.typicalMileage.low.toLocaleString()}–${issue.typicalMileage.high.toLocaleString()} mi`;
}

function partPrice(part: KnownIssueTwinIssue['fixParts'][number]): string {
  if (part.priceLow == null && part.priceHigh == null) return 'Price not published';
  if (part.priceLow != null && part.priceHigh != null && part.priceLow !== part.priceHigh) {
    return `$${part.priceLow.toLocaleString()}–$${part.priceHigh.toLocaleString()}`;
  }
  return `$${(part.priceLow ?? part.priceHigh)!.toLocaleString()}`;
}

function partImage(hotspot: KnownIssueTwinHotspotId | undefined): string {
  if (hotspot === 'trans') return '/twin-stage/parts/part-transmission.webp';
  if (hotspot === 'rad') return '/twin-stage/parts/part-radiator.webp';
  if (hotspot === 'wheel' || hotspot === 'rearwheel') return '/twin-stage/parts/part-wheel.webp';
  return '/twin-stage/parts/part-engine.webp';
}

function buildIssueTree(issue: KnownIssueTwinIssue) {
  const symptomIds = issue.symptoms.map((_, index) => `symptom-${index}`);
  const partIds = issue.fixParts.map((_, index) => `part-${index}`);
  const image = partImage(issue.hotspot?.id);
  const nodes: Record<string, Record<string, unknown>> = {
    vehicle: { label: '2020 Cadillac XT6', sub: 'Known-issue decomposition', img: BASE, kids: ['system'], group: true },
    system: { label: issue.explanation.system, sub: 'Affected system recorded for this issue', img: image, kids: ['condition'], group: true },
    condition: {
      label: issueTitle(issue), sub: `${issue.severity} · ${mileageLabel(issue)}`, img: image,
      issue: issue.description || 'No condition description is published for this record.', kids: ['mechanism', 'action'], group: true,
    },
    mechanism: {
      label: 'How the failure develops', sub: issue.explanation.mechanism, img: image,
      issue: issue.explanation.mechanism, kids: symptomIds.length ? ['symptoms'] : [], group: true,
    },
    symptoms: { label: 'What owners may notice', sub: issue.explanation.symptoms, img: image, kids: symptomIds, group: true },
    action: {
      label: issue.recallFirst ? 'Recall / dealer action' : 'Repair / dealer action', sub: issue.explanation.action,
      img: image, issue: issue.explanation.action, kids: partIds, group: true,
    },
  };

  issue.symptoms.forEach((symptom, index) => {
    nodes[`symptom-${index}`] = { label: symptom, sub: 'Published symptom', img: image, kids: [] };
  });
  issue.fixParts.forEach((part, index) => {
    nodes[`part-${index}`] = {
      label: part.component,
      sub: part.recallFirst ? 'Recall-first repair item' : 'Verified repair product',
      img: image,
      kids: [],
      partNo: part.oemPartNumber || '—',
      brand: part.note || part.component,
      spec: part.fitmentScope || 'Allowed by the current fitment guard; confirm exact vehicle fitment before purchase.',
      fitmentReviewed: part.fitmentConfirmed === true,
      price: partPrice(part),
      buyUrl: part.buyLinks[0]?.url,
      products: part.buyLinks.map((link) => ({
        label: part.component,
        brand: link.vendor,
        partNo: part.oemPartNumber || '—',
        spec: part.fitmentScope || part.note,
        price: partPrice(part),
        buyUrl: link.url,
        buyLabel: `View at ${link.vendor}`,
      })),
    };
  });
  return { label: issueTitle(issue), short: 'Known issue', root: 'vehicle', nodes };
}

function Au7oExplains({ issue }: { issue: KnownIssueTwinIssue }) {
  return (
    <aside className="px-4 py-3 sm:px-5" aria-label="Au7o explains this Tech Tree">
      <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7C3AED]">Au7o explains</div>
      <p className="mt-1 text-xs leading-5 text-[#263247] sm:text-sm">{issue.explanation.narrative}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#64748B]">Grounded in this published issue record and its guarded commerce. This organizes evidence; it is not a diagnosis.</p>
    </aside>
  );
}

function TreeOverlay({ issue, mileage, close }: { issue: KnownIssueTwinIssue; mileage: number; close: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  const tree = useMemo(() => buildIssueTree(issue), [issue]);
  const setBranch = useCallback(() => {}, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    const closeButton = dialog?.querySelector<HTMLElement>('button[title="Close tech tree"]');
    (closeButton || focusables()[0] || dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = priorOverflow;
      previousFocus.current?.focus();
    };
  }, [close]);

  const contextValue = useMemo(() => ({ vehicle: VEHICLE, miles: mileage, trees: { car: tree }, mode: 'demo' as const }), [mileage, tree]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(8,11,18,.62)] p-0 backdrop-blur-[6px] sm:p-7" role="dialog" aria-modal="true" aria-label={`${issueTitle(issue)} Tech Tree`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} tabIndex={-1} className="ki-theme-warm h-full w-full overflow-hidden bg-[var(--ki-page)] text-[var(--ink)] shadow-[0_30px_80px_rgba(0,0,0,.45)] outline-none sm:max-h-[760px] sm:max-w-[1180px] sm:rounded-[18px] sm:border sm:border-[var(--ki-line)]">
        <TwinDataCtx.Provider value={contextValue}>
          <KnownIssueTechTree branch="car" setBranch={setBranch} miles={mileage} onClose={close} startNode="condition" vertical={mobile} compact={mobile} detailMode={mobile ? 'sheet' : null} initialView="tree" readOnly showSchedule={false} footer={<Au7oExplains issue={issue} />} />
        </TwinDataCtx.Provider>
      </div>
    </div>
  );
}

function PilotGate() {
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <section className="my-8 border-y border-[#DDD6C9] py-7 text-center">
      <h2 className="text-xl font-bold">Keep exploring this XT6 visually</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#526076]">Known Issues Visual is $4.99/month for this model’s visual issue experience. It excludes maintenance tracking and AI chat. The $14.99/month Hub includes the complete vehicle experience.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => { setAcknowledged(true); trackEvent('known_issue_twin_visual_plan_intent', { model: 'cadillac-xt6', year: 2020, price: 4.99 }); }} className="rounded-full bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white">Known Issues Visual · $4.99/mo</button>
        <Link href="/subscribe?tier=plus" className="rounded-full bg-[#0B1220] px-5 py-3 text-sm font-bold text-white">Full Hub · $14.99/mo</Link>
      </div>
      <p className="mt-3 text-xs text-[#6B7280]" role="status">{acknowledged ? 'Interest recorded for this dev preview. No purchase was made.' : 'This dev preview does not charge you. Written Known Issues cards below remain available.'}</p>
    </section>
  );
}

export function KnownIssueTwinPilot({ issues }: { issues: KnownIssueTwinIssue[] }) {
  const hasDocumentedMileage = issues.some((issue) => issue.typicalMileage != null);
  const [mileage, setMileage] = useState(() => issues.find((issue) => issue.typicalMileage)?.typicalMileage?.low ?? 50_000);
  const [showAll, setShowAll] = useState(() => !hasDocumentedMileage);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [viewed, setViewed] = useState<string[]>([]);
  const [gated, setGated] = useState(false);
  const [restored, setRestored] = useState(false);
  const visible = useMemo(() => showAll ? issues : issuesAtMileage(issues, mileage), [issues, mileage, showAll]);
  const selected = issues.find((issue) => issue.id === selectedId) ?? null;
  const visual = issues.find((issue) => issue.id === (previewId ?? selectedId)) ?? null;
  const activeEffect = visual?.hotspot?.id ?? null;
  const maxMileage = Math.max(150_000, ...issues.flatMap((issue) => issue.typicalMileage ? [issue.typicalMileage.high + 10_000] : []));
  const markerGroups = useMemo(() => {
    const grouped = new Map<KnownIssueTwinHotspotId, KnownIssueTwinIssue[]>();
    for (const issue of visible) {
      if (!issue.hotspot) continue;
      const current = grouped.get(issue.hotspot.id) || [];
      current.push(issue);
      grouped.set(issue.hotspot.id, current);
    }
    return [...grouped.entries()].map(([hotspotId, rows]) => ({ hotspotId, rows, hotspot: rows[0]!.hotspot! }));
  }, [visible]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw: unknown = JSON.parse(sessionStorage.getItem(KNOWN_ISSUE_TWIN_PILOT.sessionKey) || '[]');
        const current = filterKnownIssueViewHistory(Array.isArray(raw) ? raw : [], issues.map((issue) => issue.id));
        setViewed(current); setGated(current.length >= 2);
        if (current.length >= 2) trackEvent('known_issue_twin_gate_shown', { model: 'cadillac-xt6', year: 2020, restored: true });
      } catch { setViewed([]); setGated(false); }
      setRestored(true);
    });
    return () => { cancelled = true; };
  }, [issues]);

  const closeTree = useCallback(() => setSelectedId(null), []);

  function setRange(nextMileage: number, nextShowAll = showAll) {
    setMileage(nextMileage); setShowAll(nextShowAll);
    const nextVisible = nextShowAll ? issues : issuesAtMileage(issues, nextMileage);
    const retained = retainKnownIssueSelection(selectedId, nextVisible.map((issue) => issue.id));
    setSelectedId(retained); if (!retained) setPreviewId(null);
  }

  function selectIssue(issue: KnownIssueTwinIssue) {
    if (gated) return;
    const next = registerDistinctIssueView(viewed, issue.id);
    setViewed(next.viewedIssueIds);
    try { sessionStorage.setItem(KNOWN_ISSUE_TWIN_PILOT.sessionKey, JSON.stringify(next.viewedIssueIds)); } catch { /* in-memory fallback */ }
    trackEvent('known_issue_twin_issue_selected', { issue_id: issue.id, distinct_selection: next.isNew, distinct_count: next.viewedIssueIds.length });
    if (next.gated) {
      setGated(true); setSelectedId(null);
      trackEvent('known_issue_twin_gate_shown', { issue_id: issue.id, restored: false });
      return;
    }
    setSelectedId(issue.id); setPreviewId(null);
  }

  function selectMarker(rows: KnownIssueTwinIssue[]) {
    const next = rows.find((issue) => !viewed.includes(issue.id)) || rows[0];
    if (next) selectIssue(next);
  }

  if (!restored) return null;
  if (gated) return <PilotGate />;

  return (
    <section aria-label="Interactive 2020 Cadillac XT6 Known Issues visual" className="my-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7C3AED]">Visual Known Issues · 2020 Cadillac XT6</div><p className="mt-1 text-xs text-[#64748B]">Hover or focus to preview. Click or tap to open the Tech Tree.</p></div>
        <button type="button" onClick={() => setRange(mileage, !showAll)} className="min-h-11 rounded-full border border-[#DDD6C9] bg-white px-4 text-xs font-bold">{showAll ? 'Use mileage' : 'Show all'}</button>
      </div>
      {!showAll && <div className="flex items-center gap-3"><input aria-label="Known issue mileage timeline" className="w-full accent-[#7C3AED]" type="range" min="0" max={maxMileage} step="1000" value={Math.min(mileage, maxMileage)} onChange={(event) => setRange(Number(event.target.value), false)} /><output className="min-w-20 text-right text-xs font-bold">{mileage.toLocaleString()} mi</output></div>}
      <div className="relative mx-auto aspect-[3/2] w-full max-w-4xl">
        <Image src={BASE} alt="2020 Cadillac XT6 transparent vehicle visual" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-contain" />
        {Object.entries(EFFECTS).map(([hotspotId, src]) => <Image key={hotspotId} src={src} alt="" fill sizes="(max-width: 896px) 100vw, 896px" aria-hidden="true" className={`pointer-events-none object-contain transition-opacity duration-300 ${activeEffect === hotspotId ? 'opacity-100' : 'opacity-0'}`} />)}
        {markerGroups.map(({ hotspotId, rows, hotspot }) => <button key={hotspotId} type="button" aria-label={`${hotspot.label}: ${rows.length} published ${rows.length === 1 ? 'issue' : 'issues'}`} onMouseEnter={() => setPreviewId(rows[0]!.id)} onMouseLeave={() => setPreviewId(null)} onFocus={() => setPreviewId(rows[0]!.id)} onBlur={() => setPreviewId(null)} onClick={() => selectMarker(rows)} style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }} className="absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#7C3AED]/90 text-xs font-bold text-white shadow-[0_0_0_5px_rgba(124,58,237,.2)] transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#A78BFA]/45">{rows.length}</button>)}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {visible.length ? visible.map((issue) => <button key={issue.id} type="button" onMouseEnter={() => setPreviewId(issue.id)} onMouseLeave={() => setPreviewId(null)} onFocus={() => setPreviewId(issue.id)} onBlur={() => setPreviewId(null)} onClick={() => selectIssue(issue)} className="min-h-11 min-w-[220px] rounded-xl border border-[#DDD6C9] bg-white p-3 text-left text-sm font-semibold"><span className="block">{issueTitle(issue)}</span><span className="mt-1 block text-[11px] font-normal text-[#64748B]">{mileageLabel(issue)}{!issue.hotspot ? ' · Visual location not established' : ''}</span></button>) : <p className="text-sm text-[#64748B]">No published issue has a documented mileage range here. Move the timeline or choose Show all.</p>}
      </div>
      {selected && <TreeOverlay issue={selected} mileage={mileage} close={closeTree} />}
    </section>
  );
}

export default KnownIssueTwinPilot;
