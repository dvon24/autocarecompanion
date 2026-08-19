/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  beforeHashes,
  hashValue,
  productUrlError,
  snapshotFields,
  validateManifest,
  vendorMatchesUrl,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_LEDGER = path.join(PROJECT_ROOT, 'data', 'acura-corrected-link-release', 'review-ledger.json');
const DEFAULT_OUTPUT = path.join(
  PROJECT_ROOT,
  'data', 'acura-corrected-link-release', 'final-target.json',
);
const CORRECTION_DATE = '2026-08-19';
const CONTENT_CORRECTION_IDS = Object.freeze([
  'acura-integra-dc-rear-lca-bolt-seizure',
  'acura-integra-turbo-heat-soak-2023',
  'acura-legend-c32a1-head-gasket-failure-rear-cylinders-due-to-open-deck-vi',
  'acura-legend-sunroof-drain-tube-clogs-cause-footwell-trunk-water-leaks',
  'acura-mdx-power-steering-high-pressure-hose-cracking-rack-morning-sick',
  'acura-mdx-timing-belt-tensioner-2001',
  'acura-mdx-vcm-related-oil-consumption-spark-plug-fouling-motor-mount-f',
  'acura-rl-c35a-timing-belt-tensioner-interference',
  'acura-tl-power-steering-hose-leak-2004',
  'acura-tlx-9speed-shudder-2015',
  'acura-tlx-brake-noise-aspec-2018',
  'acura-vigor-g25a1-timing-belt-interference',
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function argValue(args, flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function yearsInPositiveScope(text, issueYears) {
  const positive = String(text || '').split(/\b(?:does not|not |except|excludes?|excluding)\b/i)[0];
  const years = new Set();
  for (const match of positive.matchAll(/\b((?:19|20)\d{2})(?:\s*[–-]\s*((?:19|20)\d{2}))?/g)) {
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    for (let year = Math.min(start, end); year <= Math.max(start, end); year += 1) years.add(year);
  }
  return [...years].filter((year) => issueYears.includes(year)).sort((a, b) => a - b);
}

function mentionedSubset(values, text) {
  const normalized = String(text || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ');
  const matched = values.filter((value) => {
    const needle = String(value).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
    return needle && new RegExp(`(?:^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: |$)`).test(normalized);
  });
  return matched.length > 0 && matched.length < values.length ? matched : [];
}

function fitmentFor(record, occurrence, destination) {
  // A rejected product's scope is evidence against that product, not evidence
  // for its approved replacement. Replacement scope must come exclusively
  // from the approved destination label that was verified during review.
  const text = occurrence.correctedDecision === 'keep'
    ? `${destination.label} ${occurrence.fitmentScope}`
    : destination.label;
  const years = yearsInPositiveScope(text, asArray(record.years));
  const engines = mentionedSubset(asArray(record.engines), text);
  const trims = mentionedSubset(asArray(record.trims), text);
  const fitment = {};
  if (years.length > 0 && years.length < asArray(record.years).length) fitment.years = years;
  if (engines.length > 0) fitment.engines = engines;
  if (trims.length > 0) fitment.trims = trims;
  return Object.keys(fitment).length > 0 ? fitment : undefined;
}

function vendorForUrl(value) {
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'amazon.com') return 'Amazon';
  if (host === 'ebay.com') return 'eBay';
  const label = host.split('.').at(-2) || host;
  return label.split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function cleanComponent(value) {
  return String(value || 'Verified repair item')
    .replace(/\s*\(verify[^)]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function roleNoteFor(destination, supplemental) {
  if (supplemental) return 'Companion repair item.';
  const label = String(destination.label || '');
  if (/\b(?:atf|fluid|oil|coolant|grease|lubricant)\b/i.test(label)) return 'Verified repair fluid.';
  if (/\bkit\b/i.test(label)) return 'Verified repair kit.';
  return 'Verified repair component.';
}

function buildPart(record, occurrence, destination, supplemental = false) {
  const vendor = vendorForUrl(destination.url);
  const urlError = productUrlError(destination.url);
  if (urlError) throw new Error(`${occurrence.issueId} occurrence ${occurrence.index}: ${urlError}: ${destination.url}`);
  if (!vendorMatchesUrl(vendor, destination.url)) {
    throw new Error(`${occurrence.issueId} occurrence ${occurrence.index}: vendor mismatch for ${destination.url}`);
  }
  const fitment = fitmentFor(record, occurrence, destination);
  const roleNote = supplemental
    ? roleNoteFor(destination, true)
    : occurrence.correctedDecision === 'replace'
      ? roleNoteFor(destination, false)
      : occurrence.linkRole;
  const scopeNote = supplemental
    ? destination.label
    : occurrence.correctedDecision === 'replace'
      ? `Approved replacement: ${destination.label}.`
      : occurrence.fitmentScope;
  return {
    component: cleanComponent(destination.label),
    oemPartNumber: '',
    aftermarketXref: [],
    note: [roleNote, scopeNote]
      .filter(Boolean)
      .join(' '),
    buyLinks: [{
      vendor,
      url: destination.url,
      linkType: 'product',
      verified: true,
      affiliate: ['Amazon', 'eBay'].includes(vendor),
    }],
    ...(fitment ? { fitment } : {}),
    variants: [],
    verified: true,
    provenance: `Acura corrected review occurrence ${occurrence.index}`,
  };
}

function dedupeParts(parts) {
  const byUrl = new Map();
  for (const part of parts) {
    const url = part.buyLinks?.[0]?.url;
    if (!url) continue;
    const previous = byUrl.get(url);
    if (!previous) {
      byUrl.set(url, part);
      continue;
    }
    const notes = [...new Set([previous.note, part.note].filter(Boolean))];
    previous.note = notes.join(' ');
    if (!previous.fitment && part.fitment) previous.fitment = part.fitment;
  }
  return [...byUrl.values()];
}

function replaceExact(value, before, after, issueId) {
  if (!value.includes(before)) throw new Error(`${issueId}: expected correction source text was not found`);
  return value.replace(before, after);
}

function applyContentCorrection(after, issueId) {
  switch (issueId) {
    case 'acura-integra-dc-rear-lca-bolt-seizure':
      after.solution = replaceExact(
        after.solution,
        ' Replace with OEM Honda bolts (M10x1.25, ~$4-9 each from the dealer). \nDiameter = 10mm, Pitch = 1.25.\n',
        ' Replace with a new vehicle-specific rear lower-control-arm bolt kit. Match the exact seized location and OE dimensions before installation; several rear-LCA fasteners are used on this chassis.\n',
        issueId,
      );
      break;
    case 'acura-integra-turbo-heat-soak-2023':
      after.solution += ' The 2.0T Type S application begins with model year 2024; 2023 applications are 1.5T only. Match the intercooler to the engine and trim.';
      break;
    case 'acura-legend-c32a1-head-gasket-failure-rear-cylinders-due-to-open-deck-vi':
      after.solution = replaceExact(
        after.solution,
        'Replace head gaskets with updated multi-layer steel (MLS) gaskets, resurface heads, and torque to spec.',
        'Replace both head gaskets with a verified 1991–1995 C32A/C32A1 set, resurface the heads, and torque to specification. Confirm gasket construction and engine compatibility before installation.',
        issueId,
      );
      break;
    case 'acura-legend-sunroof-drain-tube-clogs-cause-footwell-trunk-water-leaks':
      after.solution = replaceExact(
        after.solution,
        'Clear with compressed air or thin trimmer line, then flush with water.',
        'Clear with thin trimmer line or controlled low-pressure air, then flush with water. Excess air pressure can blow a drain tube off its fitting.',
        issueId,
      );
      break;
    case 'acura-mdx-power-steering-high-pressure-hose-cracking-rack-morning-sick':
      after.title = "Power Steering High-Pressure Hose Cracking and Rack 'Morning Sickness' — Generation-Specific Fitment";
      after.solution = 'Identify the MDX generation and hose part number before purchase. Replace the leaking high-pressure feed hose with the matching application and use only Honda power-steering fluid. The verified links cover 2001–2002 and 2007–2013 subsets; 2003–2006 still requires VIN-specific sourcing. For rack morning sickness, replace the steering rack with a remanufactured unit rather than using stop-leak.';
      break;
    case 'acura-mdx-timing-belt-tensioner-2001':
      after.solution = replaceExact(
        after.solution,
        'Use a genuine Honda/Acura timing belt kit.',
        'Use genuine Honda/Acura components or the verified AISIN kit matched to the year split: TKH-001 for 2001–2002 and TKH-002 for 2003–2006.',
        issueId,
      );
      break;
    case 'acura-mdx-vcm-related-oil-consumption-spark-plug-fouling-motor-mount-f':
      after.title = 'J37 Oil Consumption, Spark Plug Fouling, and Active Motor Mount Failure';
      after.description = 'The 2010–2013 MDX J37A1 can develop oil consumption and spark-plug fouling from piston-ring or cylinder sealing problems. Separately, its front and rear active hydraulic engine mounts can leak or collapse, causing idle vibration and a clunk when shifting. Diagnose these as separate repair paths; this J37A1 MDX application does not use Variable Cylinder Management.';
      after.solution = 'Diagnose oil consumption and plug fouling separately from mount vibration. Replace failed front or rear active hydraulic motor mounts and replace oil-fouled spark plugs after confirming the oil-consumption cause. Monitor oil level monthly and inspect for piston-ring fouling. The 2010–2013 J37A1 MDX is not a VCM application, so do not install a VCM tuner.';
      after.dtcCodes = after.dtcCodes.filter((code) => code !== 'P3400');
      break;
    case 'acura-rl-c35a-timing-belt-tensioner-interference':
      after.solution = 'Replace the timing belt, tensioner, water pump, idler pulley, and required front seals as one service. Match the kit to the 1996–1999 C35A application and verify the tensioner manufacturer before installation; no current AISIN TKH-022 application was verified. Never perform a belt-only service on this interference engine.';
      after.communityRecommendations = after.communityRecommendations
        .filter((recommendation) => !/TKH-022/i.test(recommendation.content || ''))
        .map((recommendation) => /Aisin or OEM Honda/i.test(recommendation.content || '')
          ? {
              ...recommendation,
              content: 'Use a genuine Honda tensioner or a current independently verified OE-quality application. Do not assume an AISIN kit number from another Honda/Acura engine fits the C35A.',
            }
          : recommendation);
      break;
    case 'acura-tl-power-steering-hose-leak-2004':
      after.solution = 'Check the VIN for open recall or campaign eligibility before buying a hose; coverage did not include every 2008 configuration. If not covered, replace the high-pressure power-steering feed hose with the year-matched updated assembly. Flush with Honda PSF, bleed the system, and inspect the pump for damage from low fluid.';
      break;
    case 'acura-tlx-9speed-shudder-2015':
      after.solution = replaceExact(after.solution, 'Honda DW-1 ATF', 'Acura ATF Type 3.1', issueId);
      after.communityRecommendations = after.communityRecommendations.map((recommendation) => ({
        ...recommendation,
        content: String(recommendation.content || '').replace('Honda DW-1', 'Acura ATF Type 3.1'),
      }));
      break;
    case 'acura-tlx-brake-noise-aspec-2018':
      after.trims = after.trims.filter((trim) => trim === 'Type S' || trim === 'Type S PMC');
      after.engines = after.engines.filter((engine) => engine === '3.0L V6 Turbo');
      after.description = 'The 2021–2025 TLX Type S and Type S PMC use a fixed front Brembo brake system whose performance-oriented pad compound can squeal during light braking and wear unevenly if pad-retaining hardware or contact points corrode. This does not apply to the A-Spec brake system.';
      after.solution = 'Remove the front pads and inspect the fixed Brembo calipers, pad-retaining pins, springs, shims, and pad contact points. Clean corrosion and apply brake-specific high-temperature lubricant only where the service procedure permits, never on a friction surface. Replace worn pads with a Type S front ceramic or equivalent application and replace damaged retaining hardware or shims.';
      after.communityRecommendations = [];
      break;
    case 'acura-vigor-g25a1-timing-belt-interference':
      after.title = 'Timing belt + water pump + tensioner/adjuster at 90k mi — G25A1 interference engine';
      after.description = "The Vigor's 2.5L 20-valve SOHC inline-5 (G25A1) is an interference engine, so timing-belt failure can bend valves. Honda's interval is 90,000 miles or 6 years. The belt tensioner/adjuster and water pump age with the belt; coolant at the base of the timing cover can indicate a failing pump seal and makes a complete, correctly matched timing service urgent.";
      after.solution = 'Replace the timing belt, belt tensioner/adjuster, water pump, idler, front seals, and accessory belts as one service. No complete current AISIN kit was verified for the G25A1, so source the exact components separately and use an OEM Honda or independently verified OEM-quality tensioner/adjuster. Avoid unverified no-name timing components.';
      after.communityRecommendations = after.communityRecommendations
        .filter((recommendation) => recommendation.type !== 'part')
        .map((recommendation) => ({
          ...recommendation,
          content: String(recommendation.content || '')
            .replace(/Pay for Aisin or OEM Honda/i, 'Use OEM Honda or an independently verified OE-quality application'),
        }));
      break;
    default:
      return false;
  }
  return true;
}

function buildManifest(snapshot, ledger) {
  if (snapshot.inventory?.publishedIssueCount !== snapshot.records?.length) {
    throw new Error('Snapshot inventory does not match its record count');
  }
  if (ledger.make !== 'Acura' || ledger.counts.reviewedOccurrences !== 63
    || ledger.counts.approvedReviewedOccurrences !== 61 || ledger.counts.heldOccurrences !== 2) {
    throw new Error('Corrected review ledger count contract failed');
  }
  const ledgerCorrectionIds = [...new Set(ledger.contentCorrections.map((item) => item.issueId))].sort();
  const implementedCorrectionIds = [...CONTENT_CORRECTION_IDS].sort();
  if (JSON.stringify(ledgerCorrectionIds) !== JSON.stringify(implementedCorrectionIds)) {
    throw new Error('Content-correction implementation does not match the review ledger');
  }
  const records = new Map(snapshot.records.map((record) => [record.id, record]));
  const grouped = new Map();
  for (const occurrence of ledger.occurrences) {
    const list = grouped.get(occurrence.issueId) || [];
    list.push(occurrence);
    grouped.set(occurrence.issueId, list);
  }

  const issues = [];
  for (const [issueId, occurrences] of grouped) {
    const record = records.get(issueId);
    if (!record) throw new Error(`${issueId}: missing from live Acura snapshot`);
    if (String(record.make).toLowerCase() !== 'acura') throw new Error(`${issueId}: live make is not Acura`);
    for (const occurrence of occurrences) {
      if (occurrence.issueTitle !== record.title) throw new Error(`${issueId}: workbook/live title drift`);
      if (occurrence.howToFixHash !== require('node:crypto').createHash('sha256').update(record.solution.trim()).digest('hex')) {
        throw new Error(`${issueId}: workbook/live How to Fix drift`);
      }
    }

    const proposed = [];
    for (const occurrence of occurrences) {
      for (const destination of occurrence.approvedDestinations) {
        proposed.push(buildPart(record, occurrence, destination));
      }
      for (const destination of occurrence.supplementalDestinations.filter((item) => item.commerceApproved)) {
        proposed.push(buildPart(record, occurrence, destination, true));
      }
    }
    const existing = asArray(record.fixParts).filter((part) => {
      const urls = asArray(part.buyLinks).map((link) => link.url);
      return !urls.some((url) => proposed.some((candidate) => candidate.buyLinks[0].url === url));
    });
    const after = { ...snapshotFields(record), title: record.title };
    after.fixParts = [...existing, ...dedupeParts(proposed)];
    if (issueId === 'acura-tl-power-steering-hose-leak-2004') {
      after.fixParts.unshift({
        component: 'Recall/VIN eligibility check',
        oemPartNumber: '',
        aftermarketXref: [],
        note: 'Check the VIN for open recall or campaign eligibility before purchasing the hose.',
        buyLinks: [],
        variants: [],
        recallFirst: true,
        verified: true,
        provenance: 'Acura corrected review content correction',
      });
    }
    const corrected = applyContentCorrection(after, issueId);
    after.contentUpdatedOn = CORRECTION_DATE;
    after.contentUpdateSummary = corrected && proposed.length > 0
      ? 'Corrected repair guidance and added repair-first, fitment-reviewed product links.'
      : corrected
        ? 'Corrected repair guidance; no incompatible product link was published.'
        : proposed.length > 0
          ? 'Added repair-first, fitment-reviewed product links.'
          : 'Fitment review completed; no verified repair product link was published.';

    issues.push({
      id: issueId,
      disposition: 'replace',
      evidence: [
        'Acura full corrected link review workbook',
        ...new Set(occurrences.flatMap((item) => item.evidenceUrls)),
      ],
      before: {
        ...beforeHashes(record),
        titleHash: hashValue(record.title),
        claimIds: asArray(record.before?.claimIds),
      },
      after,
    });
  }

  const manifest = {
    schemaVersion: 1,
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId: 'acura-corrected-links-final-target-2026-08-19',
    reviewedOn: CORRECTION_DATE,
    sourceSnapshotHash: snapshot.snapshotHash,
    occurrenceCoverage: {
      supplied: 66,
      preservedExisting: 3,
      correctedApproved: 61,
      held: 2,
    },
    issues: issues.sort((a, b) => a.id.localeCompare(b.id)),
  };
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(errors.join('\n'));
  return manifest;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(args = process.argv.slice(2)) {
  const snapshotPath = path.resolve(argValue(args, '--snapshot', ''));
  if (!fs.existsSync(snapshotPath)) throw new Error('Provide --snapshot <Acura snapshot JSON>');
  const ledgerPath = path.resolve(argValue(args, '--ledger', DEFAULT_LEDGER));
  const outputPath = path.resolve(argValue(args, '--output', DEFAULT_OUTPUT));
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  const manifest = buildManifest(snapshot, ledger);
  writeJson(outputPath, manifest);
  console.log(JSON.stringify({
    output: path.relative(PROJECT_ROOT, outputPath),
    issueCount: manifest.issues.length,
    approvedOccurrenceCount: manifest.occurrenceCoverage.correctedApproved,
    heldOccurrenceCount: manifest.occurrenceCoverage.held,
    uniquePublishedUrls: new Set(manifest.issues.flatMap((issue) => issue.after.fixParts)
      .flatMap((part) => asArray(part.buyLinks).map((link) => link.url))).size,
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = {
  CONTENT_CORRECTION_IDS,
  applyContentCorrection,
  buildManifest,
  dedupeParts,
  fitmentFor,
  yearsInPositiveScope,
};
