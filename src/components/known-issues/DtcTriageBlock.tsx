'use client';

import type { DtcTriage } from '@/lib/dtc-codes';
import { openKnownIssueArticle } from '@/lib/known-issue-navigation';

/**
 * "Narrow it down" block for /known-issues/dtc/[code]/[make]: which of the
 * documented failures under this code is the reader's, decided by symptom or
 * condition, plus the single cheapest first check. This is the one piece of
 * content that cannot live on an issue row because it spans several, and it
 * is what makes a code x make page more than a re-grouping of the article
 * pages. Each branch deep-links to its issue card further down the page.
 */
export function DtcTriageBlock({ triage, codeUpper, make }: { triage: DtcTriage; codeUpper: string; make: string }) {
  return (
    <section id="triage" className="scroll-mt-16 mb-6 border border-[#E3DFD4] rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-[#EFEDE6] flex items-center gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v6m0 0l-4 4m4-4l4 4M6 21h12M8 17h8" />
          </svg>
        </span>
        <h2 className="font-medium text-[#0B1220] flex-1">Narrow it down: which {codeUpper} failure is yours on a {make}?</h2>
      </div>
      <div className="p-4 bg-white space-y-4">
        <p className="text-sm leading-relaxed text-[#475569]">{triage.intro}</p>

        <div className="bg-[#F7F4EC] border border-[#E3DFD4] rounded-lg p-3">
          <h3 className="text-sm font-medium text-[#0B1220] mb-1">Check this first</h3>
          <p className="text-sm text-[#475569] leading-relaxed">{triage.firstCheck}</p>
        </div>

        {triage.branches.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#0B1220] mb-2">If you have…</h3>
            <ul className="divide-y divide-[#E3DFD4] border border-[#E3DFD4] rounded-lg overflow-hidden">
              {triage.branches.map((b) => (
                <li key={`${b.issueId}-${b.condition}`} className="p-3 bg-white">
                  <p className="text-sm text-[#0B1220]">
                    <span className="font-medium">{b.condition}</span>
                    <span className="text-[#94A3B8]"> → </span>
                    <a href={`#${encodeURIComponent(b.issueId)}`} onClick={event => {
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      openKnownIssueArticle(b.issueId);
                    }} className="font-medium text-[#3B82F6] hover:text-[#2563EB]">{b.issueTitle}</a>
                  </p>
                  {b.why && <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{b.why}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {triage.scanToolNotes && (
          <p className="text-xs text-[#64748B] leading-relaxed">
            <span className="font-medium text-[#334155]">On the scanner:</span> {triage.scanToolNotes}
          </p>
        )}
      </div>
    </section>
  );
}
