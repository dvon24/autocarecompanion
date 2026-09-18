import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { reviewedKnownIssueTwinCopy, type ReviewedKnownIssueSource } from '@/lib/known-issue-twin-copy';
import reviewedFluids from '@/data/xt6-reviewed-repair-fluids.json';
import type { KnownIssueTwinVisualDefinition } from './known-issue-twin-visuals';

export const SIBLING_DIAGNOSTIC_FLUIDS = {
  'acura-mdx-torque-converter-shudder-2014': { twinId:'mdx', component:'Acura ATF Type 3.1', oemPartNumber:'08200-9017', price:21.89, vendor:'AcuraPartsWarehouse', url:'https://www.acurapartswarehouse.com/oem/acura~atf~type~3~1~08200-9017.html', evidence:'2019 MDX Owner Manual, Transmission Fluid, page 677', lead:'Only if diagnosed fluid service is indicated: ' },
  'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph': { twinId:'nautilus', component:'Motorcraft MERCON ULV', oemPartNumber:'XT-12-QULV', price:9.61, vendor:'FordPartsGiant', url:'https://www.fordpartsgiant.com/parts/ford-oil-automatic-transmission_xt-12-qulv.html', evidence:'2019 Nautilus Owner Manual, 8F35 fluid specification', lead:'Only if separate fluid service is indicated, not as a software-repair substitute: ' },
} as const;

/** Reuse the exact maintenance-reviewed product, never the unqualified raw
 * converter/older-fluid list. This approval belongs only to this configuration. */
export function hasSourceRecallFirst(issue: {fixParts?:unknown}): boolean {
  return Array.isArray(issue.fixParts) && issue.fixParts.some(part => part && typeof part === 'object' && part.recallFirst === true);
}

export function siblingDiagnosticFluid(issue:ReviewedKnownIssueSource & {id:string;fixParts?:unknown}, definition:KnownIssueTwinVisualDefinition) {
  const review=SIBLING_DIAGNOSTIC_FLUIDS[issue.id as keyof typeof SIBLING_DIAGNOSTIC_FLUIDS];
  if(!review || review.twinId!==definition.twinId || hasSourceRecallFirst(issue) || !reviewedKnownIssueTwinCopy(issue)) return null;
  return {component:review.component,oemPartNumber:review.oemPartNumber,aftermarketXref:[],variants:[],verified:true,
    fitment:{years:[definition.year],trims:[definition.identity.trim],engines:[definition.identity.engine]},
    priceLow:review.price,priceHigh:review.price,
    note:review.lead+review.component+'. '+review.evidence+'. Reviewed maintenance price per quart; confirm VIN, required quantity, current price and availability. No stock claim.',
    provenance:review.evidence,buyLinks:[{vendor:review.vendor,url:review.url,linkType:'product' as const,verified:true}]};
}

/** Source-bound pilot projection: never overwrite newly researched source parts. */
function withReviewedFluid(issue: KnownIssue): KnownIssue {
  const review = reviewedFluids.find(row => row.id === issue.id);
  if (!review || issue.description !== review.description || issue.solution !== review.solution
    || JSON.stringify(issue.vehicleMatch) !== JSON.stringify(review.vehicleMatch)
    || issue.fixParts?.length) return issue;
  return { ...issue, fixParts: [{
    component: review.component, oemPartNumber: review.oemPartNumber,
    aftermarketXref: [], variants: [], verified: true,
    fitment: { years: [2020], trims: ['Sport'], engines: ['3.6L V6'] },
    priceLow: review.priceLow, priceHigh: review.priceHigh, note: review.note,
    provenance: `Repair-first review ${review.reviewedAt}; ${review.evidence.join(' ; ')}`,
    buyLinks: [{ vendor: 'GMPartsGiant', url: review.url, linkType: 'product', verified: true }],
  }] };
}

/** Reviewed replacement for the catalog-only battery link in the 2020 XT6
 * pilot. This is a projection, not a change to the published source record.
 * Evidence and limitations: spec-xt6-battery-link-review.md. */
export function withReviewedTwinParts(issue: KnownIssue, definition?:KnownIssueTwinVisualDefinition): KnownIssue {
  if(definition && definition.twinId!=='xt6') {
    const fluid=siblingDiagnosticFluid(issue,definition);
    // The sibling visual review does not approve raw generic/superseded parts
    // for these exact profiles. Recalls and software repairs have no purchase.
    return {...issue,fixParts:fluid?[fluid]:[]};
  }
  issue = withReviewedFluid(issue);
  if (issue.id !== 'cadillac-xt6-auto-stop-2020'
    || issue.vehicleMatch.make !== 'Cadillac' || issue.vehicleMatch.model !== 'XT6'
    || !issue.vehicleMatch.years.includes(2020) || !reviewedKnownIssueTwinCopy(issue)) return issue;

  return { ...issue, fixParts: issue.fixParts?.map(part => {
    if (part.verified !== true || part.oemPartNumber !== '88864542 (ACDelco Gold 94RAGM)'
      || part.component !== 'AGM Battery (Group 94R / H7, 850 CCA) — main starting battery'
      || part.variants?.length || part.fitment) return part;
    return {
      ...part,
      fitment: { years: [2020], trims: ['Sport'], engines: ['3.6L V6'] },
      priceLow: 243.63,
      priceHigh: 243.63,
      note: 'ACDelco Gold 94RAGM / GM 88864542 main battery for the reviewed 2020 XT6 Sport 3.6L branch. Test the battery before replacement. $243.63 when reviewed September 6, 2026, plus $18 core charge, tax and any shipping. Confirm VIN, vent connection and local availability with the seller; pickup/shipping requires a ZIP code. Retailer access may require browser verification.',
      buyLinks: [
        ...(part.buyLinks || []),
        { vendor: 'PartsDirect', url: 'https://www.partsdirect.parts/parts/acdelco-battery-94ragm', linkType: 'product' as const, verified: true },
      ],
    };
  }) };
}
