import { reviewedKnownIssueTwinCopy } from './known-issue-twin-copy';
import { KNOWN_ISSUE_TWIN_VISUALS, XT6_KNOWN_ISSUE_VISUAL, type KnownIssueTwinVisualDefinition } from './known-issue-twin-visuals';
import { KNOWN_ISSUE_TWIN_SEVERITY, resolveKnownIssueTwinPartImage, type KnownIssueTwinHotspotId, type KnownIssueTwinIssue } from './known-issue-twin-pilot';

export interface IssueDetailSection {
  label: string;
  items: string[];
  ordered?: boolean;
}

export interface IssueTreeProduct {
  label: string;
  brand: string;
  partNo: string;
  spec: string;
  note: string;
  price: string;
  buyUrl: string;
  buyLabel: string;
  fitmentReviewed: boolean;
  commerceKind?: 'diagnostic-tool';
}

export interface IssueTreeNode {
  label: string;
  sub: string;
  kids: string[];
  img: string;
  group?: boolean;
  conceptual?: boolean;
  imageCaption?: string;
  issue?: string;
  detailSections?: IssueDetailSection[];
  products?: IssueTreeProduct[];
  productFitmentMode?: 'individual';
  productsLabel?: string;
  dealerMake?: string;
  actionUrl?: string;
  actionLabel?: string;
}

function partPrice(part: KnownIssueTwinIssue['fixParts'][number]): string {
  if (part.priceLow == null && part.priceHigh == null) return 'Price not published';
  if (part.priceLow != null && part.priceHigh != null && part.priceLow !== part.priceHigh) {
    return `$${part.priceLow.toLocaleString()}–$${part.priceHigh.toLocaleString()}`;
  }
  return `$${(part.priceLow ?? part.priceHigh)!.toLocaleString()}`;
}

/** Products arrive after commerce, fitment and source guards. Keep their individual
 * evidence together when several materials and a diagnostic tool share one card. */
export function knownIssueTreeProducts(issue: KnownIssueTwinIssue, definition:KnownIssueTwinVisualDefinition = KNOWN_ISSUE_TWIN_VISUALS.find(row=>row.twinId===issue.visualId) ?? XT6_KNOWN_ISSUE_VISUAL): IssueTreeProduct[] {
  const batteryIssue = issue.id === 'cadillac-xt6-auto-stop-2020';
  const parts = batteryIssue
    ? issue.fixParts.filter(part => reviewedKnownIssueTwinCopy(issue)
      && part.oemPartNumber === '88864542 (ACDelco Gold 94RAGM)' && part.fitmentConfirmed)
    : issue.fixParts;
  const products: IssueTreeProduct[] = parts.flatMap(part => part.buyLinks.map(link => ({
    label: batteryIssue ? 'Replacement AGM battery — only if testing confirms it is weak' : part.component,
    brand: link.vendor,
    partNo: part.oemPartNumber || '—',
    spec: part.fitmentScope || 'Confirm exact vehicle fitment before purchase.',
    note: [part.recallFirst ? `Check recall coverage with ${definition.identity.make} before buying this item.` : '', part.note,
      batteryIssue ? 'Confirm VIN and availability. Reviewed price excludes $18 core charge, tax and shipping.' : ''].filter(Boolean).join(' '),
    price: partPrice(part),
    buyUrl: link.url,
    buyLabel: batteryIssue ? 'View battery' : `View at ${link.vendor}`,
    fitmentReviewed: part.fitmentConfirmed === true,
  })));
  if (issue.scanner) products.push({
    label: issue.scanner.name,
    brand: issue.scanner.name,
    partNo: 'Diagnostic tool',
    spec: `The published action explicitly calls for reading/testing codes${issue.dtcCodes.length ? `: ${issue.dtcCodes.join(', ')}` : ''}. Confirm exact vehicle and module coverage.`,
    note: 'Capability reviewed for the published diagnostic step; confirm that the tool supports the required test.',
    price: issue.scanner.priceRange,
    buyUrl: issue.scanner.productUrl,
    buyLabel: 'View capability-reviewed scanner',
    fitmentReviewed: false,
    commerceKind: 'diagnostic-tool',
  });
  return products;
}

