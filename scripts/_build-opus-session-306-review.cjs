/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reviewDir = path.join(root, 'outputs', 'pending-repair-first-review');
const source = require(path.join(root, 'outputs', 'pending-known-issue-review', 'session-306-release-readiness.json'));

const part = (component, scope, price, vendor, url) => ({
  component,
  scope,
  price,
  verified: true,
  buyLinks: [{ vendor, url, linkType: 'product', verified: true, affiliate: false }],
});

const overrides = {
  'audi-rs3-haldex-awd-pump-filter-screen-clogging-8v-rs3-rear-drive-dro': {
    disposition: 'approved-haldex-pump-repair-kit-after-awd-module-diagnosis',
    repairFirst: 'Service the coupling fluid and clean the pump screen on schedule. If AWD-module output testing confirms a failed pump, replace the pump repair kit and verify commanded coupling operation afterward; inspect drained fluid for metal before assuming the pump is the only failure.',
    fixParts: [part('BorgWarner Haldex pump repair kit 0CQ598549', 'Direct product page lists Audi RS3 fitment. Use only after the AWD module confirms pump failure; this is not a substitute for routine fluid service or differential diagnosis.', '$481.99 and ships in 1 business day when reviewed', 'FCP Euro', 'https://www.fcpeuro.com/products/audi-vw-haldex-repair-kit-borg-warner-0cq598549')],
  },
  'audi-rs3-dq500-s-tronic-mechatronic-clutch-pack-failure-lost-gears-no': {
    disposition: 'approved-seven-speed-dsg-service-kit-first-step-only',
    repairFirst: 'Read the transmission module first. If the DQ500 is simply overdue and has no confirmed internal damage, service the correct fluid and filter; pressure, mechatronic or clutch faults still require specialist diagnosis and adaptation rather than a fluid-only promise.',
    fixParts: [part('Liqui Moly DQ500 seven-speed DSG service kit 0BH325183BKT', 'Retailer explicitly lists RS3/TTRS with the seven-speed dual-clutch gearbox. Approved for maintenance or the overdue-service first step only, not as a repair for a confirmed failed mechatronic or clutch pack.', '$170.20 and in stock when reviewed', 'FCP Euro', 'https://www.fcpeuro.com/products/audi-dsg-transmission-service-kit-liqui-moly-0bh325183bkt')],
  },
  'audi-rs3-front-brake-rotor-judder-pad-deposit-warping-8v-rs3-steering': {
    disposition: 'approved-rs3-front-rotor-and-pad-kit-after-runout-measurement',
    repairFirst: 'Measure disc-thickness variation and lateral runout, check hub cleanliness and wheel-bearing play, then replace the front rotors and pads only when the measurements confirm that branch. Bed the new friction surfaces correctly.',
    fixParts: [part('VNE/Brembo RS3 front brake kit 8V0615301RKT5', 'RS3-specific front rotor-and-pad kit. Confirm exact year, brake option and VIN in the retailer fitment tool; carbon-ceramic and other option branches are excluded.', '$972.21 and in stock when reviewed', 'FCP Euro', 'https://www.fcpeuro.com/products/audi-brake-kit-vne-8v0615301rkt5')],
  },
  'audi-rs3-water-pump-thermostat-housing-coolant-leak-2-5-tfsi-failures': {
    disposition: 'content-correction-required-pump-and-thermostat-listed-separately-no-commerce',
    repairFirst: 'Pressure-test and locate the leak before ordering. Correct the copy before promotion: current RS3 catalogs list water-pump and thermostat components separately, so the claimed single integrated pump-and-thermostat assembly is not safe to link without a VIN/build-specific parts diagram.',
    contentCorrection: 'Replace the blanket integrated-assembly claim with VIN-specific pump and thermostat branches; identify DAZA versus DNWA and current supersessions before adding commerce.',
    fixParts: [],
  },
  'mazda-mpv-cooling-fan-control-module-fails-fans-run-constantly-not-all': {
    disposition: 'approved-revised-cooling-fan-control-module-after-command-test',
    repairFirst: 'Confirm fan response to A/C request and commanded coolant-temperature operation before replacement. If the control module is the failed branch, use the current revised part and pressure-test the engine if it was overheated.',
    fixParts: [{
      component: 'Genuine Mazda cooling-fan control module L510-15-15Y',
      scope: 'Exact OEM-number listing names the Mazda MPV and Mazda6. Mazda catalog fitment covers the 2002-2006 MPV ES, LX and LX-SV 3.0L and identifies L510-15-15Y as the revision replacing AJ51-15-15YA; confirm the module rather than motor or harness is the failed branch.',
      price: '$110.43 plus shipping, Buy It Now live when reviewed',
      verified: true,
      buyLinks: [{
        vendor: 'eBay',
        url: 'https://www.ebay.com/itm/188195339660',
        linkType: 'product',
        verified: true,
        affiliate: true,
      }],
    }],
  },
  'buick-cascada-1-6l-lwc-pcv-pressure-regulator-diaphragm-cracks-inside-cams': {
    disposition: 'approved-updated-complete-camshaft-cover-after-special-coverage-check',
    repairFirst: 'Check GM special-coverage eligibility before buying anything. When customer-pay repair is required, replace the complete camshaft cover because the PCV regulator is not separately serviceable, then inspect the intake-manifold PCV passages on higher-mileage cars.',
    fixParts: [part('Genuine GM camshaft/valve cover assembly 25203562', 'Direct fitment for 2016-2019 Buick Cascada 1.6L and includes the PCV valve, bolts and seals; supersedes 55596087. Use only after special-coverage eligibility is checked.', '$522.82 and add-to-cart live when reviewed', 'GM Parts Giant', 'https://www.gmpartsgiant.com/parts/gm-cover-asm-cm-shf-w-bolt-seal-25203562.html')],
  },
  'ram-promaster-city-engine-cooling-fan-motor-fan-control-relay-failure-causing-o': {
    disposition: 'approved-current-complete-radiator-fan-module-after-circuit-test',
    repairFirst: 'Read fan-control circuit faults, test the relay/control output and confirm that the motor and blade rotate freely. Replace the complete module only when the motor/module branch is confirmed; repair power, ground or relay faults instead when those fail testing.',
    fixParts: [part('Genuine Mopar radiator cooling fan module 68461973AA', 'Current complete fan module for 2015-2022 Ram ProMaster City 2.4L Base/SLT; supersedes 68247205AA and 68360299AA. The separate relay/control circuit still must be tested first.', '$278.75 and add-to-cart live when reviewed', 'Mopar Parts Giant', 'https://www.moparpartsgiant.com/parts/mopar-radiator-cooling~68461973aa.html')],
  },
  'mercedes-benz-amg-gt-getrag-7dcl750-rear-transaxle-dual-clutch-failure-clutch-pac': {
    disposition: 'approved-700-4-dct-service-kit-for-prevention-or-overdue-service-only',
    repairFirst: 'Keep the 7DCL750 service current and investigate take-up shudder immediately. The service kit is appropriate for scheduled/overdue maintenance; a unit with clutch, speed-sensor, seal or pressure faults needs a transmission specialist and may require a rebuild.',
    fixParts: [part('Motul Mercedes 700.4 DCT transmission service kit', 'Comprehensive 700.4 kit explicitly listed for AMG GT/GT C/GT R and SLS applications. Approved for maintenance only, not as a cure for confirmed clutch-pack, sensor or internal transaxle damage.', '$336.02 and ships in 1 business day when reviewed', 'FCP Euro', 'https://www.fcpeuro.com/products/mercedes-dct-transmission-service-kit-motul-700-4')],
  },
  'audi-s5-cabriolet-soft-top-hydraulic-pump-motor-failure-from-trunk-w': {
    disposition: 'approved-original-pump-rebuild-after-water-and-electrical-diagnosis',
    repairFirst: 'Fix the trunk leak and dry the pump area first, then test the fuse, relay, motor and corroded connector. Use the rebuild/exchange service only when pump 8F0871791 is the confirmed fault; leaking cylinders are a separate branch.',
    fixParts: [part('Top Hydraulics 8F0871791 A5/S5 Cabriolet top-pump rebuild/core exchange', '2010-2017 Audi A5/S5 Cabriolet original hydraulic pump 8F0871791. This does not repair leaking cylinders, a failed roof-control module or the water-entry source.', 'Starting at $600 when reviewed', 'Top Hydraulics', 'https://tophydraulics.com/audi/407-5590-10-17-audi-a5-cabriolet-hydraulic-pump.html')],
  },
  'ford-freestar-rear-c-expansion-valve-sticking-rear-evaporator-circuit-leak': {
    disposition: 'approved-rear-valve-branch',
    repairFirst: 'Use gauge readings and line temperature to distinguish a restriction from an O-ring, line or evaporator leak. Replace this valve only when the rear expansion valve is the confirmed restriction, then evacuate and recharge professionally.',
    fixParts: [{
      component: 'Genuine Ford YF2Z-19849-AA auxiliary/rear evaporator expansion valve',
      scope: '2004-2007 Ford Freestar 3.9L or 4.2L with rear/auxiliary A/C. The live listing identifies the exact Ford part number; confirm VIN and rear-HVAC equipment before ordering.',
      price: '$24.29 or best offer when reviewed',
      verified: true,
      buyLinks: [{
        vendor: 'eBay',
        url: 'https://www.ebay.com/itm/206046845256',
        linkType: 'product',
        verified: true,
        affiliate: true,
      }],
    }],
  },
  'chrysler-voyager-power-liftgate-cinch-latch-failure-gate-beeps-reverses-will': {
    disposition: 'approved-power-liftgate-latch-after-software-and-adjustment-checks',
    repairFirst: 'Check CSN Y50, update the liftgate module, scan the B2500-family fault and rule out striker misalignment or impact/ice before replacing hardware. Replace the integrated latch/cinch assembly only when the latch branch is confirmed.',
    fixParts: [part('Genuine Mopar 68305566AC power-liftgate latch/cinch assembly', '2020-2022 Voyager equipped with power liftgate/JRC; not the 68110603AC manual-liftgate latch. The direct product page lists Voyager fitment; confirm VIN and equipment before ordering.', '$258.68 and add-to-cart live when reviewed', 'MoparPartsGiant', 'https://www.moparpartsgiant.com/parts/mopar-latch-liftgate~68305566ac.html')],
  },
};

