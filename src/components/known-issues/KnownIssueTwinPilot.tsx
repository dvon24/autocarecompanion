'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import {
  filterKnownIssueViewHistory,
  issuesAtMileage,
  KNOWN_ISSUE_TWIN_PILOT,
  registerDistinctIssueView,
  type KnownIssueTwinIssue,
} from '@/lib/known-issue-twin-pilot';
import { VEHICLE_TWIN_CATALOG } from '@/lib/vehicle-twin-catalog';

interface KnownIssueTwinPilotProps {
  issues: KnownIssueTwinIssue[];
}

const pilotTwin = VEHICLE_TWIN_CATALOG.find((candidate) => candidate.id === KNOWN_ISSUE_TWIN_PILOT.twinId);

function formatMiles(value: number): string {
  return value.toLocaleString('en-US');
}

function mileageLabel(issue: KnownIssueTwinIssue): string {
  if (!issue.typicalMileage) return 'Mileage not established';
  return `${formatMiles(issue.typicalMileage.low)}–${formatMiles(issue.typicalMileage.high)} mi`;
}

function initialMileage(issues: KnownIssueTwinIssue[]): number {
  const documented = issues.find((issue) => issue.typicalMileage)?.typicalMileage;
  if (!documented) return pilotTwin?.demoMileage ?? 50_000;
  return Math.round((documented.low + documented.high) / 2 / 1_000) * 1_000;
}

function priceLabel(part: KnownIssueTwinIssue['fixParts'][number]): string | null {
  if (part.priceLow == null && part.priceHigh == null) return null;
  if (part.priceLow != null && part.priceHigh != null && part.priceLow !== part.priceHigh) {
    return `$${part.priceLow.toLocaleString()}–$${part.priceHigh.toLocaleString()}`;
  }
  return `$${(part.priceLow ?? part.priceHigh)!.toLocaleString()}`;
}