export function buildIssueTree(issue: KnownIssueTwinIssue, definition:KnownIssueTwinVisualDefinition = KNOWN_ISSUE_TWIN_VISUALS.find(row=>row.twinId===issue.visualId) ?? XT6_KNOWN_ISSUE_VISUAL) {
  const reviewedCopy = reviewedKnownIssueTwinCopy(issue);
  const systemImage = reviewedCopy?.image
    ? `/twin-stage/parts/${reviewedCopy.image}`
    : resolveKnownIssueTwinPartImage('', issue.hotspot?.id).src;
  const repairImage = reviewedCopy?.repairImage
    ? `/twin-stage/parts/${reviewedCopy.repairImage}`
    : systemImage;
  const parentLabels: Record<KnownIssueTwinHotspotId, string> = {
    assistance:'Driver assistance', fuel:'Fuel delivery system',
    hood: 'Engine', trans: 'Transmission and driveline', rad: 'Cooling',
    wheel: 'Steering, suspension and brakes', rearwheel: 'Rear suspension and brakes',
    glass: 'Visibility and cabin electronics',
    cooling: 'Engine and cooling', steering: 'Electric power steering',
    camera: 'Surround Vision signal', roof: 'Roof and body sealing',
  };
  const parentLabel = issue.hotspot ? definition.labels[issue.hotspot.id] ?? parentLabels[issue.hotspot.id] : issue.explanation.system;
  const title = issue.title.trim() || 'Published issue — title not recorded';
  const mileage = issue.typicalMileage
    ? `${issue.typicalMileage.low.toLocaleString()}–${issue.typicalMileage.high.toLocaleString()} mi`
    : 'Mileage not established';
  // These source records contain disputed repair advice or an optional
  // start-stop defeat module. Their reviewed repair remains authoritative.
  const qualifiedRepair = reviewedCopy?.reviewedAction ?? (reviewedCopy && [
    'cadillac-xt6-auto-stop-2020', 'cadillac-xt6-timing-chain-2020', 'cadillac-xt6-transmission-shudder-2020',
  ].includes(issue.id) ? reviewedCopy.repair : issue.solution);
  const actionSections: IssueDetailSection[] = [];
  if (issue.howToCheck.length) actionSections.push({ label: 'How to check', items: [...issue.howToCheck], ordered: true });
  if (qualifiedRepair && qualifiedRepair !== issue.explanation.repairSentence.replace(/^Fix:\s*/, '')) {
    actionSections.push({ label: 'Repair guidance', items: [qualifiedRepair] });
  }
  const nodes: Record<string, IssueTreeNode> = {
    vehicle: {
      label: `${definition.year} ${definition.identity.make} ${definition.identity.model}`, sub: `${title} · ${KNOWN_ISSUE_TWIN_SEVERITY[issue.severity].label} · ${mileage}`,
      img: definition.base,
      kids: parentLabel ? ['system'] : ['mechanism'], group: true,
    },
    mechanism: {
      label: 'What is happening', sub: issue.explanation.issueSentence, conceptual: true,
      img: systemImage, imageCaption: systemImage.endsWith('.svg') ? 'Conceptual issue diagram — not a physical cutaway or diagnostic image.' : 'Generic component-class illustration — not an exact replacement, fitment approval or diagnostic image of your vehicle.',
      issue: issue.explanation.mechanism, kids: ['action'], group: true,
      detailSections: [
        { label: 'Known issue', items: [`${title} · ${KNOWN_ISSUE_TWIN_SEVERITY[issue.severity].label} · ${mileage}`] },
        ...(issue.applicability ? [{ label: 'Applies only when', items: [issue.applicability] }] : []),
        ...(issue.explanation.mechanism && issue.explanation.mechanism !== issue.explanation.issueSentence
          ? [{ label: 'Issue details', items: [issue.explanation.mechanism] }] : []),
        ...(issue.symptoms.length ? [{ label: 'Symptoms', items: [...issue.symptoms] }] : []),
      ],
    },
    action: {
      label: issue.dealerAction ? 'Dealer or recall action' : 'What to do', sub: issue.explanation.repairSentence,
      issue: reviewedCopy ? issue.explanation.repairSentence : issue.explanation.action,
      kids: [], group: true, conceptual: true,
      img: repairImage, imageCaption: reviewedCopy?.repairImage ? 'Repair material illustration — confirm the specification in the repair instructions.' : 'Representative affected component, not a repair procedure or exact replacement. Follow the published diagnostic instructions.',
      detailSections: actionSections,
      products: knownIssueTreeProducts(issue,definition), productFitmentMode: 'individual', productsLabel: 'Repair products and diagnostic tools',
      dealerMake: issue.dealerAction ? definition.identity.make : undefined,
      actionUrl: issue.dealerAction
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(definition.identity.make)}+dealer+near+me`
        : 'https://www.google.com/maps/search/?api=1&query=automotive+repair+shop+near+me',
      actionLabel: issue.dealerAction ? `Find a nearby ${definition.identity.make} dealer` : 'Find a nearby repair shop',
    },
  };
  if (parentLabel) nodes.system = {
    label: parentLabel,
    sub: issue.id === 'cadillac-xt6-auto-stop-2020' ? 'Start-stop uses battery power to restart the engine.' : issue.explanation.issueSentence,
    img: issue.hotspot ? resolveKnownIssueTwinPartImage('', issue.hotspot.id).src : systemImage,
    imageCaption: 'System illustration — the affected component is shown in What is happening.',
    kids: ['mechanism'], group: true,
  };
  return { label: title, short: 'Known issue', root: 'vehicle', nodes };
}