function defaultDecision(issue) {
  if (overrides[issue.id]) return { id: issue.id, ...overrides[issue.id] };
  const disposition = issue.lane === 'recall/dealer'
    ? 'recall-dealer-no-commerce'
    : issue.lane === 'software/dealer'
      ? 'software-or-dealer-diagnosis-no-commerce'
      : issue.lane === 'service'
        ? 'service-or-adjustment-no-commerce'
        : 'diagnosis-or-fitment-branch-not-specific-enough-no-commerce';
  return {
    id: issue.id,
    disposition,
    repairFirst: issue.solution,
    fixParts: [],
  };
}

const priorFiles = fs.readdirSync(reviewDir)
  .filter((name) => name.endsWith('.json') && name !== 'opus-session-306-master-review-2026-08-29.json');
const prior = new Map();
for (const name of priorFiles) {
  const doc = JSON.parse(fs.readFileSync(path.join(reviewDir, name), 'utf8'));
  for (const decision of doc.decisions || []) prior.set(decision.id, decision);
}

const decisions = source.issues.map((issue) => {
  const decision = overrides[issue.id]
    ? defaultDecision(issue)
    : prior.get(issue.id) || defaultDecision(issue);
  // Public Known Issue commerce intentionally exposes one direct-link type.
  // Repair-and-return services still use that same verified CTA shape; their
  // component/scope copy makes the service nature explicit to the owner.
  return {
    ...decision,
    fixParts: (decision.fixParts || []).map((item) => ({
      ...item,
      buyLinks: (item.buyLinks || []).map((link) => ({
        ...link,
        linkType: ['service', 'product-service', 'repair-service', 'product-variant', 'vehicle-specific-product'].includes(link.linkType)
          ? 'product'
          : link.linkType,
      })),
    })),
  };
});
const ids = new Set(decisions.map((decision) => decision.id));
if (ids.size !== source.issues.length || decisions.length !== 306) {
  throw new Error(`Expected 306 unique decisions, got ${decisions.length} rows / ${ids.size} unique IDs`);
}

