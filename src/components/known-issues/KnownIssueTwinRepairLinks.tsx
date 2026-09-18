import type { KnownIssueTwinIssue } from '@/lib/known-issue-twin-pilot';
import reviewedFluids from '@/data/xt6-reviewed-repair-fluids.json';
import { reviewedKnownIssueTwinCopy } from '@/lib/known-issue-twin-copy';
import { SIBLING_DIAGNOSTIC_FLUIDS } from '@/lib/known-issue-twin-reviewed-parts';

/** Uses the same fitment- and URL-guarded products as the Tech Tree. */
export function KnownIssueTwinRepairLinks({ issue }: { issue: KnownIssueTwinIssue }) {
  const sibling=SIBLING_DIAGNOSTIC_FLUIDS[issue.id as keyof typeof SIBLING_DIAGNOSTIC_FLUIDS];
  if(sibling){
    const fluid=reviewedKnownIssueTwinCopy(issue)&&issue.visualId===sibling.twinId&&issue.fixParts.find(part=>part.oemPartNumber===sibling.oemPartNumber&&part.fitmentConfirmed);
    const link=fluid&&fluid.buyLinks.find(row=>row.url===sibling.url);
    if(!fluid||!link)return null;
    return <> <span>{sibling.lead}</span><a href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="font-semibold text-[#2563EB] underline underline-offset-2">{fluid.component} · {fluid.oemPartNumber}</a><span className="text-xs text-[#64748B]"> (confirm VIN, quantity and availability).</span></>;
  }
  // This short repair-line link was reviewed for the battery action only;
  // optional eliminators are not presented as a battery repair.
  if (issue.id !== 'cadillac-xt6-auto-stop-2020') {
    const review = reviewedFluids.find(row => row.id === issue.id && row.description === issue.description && row.solution === issue.solution);
    const fluid = review && issue.fixParts.find(part => part.oemPartNumber === review.oemPartNumber && part.fitmentConfirmed);
    const link = fluid && fluid.buyLinks.find(candidate => candidate.url === review?.url);
    if (!review || !fluid || !link) return null;
    return <> <span>{review.repairLead}</span><a href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="font-semibold text-[#2563EB] underline underline-offset-2">{fluid.component} · GM {fluid.oemPartNumber}</a><span className="text-xs text-[#64748B]"> (2020 Sport 3.6L; confirm VIN, quantity and availability).</span></>;
  }
  if (!reviewedKnownIssueTwinCopy(issue)) return null;
  const battery = issue.fixParts.find(part => part.oemPartNumber === '88864542 (ACDelco Gold 94RAGM)' && part.fitmentConfirmed);
  const link = battery?.buyLinks[0];
  if (!link) return null;
  return <> <span>Test first; replace only if the battery is weak: </span><a href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="font-semibold text-[#2563EB] underline underline-offset-2">ACDelco 94RAGM battery · {link.vendor}</a><span className="text-xs text-[#64748B]"> (2020 Sport 3.6L; confirm VIN and availability).</span></>;
}
