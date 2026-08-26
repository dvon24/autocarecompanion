#!/usr/bin/env node
/**
 * Generate research wave 9 by reusing wave 8's proven tail (schemas + prompts + pipeline gates)
 * and substituting new EXCLUSIONS and TARGETS.
 *
 * Written in node rather than python on purpose: python's text-mode write turns every \n into \r\n
 * on Windows, and the Workflow tool rejects the result as control characters. Node writes LF.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const TARGETS = [
  { make: 'BMW', model: 'X5', yearsHint: '2000-2025', note: 'E53 2000-2006, E70 2007-2013 (N63 twin-turbo launch engine, subject of the Customer Care Package rework; also the N55 and M57 diesel), F15 2014-2018, G05 2019+ (B58, S63 on M variants). Quarterly-priority make (8 of 39 models covered). BMW\'s best-selling SUV in the US. Tag every issue to the exact engine code - an N63 failure is not an N55 failure.', forums: 'xoutpost.com, bimmerfest.com, bimmerpost.com, x5world.com, r/BMW' },
  { make: 'BMW', model: 'X3', yearsHint: '2004-2025', note: 'E83 2004-2010 (N52, M54; the notorious transfer-case actuator and rear subframe issues), F25 2011-2017 (N20 timing chain guide, N55), G01 2018-2024 (B46/B48, B58), G45 2025+. Quarterly-priority make. The N20 timing-chain failure is engine-code specific - early N20B20A vs the revised unit are not equally affected.', forums: 'bimmerfest.com, bimmerpost.com, xbimmers.com, r/BMW' },
  { make: 'Mercedes-Benz', model: 'C-Class', yearsHint: '2001-2025', note: 'W203 2001-2007 (balance-shaft gear wear on M272, SBC brake pump), W204 2008-2014 (M271 timing chain and camshaft adjuster magnets), W205 2015-2021 (M274, OM651 diesel), W206 2022+. Very high volume. Tag to the exact engine - M271 vs M274 vs M276 failures do not carry across.', forums: 'benzworld.org, mbworld.org, peachparts.com, r/mercedes_benz' },
  { make: 'Mercedes-Benz', model: 'GLC', yearsHint: '2016-2025', note: 'X253 2016-2022 (M274 2.0T, OM654 diesel, 9G-Tronic) and X254 2023+ (M254 with 48V ISG). Mercedes\' best-selling SUV. Recurring themes: MBUX/COMAND faults, 48V mild-hybrid and auxiliary-battery complaints, water intrusion, and the 2023 recall population. Keep the X253 and X254 generations distinct - the M254/48V architecture is new.', forums: 'mbworld.org, benzworld.org, glcforum.com, r/mercedes_benz' },
  { make: 'Lexus', model: 'RX', yearsHint: '1999-2025', note: 'XU10 1999-2003, XU30 2004-2009 (2GR-FE - the rubber oil supply hose recall, VVT-i cam tower leak), AL10 2010-2015, AL20 2016-2022 (2GR-FKS, RX450h hybrid), AL30 2023+ (T24A turbo). The best-selling luxury SUV in the US for two decades. Dashboard melting and infotainment faults recur across generations.', forums: 'clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus' },
  { make: 'Acura', model: 'MDX', yearsHint: '2001-2025', note: 'YD1 2001-2006, YD2 2007-2013 (J37 with VCM - the oil consumption and spark plug fouling complaints, plus torque converter judder), YD3 2014-2020 (J35Y with the ZF 9-speed - widely reported harsh shifting and rollaway concerns), YD4 2022+ (J35 turbo/Type S). The 9-speed and VCM issues are the defining chapters.', forums: 'acurazine.com, mdxers.org, acura-forums.com, r/Acura' },
  { make: 'Subaru', model: 'Impreza', yearsHint: '1993-2025', note: 'GC/GM 1993-2001, GD/GG 2002-2007 (EJ25 head gasket era), GE/GH 2008-2011, GJ/GP 2012-2016 (FB20 - excessive oil consumption class action), GK/GT 2017-2023 (FB20 direct injection), 2024+. Quarterly-priority make. The EJ head-gasket and FB oil-consumption stories are distinct engines - do not merge them. WRX/STI are separate nameplates.', forums: 'nasioc.com, subaruforester.org, subaruoutback.org, iclub.com, r/subaru' },
  { make: 'Nissan', model: 'Titan', yearsHint: '2004-2024', note: 'A60 2004-2015 (VK56DE - rear axle seal leaks, brake master cylinder, the notorious rusted-out bed and frame complaints) and A61 2017-2024 (VK56VD, plus the 5.0 Cummins V8 diesel in the Titan XD, which has its own distinct failures). Quarterly-priority make. Do not carry a Cummins XD issue onto a gas Titan.', forums: 'titantalk.com, clubtitan.org, nissanforums.com, r/NissanTitan' },
  { make: 'Kia', model: 'Optima', yearsHint: '2001-2020', note: 'MS 2001-2005, MG 2006-2010, TF 2011-2015 and JF 2016-2020. SPANS THE THETA II GDI ERA - the 2.4 Theta II rod-bearing failure, engine-fire recalls and the KSDS knock-sensor software campaign are the defining chapter, but the 2.0T and the 1.6T/7DCT have their own separate failures. Tag to the exact engine.', forums: 'kiaoptimaforums.com, optimaforums.com, kia-forums.com, r/kia' },
  { make: 'GMC', model: 'Terrain', yearsHint: '2010-2025', note: 'First gen 2010-2017 (2.4 Ecotec LAF/LEA - heavy oil consumption and timing chain wear, plus the 3.0/3.6 V6) and second gen 2018+ (1.5 LYX and 2.0 LTG turbo, 9T50; the 1.6 diesel early on). Shares the Chevrolet Equinox platform - verify Terrain-specific coverage rather than assuming carryover.', forums: 'gmcterrainforum.com, terraintalk.com, gm-trucks.com, r/GMC' },
  { make: 'Volkswagen', model: 'Golf', yearsHint: '1999-2025', note: 'Mk4 1999-2006, Mk5 2006-2009, Mk6 2010-2014, Mk7 2015-2021, Mk8 2022+. Quarterly-priority make (3 of 22 models covered). EA888 water pump/thermostat housing and PCV, EA211 timing belt, DSG mechatronic faults, and window regulator failures recur. GTI and R are separate nameplates in this catalog - keep issues that are genuinely Golf-wide here.', forums: 'vwvortex.com, golfmk7.com, golfmk6.com, tdiclub.com, r/Volkswagen' },
  { make: 'Dodge', model: 'Charger', yearsHint: '2006-2023', note: 'LX 2006-2010 and LD 2011-2023 (3.6 Pentastar - the cylinder-head/rocker failure on early builds, 5.7 Hemi with the lifter/camshaft failure and MDS, 6.4 and supercharged 6.2 on SRT/Hellcat). TIPM electrical failures are a defining Chrysler-era complaint. Tag to the exact engine - a Hemi lifter failure is not a Pentastar issue.', forums: 'chargerforums.com, lxforums.com, moparts.org, r/DodgeCharger' },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const excl = [];
  for (const t of TARGETS) {
    const rows = await prisma.knownIssue.findMany({
      where: { make: t.make, model: t.model, status: 'published', vehicleType: 'car' },
      select: { title: true, years: true }, orderBy: { title: 'asc' },
    });
    const yrs = [...new Set(rows.flatMap((r) => r.years))].sort((a, b) => a - b);
    excl.push({ make: t.make, model: t.model, existingTitles: rows.map((r) => r.title), yearsCovered: yrs });
    console.log(`  ${(t.make + ' ' + t.model).padEnd(26)} ${String(rows.length).padStart(3)} existing titles`);
  }
  fs.writeFileSync('data/research-wave9-exclusions.json', JSON.stringify(excl, null, 2));

  const src = fs.readFileSync('scripts/_wf-research-wave8-deepen-volume.js', 'utf8').replace(/\r/g, '');
  const tail = src.slice(src.indexOf('\nconst CITATION = {'));

  const header = `/**
 * RESEARCH WAVE 9 - DEEPENING HIGH-VOLUME NAMEPLATES, ROUND 2.
 *
 * Same thesis as wave 8, which worked: the "thin nameplate" population is exhausted, so deepen the
 * high-volume workhorses instead. These 12 sit at 11-15 documented issues while the top-15 US
 * sellers average 56, and every one has a large, long-lived owner community.
 *
 *   X5 15  X3 12  C-Class 15  GLC 11  RX 14  MDX 12
 *   Impreza 13  Titan 13  Optima 14  Terrain 15  Golf 15  Charger 12
 *
 * Covers four quarterly-priority makes (BMW x2, Mercedes-Benz x2, Subaru, Volkswagen, Nissan) plus
 * high-volume Lexus / Acura / Kia / GMC / Dodge.
 *
 * Deep targets, so the exclusion list does the heavy lifting: the headline failures of an X5 or an
 * MDX are already documented, and an unguarded agent would simply rediscover them. Every existing
 * title is passed in and the verifier gates on isDuplicate. Wave 8 confirmed only 38% for exactly
 * this reason - that low pass rate is the gate working, not the wave failing.
 *
 * Carries every prompt fix from waves 3-8: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned as a
 * citation, and per-target engine/generation traps flagged in the notes. Several targets here span
 * multiple unrelated engines under one nameplate (N63 vs N55 X5; EJ vs FB Impreza; Pentastar vs
 * Hemi Charger; gas Titan vs Cummins Titan XD) and the notes say so explicitly.
 */
