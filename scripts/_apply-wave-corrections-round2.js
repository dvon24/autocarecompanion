#!/usr/bin/env node
/**
 * Round 2 of the QA-gate corrections: wave 4 (never gated until now) plus the residuals in
 * waves 5 and 6. ZERO AI, auditable. Each edit traces to a `_verdictReason` where the verifier
 * confirmed the issue while stating a factual error inside it.
 *
 * Usage: node scripts/_apply-wave-corrections-round2.js [--apply]
 */
const fs = require('fs');
const APPLY = process.argv.includes('--apply');
const F4 = 'data/research-wave4-2026-08-21-final.json';
const F6 = 'data/research-wave6-2026-08-21-final.json';
const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const log = [];

const d4 = load(F4);
const d6 = load(F6);
const w4 = d4.result.confirmed;
const w6 = d6.result.confirmed;
const find = (arr, frag) => arr.find((i) => i.title.includes(frag));

// W4-1  EQE steering coupling bolt - unit count is 3,749 per the Part 573 report (not ~4,300),
// and the owner-noticed symptom progression is not stated in any source.
{
  const x = find(w4, 'Steering Coupling Bolt');
  if (x) {
    if (x.description.includes('roughly 4,300')) {
      x.description = x.description.replace('roughly 4,300', '3,749');
      log.push('W4-1 unit count corrected to 3,749 (Part 573 report)');
    }
    const unsourced = ['Knocking or clunking noise from the steering column', 'Rattle from the steering area over bumps', 'Vague or loose on-center steering feel', 'Steering wheel play'];
    const before = x.symptoms.length;
    x.symptoms = x.symptoms.filter((s) => !unsourced.includes(s));
    if (!x.symptoms.some((s) => /no warning/i.test(s))) {
      x.symptoms.unshift('Often no owner-noticeable warning - the defect is a skipped factory torque step, identified by VIN rather than by symptom');
    }
    if (x.symptoms.length !== before) log.push('W4-1 removed 4 unsourced symptoms, added the VIN-identified framing');
    x._correctionApplied = '2026-08-21: unit count corrected to 3,749; unsourced symptom progression removed.';
  }
}

// W4-2  EQE 12V AGM - claim overstates the magnitude (owners report ~1-2%/day, not 5-10%) and the
// OBD-dongle/app-polling causality is owner speculation, not a confirmed root cause.
{
  const x = find(w4, '12V AGM Battery Discharge');
  if (x) {
    if (x.description.includes('5-10%/day')) {
      x.description = x.description.replace('5-10%/day standing loss (vs. the normal 0-2% over several days)', 'roughly 1-2%/day standing loss in owner reports (against a normal figure well under 1%)');
      log.push('W4-2 corrected the standing-loss figure to the owner-reported 1-2%/day');
    }
    for (const k of ['description', 'solution']) {
      if (/OBD|dongle/i.test(x[k]) && !/owner speculation/i.test(x[k])) {
        x[k] = x[k].replace(/(OBD[- ]?I{0,2}\w*\s*dongle[^.]*\.)/i, '$1 (Owner speculation - no manufacturer bulletin confirms an OBD dongle or app polling as the root cause.)');
        log.push('W4-2 marked the OBD-dongle causality as owner speculation in ' + k);
      }
    }
    x._correctionApplied = '2026-08-21: magnitude corrected to owner-reported 1-2%/day; OBD-dongle causality marked as speculation.';
  }
}

// W4-3  EQE MBUX - the "reboot ~50 seconds after start-up" detail traces to a Mercedes MBUX recall
// on MY2019-2021 ICE models, not the EQE. Imported from another platform; drop it.
{
  const x = find(w4, 'MBUX Head Unit Black Screen');
  if (x) {
    const before = x.description;
    x.description = x.description.replace(/\s*\(a reboot roughly 50 seconds after initial start-up\)/i, '');
    if (x.description !== before) log.push('W4-3 dropped the "~50 seconds after start-up" detail (belongs to a MY2019-2021 ICE MBUX recall)');
    x._correctionApplied = '2026-08-21: removed the 50-second reboot detail imported from a different platform recall.';
  }
}

// W4-4  EQS SUV Hyperscreen - the second citation is a 2022 EQC thread, wrong nameplate.
{
  const x = find(w4, 'Hyperscreen Blackout');
  if (x) {
    const before = x.citations.length;
    x.citations = x.citations.filter((c) => !c.url.includes('multimedia-display-frozen.2013'));
    if (x.citations.length < before) log.push('W4-4 dropped the mbeqclub citation (2022 EQC, wrong nameplate)');
    x._correctionApplied = '2026-08-21: dropped a citation that was a 2022 EQC thread, not an EQS SUV.';
  }
}

// W4-5  EQS SUV climate - the A/C half is genuine for the X296, but the "heat goes cold after
// 10-15 minutes" half traces to EQB / EQS sedan threads, not the SUV. Scope the claim to A/C.
{
  const x = find(w4, 'Intermittent Climate Control Failure');
  if (x) {
    const before = x.description;
    x.description = x.description
      .replace(/Owners report two recurring failures: /i, 'The documented failure on the EQS SUV is ')
      .replace(/, and heating that goes cold after 10-15 minutes or fails to deliver[^.]*\./i, '. (Similar heating complaints exist on the EQB and EQS sedan but are not documented on the SUV, so they are excluded here.)');
    if (x.description !== before) log.push('W4-5 scoped the claim to the A/C failure; heating half excluded as EQB/EQS-sedan sourced');
    x._correctionApplied = '2026-08-21: heating half removed - sourced from EQB/EQS sedan, not the X296 SUV.';
  }
}

// W6-4  Honda Ridgeline 9AT - verifier asked to check overlap with the existing rough-shifting
// record. Checked: the DB carries "10-Speed Transmission - Rough Shifting and Programming Defect"
// on the 2020-2023 Ridgeline, but the 2020+ Ridgeline uses a ZF 9HP NINE-speed (the 10AT does not
// physically fit the platform). The existing published record is wrong about the transmission;
// this new entry is correct. Flag it for the persist step rather than silently creating a near-duplicate.
{
  const x = find(w6, 'ZF 9-Speed (9AT)');
  if (x) {
    x._publishNote = '2026-08-21 OVERLAP CHECKED: the published DB record "10-Speed Transmission - Rough Shifting and Programming Defect" (Honda Ridgeline, 2020-2023) describes the same complaint but names the WRONG transmission - the 2020+ Ridgeline uses a ZF 9HP 9-speed. Fix or archive that record when persisting this one, or the site will carry two contradictory entries.';
    x._correctionApplied = '2026-08-21: overlap checked against the existing 10-speed record; see _publishNote.';
    log.push('W6-4 Ridgeline overlap checked - flagged the incorrect existing 10-speed record');
  }
}

console.log(APPLY ? 'APPLIED:' : 'DRY RUN (re-run with --apply):');
log.forEach((l) => console.log('  - ' + l));
console.log('\n' + log.length + ' edits');
if (APPLY) {
  fs.writeFileSync(F4, JSON.stringify(d4, null, 2));
  fs.writeFileSync(F6, JSON.stringify(d6, null, 2));
  console.log('wrote wave 4 and wave 6 final files in place');
}