function SeverityBadge({ severity }: { severity: KnownIssueTwinIssue['severity'] }) {
  const style = severity === 'high'
    ? 'border-[#F5B8B3] bg-[#FFF0EE] text-[#B42318]'
    : severity === 'medium'
      ? 'border-[#F1D39C] bg-[#FFF8E8] text-[#9A5B00]'
      : 'border-[#CAD7EB] bg-[#F1F6FF] text-[#285EA8]';
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${style}`}>{severity}</span>;
}

function IssueTree({ issue }: { issue: KnownIssueTwinIssue }) {
  const repairGuidance = issue.solution.trim();
  return (
    <div className="rounded-2xl border border-[#D8D1C3] bg-[#FBFAF6] p-4 sm:p-5" aria-live="polite">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
        <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
        2020 Cadillac XT6
      </div>
      <div className="ml-1 border-l border-[#BFD2F6] pl-4">
        <div className="rounded-xl border border-[#BFD2F6] bg-[#EFF5FF] px-3 py-2 text-sm font-semibold text-[#173E78]">
          {issue.affectedSystems.length > 0 ? issue.affectedSystems.join(' · ') : 'Affected system not specified in the published record'}
        </div>
        <div className="ml-4 border-l border-[#D8D1C3] py-3 pl-4">
          <div className="rounded-xl border border-[#D8D1C3] bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={issue.severity} />
              <span className="text-xs text-[#64748B]">{mileageLabel(issue)}</span>
            </div>
            <h3 className="text-sm font-bold leading-snug text-[#0B1220]">{issue.title}</h3>
            <div className="mt-1 text-[11px] font-medium text-[#64748B]">
              Visual location: {issue.hotspot?.label ?? 'not established from reviewed Twin evidence'}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">{issue.description}</p>
            {issue.symptoms.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">What owners may notice</div>
                <ul className="mt-1 space-y-1 text-xs leading-relaxed text-[#475569]">
                  {issue.symptoms.slice(0, 3).map((symptom) => <li key={symptom}>• {symptom}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="ml-4 border-l border-[#E3DFD4] py-3 pl-4">
            <div className="rounded-xl border border-[#D8D1C3] bg-[#F7F6F2] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">Repair / dealer guidance</div>
              <p className="mt-1 text-xs leading-relaxed text-[#334155]">
                {repairGuidance || 'No repair guidance has been published for this record. Confirm the condition and next step with a qualified Cadillac technician before ordering parts.'}
              </p>
            </div>
            {issue.fixParts.length > 0 ? issue.fixParts.map((part, index) => {
              const price = priceLabel(part);
              return (
                <div key={`${part.component}-${index}`} className="mt-3 rounded-xl border border-[#BBDDCB] bg-[#F0FAF5] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#177A4C]">
                    {part.recallFirst ? 'Recall-covered repair item' : 'Verified repair part'}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#0B1220]">{part.component}</div>
                  {(part.oemPartNumber || price) && (
                    <div className="mt-1 text-xs text-[#475569]">
                      {part.oemPartNumber && <>Part {part.oemPartNumber}</>}
                      {part.oemPartNumber && price && <> · </>}
                      {price}
                    </div>
                  )}
                  {part.note && <p className="mt-2 text-xs leading-relaxed text-[#475569]">{part.note}</p>}
                  {part.recallFirst && (
                    <p className="mt-2 rounded-lg bg-[#FFF7E6] px-2 py-1.5 text-[11px] font-semibold text-[#8A5200]">
                      Check the VIN for open recall coverage before buying or installing anything.
                    </p>
                  )}
                  {part.buyLinks.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {part.buyLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="rounded-lg bg-[#0B1220] px-3 py-2 text-xs font-semibold text-white hover:bg-[#26344B]"
                        >
                          View at {link.vendor}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-[#64748B]">No verified product link is available for this part.</p>
                  )}
                </div>
              );
            }) : (
              <div className="mt-3 rounded-xl border border-dashed border-[#D8D1C3] bg-white p-3 text-xs leading-relaxed text-[#64748B]">
                No verified repair product is attached to this issue. Follow the guidance above, or confirm the next step with a qualified technician, before ordering anything.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PilotGate({ onIntent }: { onIntent: () => void }) {
  return (
    <div className="rounded-3xl border border-[#D8D1C3] bg-white p-5 shadow-[0_18px_50px_rgba(11,18,32,0.10)] sm:p-8">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7C3AED]">Visual limit reached</div>
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#0B1220]">Keep exploring this XT6 visually</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#475569]">
        The full written Known Issues article remains free below. Choose a visual-only plan for this model, or open the complete Hub with maintenance and Au7o chat.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onIntent}
          className="rounded-2xl border-2 border-[#7C3AED] bg-[#F7F2FF] p-4 text-left transition hover:bg-[#F0E7FF]"
        >
          <span className="block text-sm font-bold text-[#0B1220]">Known Issues Visual</span>
          <span className="mt-1 block text-2xl font-bold text-[#7C3AED]">$4.99<span className="text-xs font-medium text-[#64748B]"> / month</span></span>
          <span className="mt-2 block text-xs leading-relaxed text-[#475569]">Interactive visual locations and issue component paths. The written issue cards remain free.</span>
          <span className="mt-3 inline-block text-xs font-bold text-[#6D28D9]">Preview plan intent →</span>
        </button>
        <Link
          href="/subscribe?tier=plus"
          onClick={() => trackEvent('known_issue_twin_hub_cta', { model: 'cadillac-xt6', year: 2020 })}
          className="rounded-2xl border-2 border-[#0B1220] bg-[#0B1220] p-4 text-left text-white transition hover:bg-[#1E293B]"
        >
          <span className="block text-sm font-bold">Full Au7o Hub</span>
          <span className="mt-1 block text-2xl font-bold">$14.99<span className="text-xs font-medium text-[#CBD5E1]"> / month</span></span>
          <span className="mt-2 block text-xs leading-relaxed text-[#E2E8F0]">Visual Twin, maintenance planning, records, part help and Au7o chat.</span>
          <span className="mt-3 inline-block text-xs font-bold text-white">View Hub plan →</span>
        </Link>
      </div>
    </div>
  );
}

export function KnownIssueTwinPilot({ issues }: KnownIssueTwinPilotProps) {
  const [mileage, setMileage] = useState(() => initialMileage(issues));
  const [showAll, setShowAll] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [viewedIssueIds, setViewedIssueIds] = useState<string[]>([]);
  const [gated, setGated] = useState(false);
  const [intentAcknowledged, setIntentAcknowledged] = useState(false);

  useEffect(() => {
    trackEvent('known_issue_twin_impression', { model: 'cadillac-xt6', year: 2020 });
    const restoreTimer = window.setTimeout(() => {
      let stored: string[] = [];
      try {
        const parsed = JSON.parse(window.sessionStorage.getItem(KNOWN_ISSUE_TWIN_PILOT.sessionKey) || '[]');
        if (Array.isArray(parsed)) stored = parsed.filter((value): value is string => typeof value === 'string');
      } catch {
        stored = [];
      }
      const distinct = filterKnownIssueViewHistory(stored, issues.map((issue) => issue.id));
      setViewedIssueIds(distinct);
      setGated(distinct.length >= 2);
      if (distinct.length >= 2) {
        trackEvent('known_issue_twin_gate_shown', { model: 'cadillac-xt6', year: 2020, restored: true });
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, [issues]);

  const visibleIssues = useMemo(
    () => showAll ? issues : issuesAtMileage(issues, mileage),
    [issues, mileage, showAll],
  );
  const selectedIssue = visibleIssues.find((issue) => issue.id === selectedIssueId) ?? null;
  const selectedEffect = selectedIssue?.hotspot
    ? pilotTwin?.art.effects[selectedIssue.hotspot.id]
    : undefined;
  const sliderMax = Math.max(
    150_000,
    ...issues.map((issue) => issue.typicalMileage?.high ?? 0),
  );
  const roundedSliderMax = Math.ceil((sliderMax + 10_000) / 10_000) * 10_000;

  function persistViews(next: string[]) {
    try {
      window.sessionStorage.setItem(KNOWN_ISSUE_TWIN_PILOT.sessionKey, JSON.stringify(next));
    } catch {
      // The gate remains functional in memory when storage is unavailable.
    }
  }

  function selectIssue(issue: KnownIssueTwinIssue) {
    if (gated) return;
    const result = registerDistinctIssueView(viewedIssueIds, issue.id);
    setSelectedIssueId(issue.id);
    setViewedIssueIds(result.viewedIssueIds);
    persistViews(result.viewedIssueIds);
    trackEvent('known_issue_twin_issue_selected', {
      model: 'cadillac-xt6',
      year: 2020,
      issue_id: issue.id,
      distinct_selection: result.isNew,
    });
    if (result.gated) {
      setGated(true);
      trackEvent('known_issue_twin_gate_shown', { model: 'cadillac-xt6', year: 2020 });
    }
  }

  function selectMarker(hotspotId: string) {
    const candidates = visibleIssues.filter((issue) => issue.hotspot?.id === hotspotId);
    const next = candidates.find((issue) => !viewedIssueIds.includes(issue.id)) ?? candidates[0];
    if (next) selectIssue(next);
  }

  function recordVisualPlanIntent() {
    setIntentAcknowledged(true);
    trackEvent('known_issue_twin_visual_plan_intent', { model: 'cadillac-xt6', year: 2020, price: 4.99 });
  }

  if (!pilotTwin || issues.length === 0) return null;

  if (gated) {
    return (
      <section className="mb-10" aria-label="Cadillac XT6 visual Known Issues pilot">
        <PilotGate onIntent={recordVisualPlanIntent} />
        {intentAcknowledged && (
          <p className="mt-3 text-center text-xs text-[#64748B]" role="status">
            Interest recorded for this preview. No purchase was made.
          </p>
        )}
      </section>
    );
  }

  const markerGroups = [...new Set(visibleIssues.flatMap((issue) => issue.hotspot?.id ? [issue.hotspot.id] : []))];

  return (
    <section className="mb-10" aria-labelledby="known-issue-twin-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7C3AED]">Dev preview · Known Issues Visual</div>
          <h2 id="known-issue-twin-title" className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#0B1220] sm:text-2xl">
            See where XT6 problems happen
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Published 2020 issues only. Select two different issues to preview the product gate.</p>
        </div>
        <span className="rounded-full border border-[#D8D1C3] bg-white px-3 py-1 text-[11px] font-semibold text-[#475569]">
          {viewedIssueIds.length}/2 visual issue views
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#D8D1C3] bg-[#F7F6F2] shadow-[0_16px_45px_rgba(11,18,32,0.08)]">
        <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.75fr)]">
          <div className="min-w-0 border-b border-[#D8D1C3] lg:border-b-0 lg:border-r">
            <div className="relative aspect-[16/9] min-h-[255px] overflow-hidden bg-[#F7F6F2]">
              <div
                className="absolute inset-[-3%]"
                style={{
                  maskImage: 'radial-gradient(ellipse 78% 76% at 52% 50%, #000 55%, transparent 88%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 78% 76% at 52% 50%, #000 55%, transparent 88%)',
                }}
              >
                <Image src={pilotTwin.art.base} alt="2020 Cadillac XT6 Sport visual Twin" fill priority sizes="(max-width: 1024px) 100vw, 700px" className="object-contain" />
                {selectedEffect && (
                  <Image src={selectedEffect} alt="" fill sizes="(max-width: 1024px) 100vw, 700px" className="object-contain" aria-hidden="true" />
                )}
              </div>
              {markerGroups.map((hotspotId) => {
                const issue = visibleIssues.find((candidate) => candidate.hotspot?.id === hotspotId)!;
                const hotspot = issue.hotspot!;
                const count = visibleIssues.filter((candidate) => candidate.hotspot?.id === hotspotId).length;
                const active = selectedIssue?.hotspot?.id === hotspotId;
                return (
                  <button
                    key={hotspotId}
                    type="button"
                    onClick={() => selectMarker(hotspotId)}
                    aria-label={`${hotspot.label}: ${count} known ${count === 1 ? 'issue' : 'issues'}`}
                    className={`absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-black shadow-lg transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#A78BFA]/40 ${active ? 'border-white bg-[#7C3AED] text-white' : 'border-[#7C3AED] bg-white text-[#6D28D9]'}`}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  >
                    {count}
                  </button>
                );
              })}
              <div className="absolute bottom-3 left-3 rounded-xl border border-white/20 bg-[#0B1220]/80 px-3 py-2 text-white backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C4B5FD]">Visual Twin</div>
                <div className="text-xs font-semibold">2020 Cadillac XT6 Sport · 3.6L V6</div>
              </div>
            </div>

            <div className="border-t border-[#D8D1C3] bg-white/75 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="xt6-issue-mileage" className="text-xs font-bold uppercase tracking-[0.08em] text-[#475569]">
                  Known-issue mileage · <span className="text-[#0B1220]">{formatMiles(mileage)} mi</span>
                </label>
                <div className="flex rounded-xl border border-[#D8D1C3] bg-[#F7F6F2] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAll(false);
                      trackEvent('known_issue_twin_timeline_mode', { model: 'cadillac-xt6', year: 2020 });
                    }}
                    className={`rounded-lg px-3 py-1.5 ${!showAll ? 'bg-[#0B1220] text-white' : 'text-[#475569]'}`}
                  >
                    Near mileage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAll(true);
                      trackEvent('known_issue_twin_show_all', { model: 'cadillac-xt6', year: 2020 });
                    }}
                    className={`rounded-lg px-3 py-1.5 ${showAll ? 'bg-[#0B1220] text-white' : 'text-[#475569]'}`}
                  >
                    Show all
                  </button>
                </div>
              </div>
              <input
                id="xt6-issue-mileage"
                type="range"
                min={0}
                max={roundedSliderMax}
                step={1000}
                value={mileage}
                disabled={showAll}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setMileage(next);
                  trackEvent('known_issue_twin_mileage_changed', { model: 'cadillac-xt6', year: 2020, mileage: next });
                }}
                className="mt-4 h-2 w-full cursor-pointer accent-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-35"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#94A3B8]"><span>0</span><span>{Math.round(roundedSliderMax / 2_000)}k</span><span>{Math.round(roundedSliderMax / 1_000)}k</span></div>
              {!showAll && <p className="mt-2 text-xs text-[#64748B]">Showing documented ranges that intersect ±10,000 miles. Missing mileage is never estimated.</p>}
            </div>
          </div>

          <div className="min-w-0 bg-[#F1EFE8] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#0B1220]">{showAll ? 'All 2020 issues' : 'Issues near this mileage'}</h3>
              <span className="text-xs font-semibold text-[#64748B]">{visibleIssues.length}</span>
            </div>
            <div className="max-h-[325px] space-y-2 overflow-y-auto pr-1">
              {visibleIssues.length > 0 ? visibleIssues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => selectIssue(issue)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selectedIssueId === issue.id ? 'border-[#7C3AED] bg-[#F7F2FF]' : 'border-[#D8D1C3] bg-white hover:border-[#A78BFA]'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug text-[#0B1220]">{issue.title}</span>
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <div className="mt-2 text-[11px] text-[#64748B]">{mileageLabel(issue)}</div>
                  {!issue.hotspot && <div className="mt-1 text-[10px] font-medium text-[#9A5B00]">Visual location not established from this record</div>}
                </button>
              )) : (
                <div className="rounded-xl border border-dashed border-[#C8C1B5] bg-white p-4 text-sm leading-relaxed text-[#64748B]">
                  No published XT6 issue has a documented mileage range near {formatMiles(mileage)} miles. Move the timeline or choose Show all.
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedIssue && (
          <div className="border-t border-[#D8D1C3] bg-white p-4 sm:p-6">
            <IssueTree issue={selectedIssue} />
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
        This visual organizes published issue evidence; it does not diagnose a vehicle. Confirm symptoms, VIN coverage and exact fitment before repair.
      </p>
    </section>
  );
}