export const meta = {
  name: 'research-wave9-deepen-volume-2',
  description: 'Wave-9: deepen 12 high-volume nameplates covered at 11-15 issues vs a 56 average. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = ${JSON.stringify(excl, null, 2)}

const TARGETS = ${JSON.stringify(TARGETS, null, 2)}
`;

  let out = (header + tail).replace(/\r/g, '');
  out = out.replace(
    'Wave 8: ${TARGETS.length} high-volume nameplates under-covered vs fleet size',
    'Wave 9: ${TARGETS.length} high-volume nameplates under-covered vs fleet size (round 2)');
  fs.writeFileSync('scripts/_wf-research-wave9-deepen-volume-2.js', out);

  const chk = out.replace(/^export /gm, '');
  let ok = 'OK';
  try { new Function('return (async()=>{' + chk + '})'); } catch (e) { ok = 'FAIL: ' + e.message; }
  console.log(`\nwrote scripts/_wf-research-wave9-deepen-volume-2.js  ${out.length} bytes | syntax ${ok}`);
  console.log(`targets ${TARGETS.length} | exclusion titles ${excl.reduce((s, e) => s + e.existingTitles.length, 0)} | CR chars ${(out.match(/\r/g) || []).length}`);

  await prisma.$disconnect();
  await pool.end();
})();