const allParts = decisions.flatMap((decision) => decision.fixParts || []);
const allLinks = allParts.flatMap((item) => item.buyLinks || []);
const unverifiedParts = allParts.filter((item) => item.verified !== true);
const unverifiedLinks = allLinks.filter((item) => item.verified !== true);
if (unverifiedParts.length || unverifiedLinks.length) {
  throw new Error(`Render guard failed: ${unverifiedParts.length} unverified parts / ${unverifiedLinks.length} unverified links`);
}

const citationHolds = [
  {
    id: 'audi-s5-sunroof-drain-tube-coupling-failure-flooding-footwells-pilla',
    reason: 'Citation gate: 3 dead / 0 live sources on the 2026-08-29 dry run.',
  },
  {
    id: 'cadillac-deville-northstar-intake-manifold-plenum-rubber-coupler-cracks-cause',
    reason: 'Citation gate: 2 dead / 1 live source on the 2026-08-29 dry run.',
  },
  {
    id: 'cadillac-deville-clogged-coolant-purge-line-hollow-bolt-cause-northstar-overh',
    reason: 'Citation gate: 2 dead / 1 live source on the 2026-08-29 dry run.',
  },
];

const output = {
  schemaVersion: 1,
  batch: 'opus-session-306',
  reviewedAt: '2026-08-29',
  status: 'held-for-user-review-no-production-writes',
  method: 'Every How to Fix was read before commerce classification. Retained destinations were opened in the in-app browser, scoped to supported fitment, and marked verified at both the part and link level. Recall, software, service-only and unresolved fitment branches intentionally remain without retail links.',
  promotionReadiness: {
    dryRunOn: '2026-08-29',
    exactIdsFoundPending: 306,
    citationGateReady: 303,
    citationHolds,
  },
  summary: {
    rowsReviewed: decisions.length,
    approvedCommerceIssues: decisions.filter((decision) => (decision.fixParts || []).length > 0).length,
    approvedParts: allParts.length,
    approvedBuyLinks: allLinks.length,
    noCommerceIssues: decisions.filter((decision) => !(decision.fixParts || []).length).length,
    contentCorrections: decisions.filter((decision) => decision.contentCorrection).length,
    verifiedParts: allParts.filter((item) => item.verified === true).length,
    verifiedBuyLinks: allLinks.filter((item) => item.verified === true).length,
  },
  decisions,
};

