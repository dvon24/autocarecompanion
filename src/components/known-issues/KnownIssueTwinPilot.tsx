'use client';

import Image from 'next/image';
import Link from 'next/link';
import { currentKnownIssueAnchor, openKnownIssueArticle, subscribeKnownIssueNavigation } from '@/lib/known-issue-navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import { TechTree } from '@/components/twin/stage/TechTree';
import { TwinDataCtx } from '@/components/twin/twin-context';
import { IssueCategoryIcon, IssueSeverityIcon } from './IssueCategoryIcon';
import { useKnownIssueTwinFilter } from './KnownIssueTwinFilterContext';
import { buildIssueTree } from '@/lib/known-issue-twin-tree';
import { VisualSignupForm } from './VisualSignupForm';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';
import { KnownIssueTwinRepairLinks } from './KnownIssueTwinRepairLinks';
import { allowedPreviewCheckoutLinks, type PreviewCheckoutLinks } from '@/lib/visual-preview-checkout';
import {
  filterKnownIssueViewHistory,
  highestKnownIssueTwinSeverity,
  issuesAtMileage,
  KNOWN_ISSUE_TWIN_SEVERITY,
  knownIssueTwinMarkerMode,
  registerDistinctIssueView,
  retainKnownIssueSelection,
  type KnownIssueTwinHotspotId,
  type KnownIssueTwinIssue,
} from '@/lib/known-issue-twin-pilot';

import { XT6_KNOWN_ISSUE_VISUAL, type KnownIssueTwinVisualDefinition } from '@/lib/known-issue-twin-visuals';

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


function hotspotIconCategory(hotspot: KnownIssueTwinHotspotId): KnownIssueTwinIssue['category'] {
  if (hotspot === 'assistance') return 'safety';
  if (hotspot === 'fuel') return 'fuel';
  if (hotspot === 'trans') return 'transmission';
  if (hotspot === 'rad') return 'cooling';
  if (hotspot === 'wheel') return 'brakes';
  if (hotspot === 'rearwheel') return 'suspension';
  if (hotspot === 'glass') return 'electrical';
  if (hotspot === 'cooling') return 'cooling';
  if (hotspot === 'steering') return 'steering';
  if (hotspot === 'camera') return 'safety';
  if (hotspot === 'roof') return 'body';
  return 'engine';
}


function Au7oExplains({ issue }: { issue: KnownIssueTwinIssue }) {
  return (
    <aside className="px-4 py-3 sm:px-5" aria-label="Au7o explains this Tech Tree">
      <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7C3AED]">Au7o explains</div>
      {issue.applicability && <p className="mt-1 text-xs leading-5 text-[#526076]">{issue.applicability}</p>}
      <p className="mt-1 text-xs leading-5 text-[#263247] sm:text-sm"><strong>What’s wrong: </strong>{issue.explanation.issueSentence}</p>
      <p className="mt-1 text-xs leading-5 text-[#263247] sm:text-sm"><strong>How to fix: </strong>{issue.explanation.repairSentence.replace(/^Fix:\s*/, '')}<KnownIssueTwinRepairLinks issue={issue} /></p>
      <a href={`#${encodeURIComponent(issue.id)}`} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); openKnownIssueArticle(issue.id);
      }} className="mt-2 inline-block text-xs font-semibold text-[#2563EB] underline">Read the full issue</a>
      <p className="mt-1 text-[10px] leading-4 text-[#64748B]">From the published issue. Guidance, not a diagnosis.</p>
    </aside>
  );
}

