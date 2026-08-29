// Build the lead-demand worklist: for the vehicles our interest-email leads
// actually asked about, rank what is missing across all three surfaces —
// known issues, recalls, and DTC codes.
//
// The recall half is the interesting one. Unlike NHTSA complaints, a recall
// campaign carries a REMEDY, so an uncovered campaign is a known-issue draft
// that needs no research wave to write: defect, consequence, and fix all arrive
// from the government feed already cited.
//
//   node scripts/_lead-gap-report.js
const fs = require('fs');

const recalls = JSON.parse(fs.readFileSync('data/_lead-recall-gaps.json', 'utf8'));
const dtc = JSON.parse(fs.readFileSync('data/_lead-dtc-gaps.json', 'utf8'));
const coverage = JSON.parse(fs.readFileSync('data/_lead-coverage.json', 'utf8'));

const dtcBy = new Map(dtc.rows.map((r) => [r.vehicle, r]));
const covBy = new Map(coverage.map((r) => [r.vehicle, r]));

// 'increasing the risk of a crash' is NHTSA boilerplate on 81% of campaigns, and
// 'injury' on 37% — neither discriminates. Fire, death, and loss of control do.
const urgent = (r) => r.parkIt ||
  /fires?|death|fatal|loss of (vehicle )?control/i.test(r.consequence || '');

const rows = recalls.map((r) => {
  const d = dtcBy.get(r.vehicle) || {};
  const c = covBy.get(r.vehicle) || {};
  const urgentCount = (r.uncoveredList || []).filter(urgent).length;
  return {
    vehicle: r.vehicle,
    leads: r.leads,
    status: r.status,
    published: r.published,
    pending: c.pend || 0,
    recalls: r.recalls,
    uncoveredRecalls: r.uncovered,
    urgentUncovered: urgentCount,
    dtcTaggedPct: d.taggedPct == null ? null : d.taggedPct,
    missingCodes: (d.missingFromLibrary || []).length,
    // What a lead would actually receive, weighted by how many leads are waiting.
    score: r.leads * (urgentCount * 3 + (r.uncovered - urgentCount)),
  };
});

rows.sort((a, b) => b.score - a.score);

const line = (s) => console.log(s);
line('');
line('=== LEAD-DEMAND GAP WORKLIST ===');
line('');
line('lds  pub  pend  recalls  uncov  urgent  dtc%  score  vehicle');
for (const r of rows.filter((x) => x.score > 0)) {
  line(
    String(r.leads).padStart(3) + String(r.published).padStart(5) + String(r.pending).padStart(6) +
    String(r.recalls).padStart(9) + String(r.uncoveredRecalls).padStart(7) +
    String(r.urgentUncovered).padStart(8) +
    String(r.dtcTaggedPct == null ? '-' : r.dtcTaggedPct).padStart(6) +
    String(r.score).padStart(7) + '  ' + r.vehicle
  );
}

const ok = rows.filter((r) => r.status === 'ok');
const blocked = rows.filter((r) => r.status !== 'ok');
line('');
line('TOTALS across ' + rows.length + ' lead vehicles (' + rows.reduce((s, r) => s + r.leads, 0) + ' leads)');
line('  resolved against NHTSA:      ' + ok.length);
line('  uncovered recall campaigns:  ' + ok.reduce((s, r) => s + r.uncoveredRecalls, 0));
line('  of those, fire/death/control: ' + ok.reduce((s, r) => s + r.urgentUncovered, 0));
// Keep these three apart: "throttled" is a retryable tooling state, while the
// other two are permanent facts about the vehicle. Collapsing them would read
// as "no data exists" for vehicles we simply have not finished fetching.
const g = (st) => blocked.filter((b) => b.status === st);
line('  EU-market, no NHTSA data:    ' + g('not-in-nhtsa').length + '  (' + g('not-in-nhtsa').map((b) => b.vehicle).join(', ') + ')');
line('  no matching NHTSA model:     ' + g('no-nhtsa-model').length + '  (' + g('no-nhtsa-model').map((b) => b.vehicle).join(', ') + ')');
line('  UNRESOLVED (throttled):      ' + g('unknown').length + '  (' + g('unknown').map((b) => b.vehicle).join(', ') + ')');
if (g('unknown').length) line('    -> not clean, just unfetched. Re-run scripts/_lead-recall-harvest.js to settle.');

// The single most actionable slice: urgent, uncovered, on a vehicle with a lead.
const top = [];
for (const r of recalls) {
  if (r.status !== 'ok') continue;
  for (const u of r.uncoveredList || []) {
    if (urgent(u)) top.push({ vehicle: r.vehicle, leads: r.leads, ...u });
  }
}
top.sort((a, b) => b.leads - a.leads || (b.parkIt ? 1 : 0) - (a.parkIt ? 1 : 0));
fs.writeFileSync('data/_lead-urgent-recalls.json', JSON.stringify(top, null, 2));
line('');
line('Top urgent uncovered campaigns (full list -> data/_lead-urgent-recalls.json):');
for (const t of top.slice(0, 25)) {
  line('  [' + t.leads + ' lead' + (t.leads > 1 ? 's' : '') + '] ' + t.vehicle.padEnd(26) +
    t.campaign.padEnd(12) + (t.parkIt ? 'PARK-IT ' : '') + String(t.component).slice(0, 60));
}
line('');
line('DTC: ' + dtc.missingFromLibrary.length + ' cited codes missing from the library; ' +
  dtc.proseOnly.length + ' codes sit in prose but were never tagged.');