function dollars(value) {
  const matches = String(value || '').match(/\$[\d,]+(?:\.\d{1,2})?/g) || [];
  return matches.map((match) => Number(match.replace(/[$,]/g, ''))).filter(Number.isFinite);
}

function publicPart(item) {
  const prices = dollars(item.price);
  return {
    component: item.component,
    oemPartNumber: item.oemPartNumber || '',
    aftermarketXref: Array.isArray(item.aftermarketXref) ? item.aftermarketXref : [],
    priceLow: prices.length ? Math.round(Math.min(...prices)) : null,
    priceHigh: prices.length ? Math.round(Math.max(...prices)) : null,
    note: [item.scope, item.price ? `Price/availability: ${item.price}` : ''].filter(Boolean).join(' '),
    verified: true,
    ...(item.recallFirst === true ? { recallFirst: true } : {}),
    buyLinks: (item.buyLinks || []).map((link) => ({
      vendor: link.vendor,
      url: link.url,
      linkType: 'product',
      verified: true,
    })),
  };
}

const sourceById = new Map(source.issues.map((issue) => [issue.id, issue]));
const resolvedIssues = decisions
  .filter((decision) => (decision.fixParts || []).length > 0)
  .map((decision) => {
    const issue = sourceById.get(decision.id);
    return {
      id: decision.id,
      make: issue.make,
      model: issue.model,
      title: issue.title,
      fixParts: decision.fixParts.map(publicPart),
    };
  });
const makeNames = [...new Set(resolvedIssues.map((issue) => issue.make))].sort((a, b) => a.localeCompare(b));
const makes = makeNames.map((make) => {
  const issues = resolvedIssues.filter((issue) => issue.make === make);
  const parts = issues.flatMap((issue) => issue.fixParts);
  return {
    make,
    issues: issues.length,
    parts: parts.length,
    links: parts.flatMap((item) => item.buyLinks || []).length,
  };
});
const gatedOutput = {
  schemaVersion: 1,
  generatedOn: '2026-08-29',
  source: 'Opus session 306 repair-first review',
  deploymentStatus: 'GATED REVIEW ARTIFACT — NOT PERSISTED OR DEPLOYED',
  result: {
    resolvedIssues,
    stats: {
      makes,
      totals: {
        issues: resolvedIssues.length,
        parts: resolvedIssues.flatMap((issue) => issue.fixParts).length,
        links: resolvedIssues.flatMap((issue) => issue.fixParts).flatMap((item) => item.buyLinks || []).length,
      },
    },
    renderGuard: { intentionalExclusions: [] },
  },
};

fs.writeFileSync(
  path.join(reviewDir, 'opus-session-306-master-review-2026-08-29.json'),
  `${JSON.stringify(output, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(reviewDir, 'opus-session-306-commerce-gated-2026-08-29.json'),
  `${JSON.stringify(gatedOutput, null, 2)}\n`,
);
console.log(JSON.stringify(output.summary, null, 2));
