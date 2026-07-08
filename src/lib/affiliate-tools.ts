/**
 * Context-matched UNIVERSAL affiliate tools for known-issues / DTC pages.
 *
 * Strategy (from the top-clicked-parts data, July 2026): vehicle-specific parts
 * convert poorly (fitment friction), but universal tools/accessories convert on
 * impulse with no "will it fit?" step — and several are high-ticket, so each
 * sale pays more. This surfaces the RIGHT universal tool for the page's context
 * (a DTC page → an OBD2 scanner; a battery issue → a maintainer; an EV → a Level
 * 2 charger). All links carry the au7o-20 Amazon tag and are search links (no
 * dead-ASIN risk). Clicks flow through the same trackAffiliateClick pipeline as
 * every other affiliate link, so they show up in the admin top-parts report.
 */

export interface AffiliateTool {
  key: string;
  name: string;
  brand: string;
  blurb: string;
  priceHint: string;
  icon: string;
  url: string;
}

function amazon(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=au7o-20`;
}

const TOOLS: Record<string, AffiliateTool> = {
  obd2: {
    key: 'obd2', name: 'Bluetooth OBD2 Scanner', brand: 'BlueDriver', icon: '🔎',
    blurb: 'Read & clear check-engine codes yourself before paying a shop.',
    priceHint: '~$120', url: amazon('BlueDriver Bluetooth Pro OBD2 scan tool'),
  },
  obd2_budget: {
    key: 'obd2_budget', name: 'Budget OBD2 Scanner', brand: 'ANCEL', icon: '🔌',
    blurb: 'Cheaper code reader — pull the codes, look them up here.',
    priceHint: '~$25', url: amazon('ANCEL OBD2 scanner code reader'),
  },
  battery: {
    key: 'battery', name: 'AGM Battery', brand: 'Optima RedTop', icon: '🔋',
    blurb: 'Sealed AGM battery — a common fix for no-starts & electrical gremlins.',
    priceHint: '~$250', url: amazon('Optima RedTop AGM battery'),
  },
  maintainer: {
    key: 'maintainer', name: '12V Battery Maintainer', brand: 'Battery Tender Jr', icon: '⚡',
    blurb: 'Stops parasitic-drain no-starts — keeps the battery topped off.',
    priceHint: '~$45', url: amazon('Battery Tender Junior 12V charger maintainer'),
  },
  multimeter: {
    key: 'multimeter', name: 'Digital Multimeter', brand: 'INNOVA', icon: '📟',
    blurb: 'Chase electrical faults — test voltage, continuity & parasitic draw.',
    priceHint: '~$30', url: amazon('INNOVA digital automotive multimeter'),
  },
  ev_charger: {
    key: 'ev_charger', name: 'Level 2 EV Charger', brand: 'Lectron', icon: '🔋',
    blurb: 'Charge 3-5× faster at home than the included Level 1 cord.',
    priceHint: '~$400', url: amazon('Lectron Level 2 EV charger 240V'),
  },
};

const EV_MAKES = new Set(['Tesla', 'Rivian', 'Lucid', 'Polestar']);
// Model names that are EV / plug-in regardless of make.
const EV_MODEL_RE = /\b(EV6|EV9|Ioniq|Leaf|Bolt|Mach-?E|ID\.?4|ID\.?Buzz|Lightning|Solterra|bZ4X|e-?tron|i3|i4|iX|Ariya|Blazer EV|Equinox EV|Silverado EV|Hummer EV|Prologue|Volt)\b/i;
const BATTERY_RE = /(battery|parasitic|drain|no[-\s]?start|alternator|charging|12v|dead cell|no crank)/i;

interface ToolIssue {
  category?: string | null;
  dtcCodes?: string[] | null;
  title?: string | null;
}

/**
 * Pick up to 3 universal tools that fit a known-issues page's context.
 * @param issues the page's issues (categories + DTC codes + titles)
 */
export function toolsForIssues(
  issues: ToolIssue[],
  make?: string,
  model?: string,
): AffiliateTool[] {
  const cats = new Set(issues.map((i) => String(i.category || '').toLowerCase()));
  const hasDtc = issues.some((i) => Array.isArray(i.dtcCodes) && i.dtcCodes.length > 0);
  const text = issues.map((i) => i.title || '').join(' ');
  const isEV = (!!make && EV_MAKES.has(make)) || EV_MODEL_RE.test(`${make || ''} ${model || ''}`) || EV_MODEL_RE.test(text);
  const batteryish = cats.has('electrical') || BATTERY_RE.test(text);

  const picks: AffiliateTool[] = [];
  const add = (t: AffiliateTool) => { if (t && !picks.some((p) => p.key === t.key)) picks.push(t); };

  if (isEV) add(TOOLS.ev_charger);
  // OBD2 whenever there's a code to read or an engine/emissions/electrical fault.
  if (hasDtc || cats.has('engine') || cats.has('emissions') || cats.has('electrical') || cats.has('fuel')) add(TOOLS.obd2);
  if (batteryish) { add(TOOLS.maintainer); add(TOOLS.multimeter); }

  // Never show an empty rail on a car page — an OBD2 scanner is universally useful.
  if (picks.length === 0) add(TOOLS.obd2);
  return picks.slice(0, 3);
}

/** DTC pages: the visitor is literally looking up a trouble code → an OBD2
 *  scanner is the perfect, highest-intent match. */
export function toolsForDtc(): AffiliateTool[] {
  return [TOOLS.obd2, TOOLS.obd2_budget];
}