function IssueChooser({
  hotspotId,
  hotspotLabel,
  rows,
  left,
  top,
  phoneTop,
  choose,
  close,
  preview,
}: {
  hotspotId: KnownIssueTwinHotspotId;
  hotspotLabel: string;
  rows: KnownIssueTwinIssue[];
  left: number;
  top: number;
  phoneTop: number;
  choose: (issue: KnownIssueTwinIssue) => void;
  close: () => void;
  preview: (issueId: string | null) => void;
}) {
  const chooserRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chooserRef.current?.querySelector<HTMLButtonElement>('button[data-issue-choice]')?.focus();
  }, []);

  const horizontalShift = left >= 65 ? '-88%' : left < 35 ? '-12%' : '-50%';
  return (
    <div
      id={`known-issue-chooser-${hotspotId}`}
      ref={chooserRef}
      role="dialog"
      aria-label={`Choose a ${hotspotLabel} issue`}
      style={{ '--chooser-left': `${left}%`, '--chooser-top': `calc(${top}% + 28px)`, '--chooser-shift': horizontalShift, '--chooser-phone-top': `calc(${phoneTop}% + 28px)` } as CSSProperties}
      className="absolute left-1/2 top-[var(--chooser-phone-top)] z-30 w-72 max-w-[calc(100%_-_1.5rem)] -translate-x-1/2 rounded-xl border border-[#D7D0C3] bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,.22)] sm:left-[var(--chooser-left)] sm:top-[var(--chooser-top)] sm:translate-x-[var(--chooser-shift)]"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) preview(null);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }
        if (event.key !== 'Tab') return;
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <p className="text-xs font-bold text-[#263247]">Choose an issue</p>
        <button type="button" onClick={close} aria-label="Close issue chooser" className="grid h-8 w-8 place-items-center rounded-full text-lg text-[#526076] hover:bg-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">×</button>
      </div>
      <div className="mt-1 grid gap-1">
        {rows.map((issue) => {
          const severity = KNOWN_ISSUE_TWIN_SEVERITY[issue.severity];
          return (
            <button
              key={issue.id}
              data-issue-choice
              type="button"
              onMouseEnter={() => preview(issue.id)}
              onMouseLeave={() => preview(null)}
              onFocus={() => preview(issue.id)}
              onClick={() => choose(issue)}
              className="flex min-h-11 w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              <IssueSeverityIcon severity={issue.severity} className="mt-0.5 h-4 w-4 shrink-0 text-[#5B4A64]" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-4 text-[#172033]">{issueTitle(issue)}</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[.08em] text-[#64748B]">{severity.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TreeOverlay({
  issue,
  mileage,
  close,
  returnFocusId,
  definition,
}: {
  issue: KnownIssueTwinIssue;
  mileage: number;
  close: () => void;
  returnFocusId: string;
  definition: KnownIssueTwinVisualDefinition;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  const tree = useMemo(() => buildIssueTree(issue, definition), [issue, definition]);
  const setBranch = useCallback(() => {}, []);

  useEffect(() => {
    // Match the Hub's phone/tablet breakpoint and vertical sheet layout.
    const media = window.matchMedia('(max-width: 859px)');
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
      const returnFocus = document.getElementById(returnFocusId) as HTMLElement | null;
      (returnFocus || previousFocus.current)?.focus();
    };
  }, [close, returnFocusId]);

  const contextValue = useMemo(() => ({ vehicle: definition.identity, miles: mileage, trees: { car: tree }, mode: 'demo' as const }), [mileage, tree, definition]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(8,11,18,.62)] p-0 backdrop-blur-[6px] sm:p-7" role="dialog" aria-modal="true" aria-label={`${issueTitle(issue)} Tech Tree`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} tabIndex={-1} className="ki-theme-warm h-full w-full overflow-hidden bg-[var(--ki-page)] text-[var(--ink)] shadow-[0_30px_80px_rgba(0,0,0,.45)] outline-none sm:max-h-[760px] sm:max-w-[1180px] sm:rounded-[18px] sm:border sm:border-[var(--ki-line)]">
        <TwinDataCtx.Provider value={contextValue}>
          <KnownIssueTechTree branch="car" setBranch={setBranch} miles={mileage} onClose={close} startNode="mechanism" vertical={mobile} compact={mobile} detailMode={mobile ? 'sheet' : null} initialView="tree" readOnly showSchedule={false} footer={<Au7oExplains issue={issue} />} />
        </TwinDataCtx.Provider>
      </div>
    </div>
  );
}

function PilotGate({ definition, checkoutLinks, enrollmentEnabled, authenticated }: { definition: KnownIssueTwinVisualDefinition; checkoutLinks: PreviewCheckoutLinks | null; enrollmentEnabled: boolean; authenticated: boolean }) {
  const [returnTo, setReturnTo] = useState(definition.returnPath);
  useEffect(() => {
    const capture = () => { if (window.location.pathname.startsWith('/known-issues/')) setReturnTo(window.location.pathname + window.location.search + window.location.hash); };
    capture(); return subscribeKnownIssueNavigation(capture);
  }, []);
  const [acknowledged, setAcknowledged] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <section className="my-8 border-y border-[#DDD6C9] py-7 text-center">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none">Keep exploring this {definition.identity.model} visually</h2>
      <PilotEnrollmentOffer preview={Boolean(checkoutLinks)}>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#526076]">Visual Known Issues will cover all available visual models for $4.99/month. It excludes maintenance tracking and AI chat. The $14.99/month Hub adds your personal vehicle, maintenance, service records and AI assistance. US launch only.</p>
      </PilotEnrollmentOffer>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <PilotEnrollmentOffer preview={Boolean(checkoutLinks)}>
        {enrollmentEnabled ? <Link href={`${authenticated ? '/subscribe' : '/auth/signup'}?product=visual&returnTo=${encodeURIComponent(returnTo)}`} className="rounded-full bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white">Unlock Visuals · $4.99/month</Link> : checkoutLinks ?
          <a href={checkoutLinks.visual} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white">Unlock Visuals · $4.99/month</a>
        :
          <button type="button" onClick={() => { setAcknowledged(true); trackEvent('known_issue_twin_visual_plan_intent', { model: definition.slug, year: definition.year, price: 4.99 }); }} className="rounded-full bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white">Visual launch signup · $4.99/mo</button>
        }
        </PilotEnrollmentOffer>
        <Link href={`/demo/hub?vehicle=${definition.twinId}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0B1220] px-5 py-3 text-sm font-bold text-white">Test the Hub · Free demo</Link>
      </div>
      <p className="mt-2 text-sm text-[#526076]">Try the interactive {definition.identity.model} demo first. No account or payment needed.</p>
      <PilotEnrollmentOffer preview={Boolean(checkoutLinks)}>
      {acknowledged && <VisualSignupForm />}
      </PilotEnrollmentOffer>
      <p className="mt-3 text-xs text-[#6B7280]">{enrollmentEnabled ? 'Visual has no subscription trial. Verify your account and review the monthly charge before payment.' : checkoutLinks ? 'Stripe sandbox test only. Visual has no subscription trial. Completing test checkout does not unlock an account or change Hub access.' : 'No payment is collected here.'} Written Known Issues below remain free.</p>
    </section>
  );
}

function PilotEnrollmentOffer({ preview, children }: { preview: boolean; children: React.ReactNode }) {
  // Only already-validated development test links may preview the offer locally.
  return preview ? children : <EnrollmentOfferGate>{children}</EnrollmentOfferGate>;
}

export function KnownIssueTwinPilot({ issues: sourceIssues, definition = XT6_KNOWN_ISSUE_VISUAL, previewCheckoutLinks }: { issues: KnownIssueTwinIssue[]; definition?: KnownIssueTwinVisualDefinition; previewCheckoutLinks?: PreviewCheckoutLinks }) {
  const issues = useMemo(() => sourceIssues.filter(issue => issue.hotspot && (issue.visualId === definition.twinId || (!issue.visualId && definition.twinId === 'xt6'))), [sourceIssues, definition]);
  const BASE=definition.base;
  const checkoutLinks = allowedPreviewCheckoutLinks(previewCheckoutLinks, process.env.NODE_ENV);
  const twinFilter = useKnownIssueTwinFilter();
  const equipmentCompatible = !twinFilter?.selectedTrim || twinFilter.selectedTrim.toLowerCase() === definition.identity.trim.toLowerCase();
  const setActiveIssueIds = twinFilter?.setActiveIssueIds;
  const [mileage, setMileage] = useState(() => issues.find((issue) => issue.typicalMileage)?.typicalMileage?.low ?? 50_000);
  const [localShowAll, setLocalShowAll] = useState(true);
  const showAll = twinFilter?.showAll ?? localShowAll;
  const setShowAll = twinFilter?.setShowAll ?? setLocalShowAll;
  const revealTwinIssue = twinFilter?.revealIssue;
  const setVisualInteractionActive = twinFilter?.setVisualInteractionActive;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [armedHotspotId, setArmedHotspotId] = useState<KnownIssueTwinHotspotId | null>(null);
  const [failedReveals, setFailedReveals] = useState<Record<string, true>>({});
  // Touch arming is independent of browser-synthesized focus/mouse events.
  const markerInput = useRef('keyboard');
  const skipReturnFocusPreview = useRef(false);
  const resetPreview = useCallback(() => {
    setArmedHotspotId(null);
    setPreviewId(null);
  }, []);
  const [chooserHotspotId, setChooserHotspotId] = useState<KnownIssueTwinHotspotId | null>(null);
  const [viewed, setViewed] = useState<string[]>([]);
  const [gated, setGated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [member, setMember] = useState({ visual: false, authenticated: false, enrollmentEnabled: false });
  useEffect(() => {
    let live=true;let controller:AbortController|undefined;let hadVisualAccess=false;
    const applyAccess=(access:{visual?:boolean;authenticated?:boolean}|null,eligibility:{accountEnrollmentEnabled?:boolean}|null)=>{
      const visual=access?.visual===true;
      if(hadVisualAccess&&!visual)setSelectedId(null);
      hadVisualAccess=visual;
      setMember({visual,authenticated:access?.authenticated===true,enrollmentEnabled:eligibility?.accountEnrollmentEnabled===true});
    };
    const refresh=()=>{
      controller?.abort();controller=new AbortController();const current=controller;
      Promise.all([fetch('/api/user/tier',{cache:'no-store',signal:current.signal}).then(r=>r.ok?r.json():null),fetch('/api/enrollment-eligibility',{cache:'no-store',signal:current.signal}).then(r=>r.ok?r.json():null)])
        .then(([access,eligibility])=>{if(live&&!current.signal.aborted)applyAccess(access,eligibility);})
        .catch(()=>{if(live&&!current.signal.aborted)applyAccess(null,null);});
    };
    refresh();window.addEventListener('focus',refresh);const timer=setInterval(refresh,60000);
    return()=>{live=false;controller?.abort();window.removeEventListener('focus',refresh);clearInterval(timer);};
  },[]);
  const visible = useMemo(() => showAll ? issues : issuesAtMileage(issues, mileage, 0), [issues, mileage, showAll]);
  const writtenVisible = useMemo(() => showAll ? sourceIssues : issuesAtMileage(sourceIssues, mileage, 0), [sourceIssues, mileage, showAll]);
  const selected = issues.find((issue) => issue.id === selectedId) ?? null;
  const visual = issues.find((issue) => issue.id === (previewId ?? selectedId)) ?? null;
  const activeEffect = armedHotspotId ?? visual?.hotspot?.id ?? null;
  const maxMileage = Math.max(150_000, ...sourceIssues.flatMap((issue) => issue.typicalMileage ? [issue.typicalMileage.high + 10_000] : []));
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
    resetPreview();
    setChooserHotspotId(null);
    if (!equipmentCompatible) setSelectedId(null);
  }, [issues, mileage, showAll, resetPreview, equipmentCompatible]);

  useEffect(() => {
    const dismiss = () => { resetPreview(); setChooserHotspotId(null); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
      if (event.key === 'Tab' && !event.defaultPrevented) { markerInput.current = 'keyboard'; resetPreview(); }
    };
    document.addEventListener('keydown', onKeyDown);
    const unsubscribe = subscribeKnownIssueNavigation(dismiss);
    return () => { document.removeEventListener('keydown', onKeyDown); unsubscribe(); };
  }, [resetPreview]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw: unknown = JSON.parse(sessionStorage.getItem(definition.sessionKey) || '[]');
        const current = filterKnownIssueViewHistory(Array.isArray(raw) ? raw : [], issues.map((issue) => issue.id));
        setViewed(current); setGated(current.length >= 2);
        if (current.length >= 2) trackEvent('known_issue_twin_gate_shown', { model: definition.slug, year: definition.year, restored: true });
      } catch { setViewed([]); setGated(false); }
      setRestored(true);
    });
    return () => { cancelled = true; };
  }, [issues, definition]);

  useEffect(() => {
    setActiveIssueIds?.(!equipmentCompatible || (gated && !member.visual) || showAll ? null : writtenVisible.map((issue) => issue.id));
  }, [gated, member.visual, setActiveIssueIds, showAll, writtenVisible, equipmentCompatible]);
  useEffect(() => () => setActiveIssueIds?.(null), [setActiveIssueIds]);

  useEffect(() => {
    setVisualInteractionActive?.(Boolean(armedHotspotId || selectedId || chooserHotspotId || gated || member.authenticated));
  }, [armedHotspotId, selectedId, chooserHotspotId, gated, member.authenticated, setVisualInteractionActive]);
  useEffect(() => () => setVisualInteractionActive?.(false), [setVisualInteractionActive]);

  useEffect(() => {
    const reveal = () => {
      const issueId = currentKnownIssueAnchor();
      if (!issues.some(issue => issue.id === issueId)) return;
      if (revealTwinIssue) revealTwinIssue(issueId);
      else setLocalShowAll(true);
      setChooserHotspotId(null);
      setPreviewId(null);
    };
    reveal();
    return subscribeKnownIssueNavigation(reveal);
  }, [issues, revealTwinIssue]);

  const closeTree = useCallback(() => {
    skipReturnFocusPreview.current = true;
    resetPreview();
    setSelectedId(null);
    if (!member.visual && viewed.length >= 2) {
      setGated(true);
      trackEvent('known_issue_twin_gate_shown', { model: definition.slug, year: definition.year, restored: false });
    }
  }, [viewed, member.visual, resetPreview, definition]);

  useEffect(() => subscribeKnownIssueNavigation(() => {
    if (selectedId && issues.some(issue => issue.id === currentKnownIssueAnchor())) closeTree();
  }), [selectedId, issues, closeTree]);

  function setRange(nextMileage: number, nextShowAll = showAll) {
    resetPreview();
    setMileage(nextMileage); setShowAll(nextShowAll);
    setChooserHotspotId(null);
    const nextVisible = nextShowAll ? issues : issuesAtMileage(issues, nextMileage, 0);
    const retained = retainKnownIssueSelection(selectedId, nextVisible.map((issue) => issue.id));
    setSelectedId(retained); if (!retained) setPreviewId(null);
  }

  function selectIssue(issue: KnownIssueTwinIssue) {
    if (gated && !member.visual) return;
    resetPreview();
    setChooserHotspotId(null);
    if(member.visual){setSelectedId(issue.id);setPreviewId(null);return;}
    const next = registerDistinctIssueView(viewed, issue.id);
    setViewed(next.viewedIssueIds);
    try { sessionStorage.setItem(definition.sessionKey, JSON.stringify(next.viewedIssueIds)); } catch { /* in-memory fallback */ }
    trackEvent('known_issue_twin_issue_selected', { issue_id: issue.id, distinct_selection: next.isNew, distinct_count: next.viewedIssueIds.length });
    // Both trial selections open fully. Gate after the second tree closes,
    // or before a further selection if another interaction is queued.
    if (viewed.length >= 2) {
      setGated(true); setSelectedId(null);
      trackEvent('known_issue_twin_gate_shown', { issue_id: issue.id, restored: false });
      return;
    }
    setSelectedId(issue.id); setPreviewId(null);
  }

  function selectMarker(rows: KnownIssueTwinIssue[], touch: boolean) {
    const hotspotId = rows[0]?.hotspot?.id;
    if (!hotspotId) return;
    if (touch && armedHotspotId !== hotspotId) {
      setChooserHotspotId(null);
      setPreviewId(null);
      setArmedHotspotId(hotspotId);
      return;
    }
    if (knownIssueTwinMarkerMode(rows.length) === 'choose') {
      if (chooserHotspotId === hotspotId) resetPreview();
      setChooserHotspotId((current) => current === hotspotId ? null : hotspotId);
      return;
    }
    selectIssue(rows[0]!);
  }

  function closeChooser(hotspotId: KnownIssueTwinHotspotId) {
    setChooserHotspotId(null);
    resetPreview();
    skipReturnFocusPreview.current = true;
    document.getElementById(`known-issue-marker-${hotspotId}`)?.focus();
  }

  if (!restored || issues.length < 2) return null;
  if (!equipmentCompatible) return <p className="my-8 text-sm leading-6 text-[#526076]">This visual covers the reviewed {definition.year} {definition.identity.make} {definition.identity.model} {definition.identity.trim} configuration, not the selected trim. Written issues remain available below. Choose All Trims or {definition.identity.trim} to view that configuration.</p>;
  if (gated && !member.visual) return <PilotGate definition={definition} checkoutLinks={checkoutLinks} enrollmentEnabled={member.enrollmentEnabled} authenticated={member.authenticated} />;

  return (
    <section aria-label={`Interactive ${definition.year} ${definition.identity.make} ${definition.identity.model} Known Issues visual`} className="my-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[clamp(1.25rem,2.6vw,1.8125rem)] font-semibold leading-[1.15] tracking-[-.03em] text-[#94A3B8]">Explore the highlighted systems.</p>
        <button type="button" onClick={() => setRange(mileage, !showAll)} className="min-h-11 rounded-full border border-[#DDD6C9] bg-white px-4 text-xs font-bold">{showAll ? 'Use mileage' : 'Show all'}</button>
      </div>
      {!showAll && <div className="flex items-center gap-3"><input aria-label="Known issue mileage timeline" className="w-full accent-[#7C3AED]" type="range" min="0" max={maxMileage} step="1" value={Math.min(mileage, maxMileage)} onChange={(event) => setRange(Number(event.target.value), false)} /><output className="min-w-20 text-right text-xs font-bold">{mileage.toLocaleString()} mi</output></div>}
      <p className="mt-2 text-xs text-[#64748B]">{member.visual ? 'Your Visual access is active.' : `Explore two issues free · ${Math.min(viewed.length, 2)} of 2 viewed.`} Highlights show the affected area, not a diagnosis.</p>
      <p className="mt-1 text-xs leading-5 text-[#64748B]">{definition.configuration}</p>
      <p id="known-issue-marker-hint" className="mt-1 text-xs text-[#64748B]">Touch: tap once to highlight, then again to explore. Mouse or keyboard: hover or focus to preview, then activate to open.</p>
      <p className="sr-only" aria-live="polite">{armedHotspotId ? `${markerGroups.find(group => group.hotspotId === armedHotspotId)?.hotspot.label ?? 'System'} highlighted. Tap the same marker again to explore its issues.` : ''}</p>
      <div data-known-issue-stage data-active-effect={activeEffect ?? ''} data-armed-hotspot={armedHotspotId ?? ''} style={{aspectRatio:`${definition.width} / ${definition.height}`}} className="relative mx-auto w-full max-w-4xl sm:-my-8" onPointerDown={(event) => {
        if ((event.target as Element).closest('button, [role="dialog"]')) return;
        resetPreview(); setChooserHotspotId(null);
      }}>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[15%] left-[16%] right-[12%] h-[8%] rounded-full bg-slate-950/20 blur-xl" />
        <Image src={BASE} alt={`${definition.year} ${definition.identity.make} ${definition.identity.model} transparent vehicle visual`} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-contain" />
        {Object.entries(definition.effects).map(([hotspotId, effect]) => {
          if (!markerGroups.some((group) => group.hotspotId === hotspotId)) return null;
          const revealFailed = Boolean(effect.src && failedReveals[effect.src]);
          return (
            <div
              key={hotspotId}
              aria-hidden="true"
              data-known-issue-effect={hotspotId}
              data-effect-active={activeEffect === hotspotId}
              data-effect-fallback={revealFailed}
              style={{
                backgroundImage: revealFailed ? effect.fallbackBackgroundImage ?? 'linear-gradient(rgba(139,92,246,.58), rgba(139,92,246,.58))' : effect.backgroundImage,
                maskImage: effect.maskImage,
                WebkitMaskImage: effect.maskImage,
              }}
              className={`pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none ${activeEffect === hotspotId ? 'opacity-100' : 'opacity-0'}`}
            >
              {effect.src && !revealFailed && <div className="absolute inset-0" style={effect.clipToVehicle ? {
                maskImage: `url('${BASE}')`, WebkitMaskImage: `url('${BASE}')`,
                maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
                maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
              } : undefined}><Image src={effect.src} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-contain" onError={() => setFailedReveals(current => ({ ...current, [effect.src!]: true }))} /></div>}
            </div>
          );
        })}
        {markerGroups.map(({ hotspotId, rows, hotspot }) => {
          const phoneAnchor = definition.phoneAnchors[hotspotId] ?? hotspot;
          const highestSeverity = highestKnownIssueTwinSeverity(rows.map((issue) => issue.severity));
          const severity = KNOWN_ISSUE_TWIN_SEVERITY[highestSeverity];
          const severityTint = highestSeverity === 'high'
            ? 'border-[#8B1E1E] text-[#8B1E1E]'
            : highestSeverity === 'medium'
              ? 'border-[#B45309] text-[#B45309]'
              : 'border-[#5B6472] text-[#5B6472]';
          const expanded = chooserHotspotId === hotspotId;
          return (
            <div key={hotspotId}>
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full sm:hidden" viewBox={`0 0 300 ${300*definition.height/definition.width}`}>
                <line x1={phoneAnchor.x * 3} y1={phoneAnchor.y * 3 * definition.height / definition.width} x2={hotspot.x * 3} y2={hotspot.y * 3 * definition.height / definition.width} stroke="#8652BB" strokeWidth="1" opacity=".7" />
                <circle cx={hotspot.x * 3} cy={hotspot.y * 3 * definition.height / definition.width} r="2" fill="#8652BB" />
              </svg>
              <button
                id={`known-issue-marker-${hotspotId}`}
                type="button"
                aria-label={`${hotspot.label}: ${rows.length} published ${rows.length === 1 ? 'issue' : 'issues'}; highest severity ${severity.label}`}
                aria-haspopup={rows.length > 1 ? 'dialog' : undefined}
                aria-expanded={rows.length > 1 ? expanded : undefined}
                aria-controls={rows.length > 1 ? `known-issue-chooser-${hotspotId}` : undefined}
                aria-describedby="known-issue-marker-hint"
                aria-pressed={armedHotspotId === hotspotId}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'mouse') return;
                  markerInput.current = 'mouse';
                  resetPreview(); setPreviewId(rows[0]!.id);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse' && markerInput.current !== 'touch') setPreviewId(null);
                }}
                onPointerDown={(event) => { markerInput.current = event.pointerType; skipReturnFocusPreview.current = false; }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') markerInput.current = 'keyboard';
                }}
                onFocus={() => {
                  if (skipReturnFocusPreview.current) { skipReturnFocusPreview.current = false; return; }
                  if (markerInput.current !== 'touch') setPreviewId(rows[0]!.id);
                }}
                onBlur={() => setPreviewId(null)}
                onClick={(event) => selectMarker(rows, event.detail !== 0 && markerInput.current === 'touch')}
                style={{ '--marker-x': `${hotspot.x}%`, '--marker-y': `${hotspot.y}%`, '--marker-phone-x': `${phoneAnchor.x}%`, '--marker-phone-y': `${phoneAnchor.y}%` } as CSSProperties}
                className="absolute left-[var(--marker-phone-x)] top-[var(--marker-phone-y)] z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#6D38B5]/95 text-white shadow-[0_0_14px_rgba(109,56,181,.38),0_4px_14px_rgba(15,23,42,.2)] transition-shadow hover:shadow-[0_0_22px_rgba(109,56,181,.6),0_4px_14px_rgba(15,23,42,.2)] focus:outline-none focus:ring-4 focus:ring-[#A78BFA]/35 sm:left-[var(--marker-x)] sm:top-[var(--marker-y)]"
              >
                <IssueCategoryIcon category={hotspotIconCategory(hotspotId)} className="h-5 w-5" />
                <span className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border bg-white shadow-sm ${severityTint}`} aria-hidden="true">
                  <IssueSeverityIcon severity={highestSeverity} className="h-3.5 w-3.5" />
                </span>
                {rows.length > 1 && <span className="absolute -bottom-2 -right-2 min-w-5 rounded-full border border-white bg-[#172033] px-1 text-center text-[10px] font-bold leading-5 text-white shadow-sm" aria-hidden="true">{rows.length}</span>}
              </button>
              {expanded && (
                <IssueChooser
                  hotspotId={hotspotId}
                  hotspotLabel={hotspot.label}
                  rows={rows}
                  left={hotspot.x}
                  top={hotspot.y}
                  phoneTop={phoneAnchor.y}
                  choose={selectIssue}
                  close={() => closeChooser(hotspotId)}
                  preview={setPreviewId}
                />
              )}
            </div>
          );
        })}
      </div>
      {!showAll && visible.length === 0 && <p className="text-center text-sm text-[#64748B]">No reviewed visual issue has a documented mileage range here. Matching written-only records remain below. Move the timeline or choose Show all.</p>}
      {sourceIssues.some(issue => !issue.hotspot) && <p className="mt-2 text-xs leading-5 text-[#64748B]">Records without a reviewed, equipment-applicable location remain available in the written issues below and do not count as visual views.</p>}
      {selected && <TreeOverlay definition={definition} issue={selected} mileage={mileage} close={closeTree} returnFocusId={`known-issue-marker-${selected.hotspot?.id}`} />}
    </section>
  );
}

export default KnownIssueTwinPilot;
