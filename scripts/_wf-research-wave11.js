/**
 * RESEARCH WAVE 11 - FOUR THESES IN ONE WAVE (EVs, newer vehicles, top sellers, thin nameplates)
 * PLUS the motorcycle class.
 *
 * GENERATED FILE. Edit scripts/_wave11-body.js and re-run scripts/_gen-wave11.js instead.
 *
 * Every previous wave carried ONE thesis and one prompt. This one carries five, selected per target
 * by `style`, because the evidence lives somewhere different in each case:
 *
 *   'ev' / 'new'  OFFICIAL FIRST. On a vehicle launched 1-3 years ago the forums are thin, and
 *                 demanding forum corroboration is exactly the condition under which an agent starts
 *                 inventing plausible-looking threads. A recall campaign number is a CHECKABLE FACT -
 *                 api.nhtsa.gov returns the make/model/years for a real one and nothing for an
 *                 invented one, and _audit-wave-recalls.js runs that check over the whole wave after.
 *   'volume'      FORUM FIRST. A ten-year-old top-seller has a deep owner community that holds detail
 *                 no government summary captures. These nameplates are not thin because they are
 *                 clean; they are thin because no wave has deepened them yet.
 *   'thin'        FORUM FIRST, and explicitly told the low count is a COVERAGE GAP, not evidence of
 *                 reliability - CX-7 turbo failures and 350Z clutch/CSC failures are notorious.
 *   'moto'        Motorcycle failure surface, and every row is emitted with vehicleType='motorcycle'
 *                 so it can never be counted into the automotive catalog. Make names COLLIDE across
 *                 classes (Suzuki V-Strom vs Suzuki Vitara), which is why the column exists.
 *
 * NO NUMERIC CONFIDENCE GATE. Previous waves dropped anything under 0.70 self-reported confidence.
 * That is unsafe here: self-reported confidence tracks PROMPT WORDING rather than belief (measured
 * 0.70-0.72 vs 0.20-0.33 on identical work), and this wave runs FIVE different prompts, so the
 * numbers are not comparable across targets - a threshold would silently delete the thin and
 * motorcycle results while keeping the EV ones. The gates below are all EVIDENCE gates: real,
 * live citation, at least one non-aggregator source, not a duplicate, citations present. The
 * confidence number is still recorded for the persist step's high/medium/low mapping.
 *
 * ENUM DISCIPLINE: category and severity use the SAME closed sets as the rest of the catalog. The
 * renderer knows 17 categories and high/medium/low only; a wider enum from a research workflow has
 * previously crashed article pages for 39 models. EV and motorcycle concepts must map INTO the
 * existing set, never extend it.
 */
export const meta = {
  name: 'research-wave11-four-bucket',
  description: 'Wave-11: 26 targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "ev",
    "make": "Chevrolet",
    "model": "Bolt EUV",
    "yearsHint": "2022-2023",
    "note": "NET-NEW NAMEPLATE - zero rows in this catalog today, while the Bolt EV sibling has 7. The EUV is a separate, longer nameplate sold only for 2022-2023 and it sits squarely inside the LG Chem battery-cell recall (NHTSA 21V560 and the earlier 20V701/21V130 campaigns) that led GM to tell owners to park outdoors and limit charge to 90%. That recall is the defining chapter and the single most checkable fact about this car. Also documented: DC fast-charge derating, 12V accessory battery drain, Super Cruise faults on the Premier, heat-pump/resistive-heat complaints and infotainment reboots. Do NOT assume every Bolt EV campaign covers the EUV - confirm the nameplate appears in the campaign.",
    "forums": "chevybolt.org, boltev.forum, gm-volt.com, r/BoltEV, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Chevrolet",
    "model": "Bolt EV",
    "yearsHint": "2017-2023",
    "note": "Only 7 documented issues for a car at the centre of the largest EV battery recall in US history - a clear coverage gap, not a clean vehicle. 2017-2019 used LG cells with the anode tab tear and folded separator defects; the full remedy was module replacement under 20V701 / 21V130 / 21V560. Beyond the battery: 12V battery drain, the well-documented \"Propulsion Power Reduced\" / turtle-mode faults, charge-cord (occ) failures, heater and heat-pump complaints, and the 2019 restyle differences. The 2020 refresh changed the pack chemistry - keep the pre- and post-2020 stories distinct.",
    "forums": "chevybolt.org, gm-volt.com, boltev.forum, r/BoltEV, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Volvo",
    "model": "XC40 Recharge",
    "yearsHint": "2021-2025",
    "note": "NET-NEW NAMEPLATE - zero rows today, though the sibling C40 Recharge has 4 and the ICE XC40 has its own. This catalog lists Recharge variants as separate nameplates, so do that here. CMA platform BEV. Documented themes: the 2022-23 software recall over a blank driver display / instrument cluster failing to show the required telltales, sudden power loss campaigns, 12V auxiliary battery drain, DC fast-charge faults, and the widely reported Google-based infotainment freezes and OTA failures. Quarterly-priority make (Volvo, 4 of 26 models covered). Do not carry ICE XC40 issues here - the powertrain shares nothing.",
    "forums": "swedespeed.com, volvoforums.org.uk, xc40forum.com, r/Volvo, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Genesis",
    "model": "GV60",
    "yearsHint": "2023-2026",
    "note": "Only 3 documented issues. E-GMP platform, sibling to the Ioniq 5 and Kia EV6 - and the ICCU (Integrated Charging Control Unit) failure that strands E-GMP cars with a dead 12V is the defining story of the whole platform, with its own recalls and extended warranty. Confirm which campaigns actually name the GV60 rather than assuming Ioniq 5 coverage carries. Also: the fingerprint/face-recognition entry system, Crystal Sphere rotating shifter, boost-mode drive unit complaints, and 800V charging faults.",
    "forums": "genesisownersclub.com, ioniqforum.com, ev6forum.com, r/GenesisMotors, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Nissan",
    "model": "Ariya",
    "yearsHint": "2023-2026",
    "note": "Only 5 documented issues on a mainstream EV three model years in. Nissan CMF-EV platform (shared with the Renault Megane E-Tech, which is in this catalog with 1 row). Documented themes: the 2023-24 recall over loose/incorrectly-torqued front driveshaft bolts causing power loss, e-4ORCE drive-unit faults, DC fast-charge speed derating and CHAdeMO-to-CCS transition confusion, 12V battery drain, ProPILOT faults, and infotainment/OTA failures. Quarterly-priority make (Nissan, 5 of 27 models).",
    "forums": "ariyaforum.com, nissanariyaforum.com, mynissanleaf.com, r/Ariya, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Ford",
    "model": "Mustang Mach-E",
    "yearsHint": "2021-2026",
    "note": "Only 7 documented issues on a high-volume EV in its sixth model year. The defining chapter is the HV battery main contactor overheating recall (22V-903 and the 2024 follow-up 24V-XXX series) which caused loss of motive power - a genuinely checkable campaign. Also: the 2021-22 windshield and panoramic roof glass bonding recall, 12V battery drain, the \"Stop Safely Now\" message, BlueCruise faults, SYNC 4A freezes, and DC fast-charge derating on the 2021-22 pack before the OTA improvements. Extended-range vs standard-range packs (LG vs SK cells) differ - note which applies.",
    "forums": "macheforum.com, mustang6g.com, fordev.forum, r/MachE, r/electricvehicles"
  },
  {
    "style": "new",
    "make": "Lexus",
    "model": "TX",
    "yearsHint": "2024-2026",
    "note": "NET-NEW NAMEPLATE - zero rows today. Lexus' three-row crossover launched for 2024 on the TNGA-K platform, closely related to the Toyota Grand Highlander (also in this wave - keep them SEPARATE and do not copy findings across; confirm the nameplate in any campaign). Three powertrains with different failure surfaces: TX 350 (T24A-FTS 2.4T), TX 500h (hybrid 2.4T), TX 550h+ (PHEV V6). Early-build themes to check: 2024 recalls, the 2.4T turbo and its wastegate, hybrid battery and inverter faults, the 14-inch infotainment, and third-row seat/latch campaigns. Quarterly note: Lexus is thin at 98 issues across 18 models.",
    "forums": "clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "new",
    "make": "Mazda",
    "model": "CX-90",
    "yearsHint": "2024-2026",
    "note": "Only 9 documented issues on Mazda's new flagship. This is an all-new large-platform vehicle: longitudinal e-Skyactiv G 3.3 inline-six with a 48V mild hybrid, an 8-speed automatic that uses a WET MULTI-PLATE CLUTCH instead of a torque converter, plus a PHEV four-cylinder. The clutch-pack transmission is the source of the widely reported low-speed shudder, jerky take-up and hesitation complaints, and it is architecturally unlike anything else Mazda sells - do not describe it as a conventional automatic. Also: 48V/MHEV starter-generator faults, infotainment and CarPlay, and the launch-year recalls.",
    "forums": "cx90forum.com, mazdas247.com, mazdaforum.com, r/mazda, r/CX90"
  },
  {
    "style": "new",
    "make": "Hyundai",
    "model": "Santa Cruz",
    "yearsHint": "2022-2026",
    "note": "Only 10 documented issues. Unibody pickup on the Tucson platform. TWO POWERTRAINS WITH VERY DIFFERENT RECORDS: the 2.5 naturally aspirated with an 8-speed conventional automatic, and the 2.5T with the 8-speed WET DUAL-CLUTCH - the DCT is the source of most drivability complaints (shudder, hesitation from a stop, overheating in traffic). Also: the tonneau cover and bed drainage, IVT-era Hyundai electrical themes, ABS/HECU fuse recalls that swept several Hyundai nameplates, and the 2023 facelift changes. Tag to the exact engine - a DCT complaint is not a 2.5 NA issue.",
    "forums": "santacruzforums.com, hyundai-forums.com, tucsonforums.com, r/SantaCruz, r/Hyundai"
  },
  {
    "style": "new",
    "make": "GMC",
    "model": "Canyon",
    "yearsHint": "2023-2026",
    "note": "Only 10 documented issues, and the 2023 redesign was a clean break: the entire lineup moved to the 2.7L Turbo (L3B/L2R High-Output) with the 8L80 8-speed - no V6, no diesel. AT4X and AT4X AEV are new. Recurring themes to check: the 2.7T timing chain and active fuel management, turbo actuator faults, the 8-speed shudder/torque-converter history GM carries, infotainment and the 11.3-inch Google-built system, and the launch-year recalls. The Chevrolet Colorado (19 issues here) is the platform twin - a shared defect is plausible but confirm the Canyon is named.",
    "forums": "gm-trucks.com, coloradofans.com, canyonforum.com, r/GMC, r/ColoradoZR2"
  },
  {
    "style": "new",
    "make": "Toyota",
    "model": "Grand Highlander",
    "yearsHint": "2024-2026",
    "note": "Only 11 documented issues. Launched 2024 on TNGA-K, a different and larger vehicle from the Highlander (36 issues here) - keep them SEPARATE and confirm the nameplate in any campaign. Three powertrains: 2.4T (T24A-FTS), Hybrid 2.5, and Hybrid MAX 2.4T. THE DEFINING EARLY STORY is the 2024-25 recall of Hybrid MAX / 2.4T units over machining debris left in the engine causing knock and engine failure (the same defect that swept the Tundra and Lexus LX with the V35A) - verify which engine and campaign actually apply here. Also: transmission hesitation, 12.3-inch infotainment, and third-row/seat-belt campaigns.",
    "forums": "grandhighlanderforum.com, toyotanation.com, highlanderclub.com, r/Toyota"
  },
  {
    "style": "new",
    "make": "Chevrolet",
    "model": "Trax",
    "yearsHint": "2024-2026",
    "note": "Only 11 documented issues on what became one of Chevrolet's best-selling vehicles almost immediately. The 2024 redesign is a COMPLETELY different car from the 2015-2022 Trax: new platform, and a single 1.2L turbo three-cylinder (LIH) with a 6-speed automatic replacing the 1.4T. Do not carry old-Trax issues onto it - check which generation any complaint belongs to. Themes to check: the 1.2T three-cylinder (turbo, carbon, timing chain, oil consumption), the 6-speed, the 11-inch infotainment, and the launch-year recalls including any seat-belt or airbag campaigns.",
    "forums": "chevytraxforum.com, chevroletforum.com, gm-trucks.com, r/Chevy"
  },
  {
    "style": "volume",
    "make": "Mazda",
    "model": "CX-5",
    "yearsHint": "2013-2025",
    "note": "Mazda's best-selling vehicle worldwide and it carries only 18 issues while comparable-volume nameplates in this catalog average 50+. KE 2013-2016 (Skyactiv-G 2.0/2.5, the well-documented infotainment/TCU 3G-sunset bricking and the daytime running lamp recall), KF 2017-2025 (2.5T, plus the 2.2 Skyactiv-D diesel briefly in the US and widely in the EU - DPF regeneration and oil dilution are the diesel story). Recurring: cylinder deactivation on the 2.5 from 2018, front strut and sway-bar noise, A/C compressor and condenser failures, windshield cracking, and the melting/peeling dashboard complaints.",
    "forums": "mazdas247.com, cx5forums.com, mazdaforum.com, club-cx5.com, r/mazda"
  },
  {
    "style": "volume",
    "make": "Hyundai",
    "model": "Tucson",
    "yearsHint": "2005-2025",
    "note": "Only 19 issues across FOUR generations of a top-10 US crossover. JM 2005-2009, LM 2010-2015 (the 2.0/2.4 Theta II era - the rod-bearing and engine-fire recalls and the KSDS knock-sensor campaign apply to specific engines and build plants, so tag exactly), TL 2016-2021 (the 1.6T with the 7-speed DCT - shudder, hesitation and the separate 2.0 Nu), NX4 2022-2025 (2.5 NA, plus hybrid and PHEV with the 1.6T). Also across generations: the ABS/HECU module fires that triggered park-outside recalls, and IVT/CVT complaints. Quarterly-priority make. Do NOT merge a Theta II failure with a Nu or a 1.6T failure.",
    "forums": "hyundai-forums.com, tucsonforums.com, hyundaiforums.net, r/Hyundai"
  },
  {
    "style": "volume",
    "make": "Kia",
    "model": "Telluride",
    "yearsHint": "2020-2025",
    "note": "Only 20 issues on Kia's halo three-row and a consistent segment best-seller. Single powertrain (3.8 Lambda II V6, 8-speed automatic) which makes engine-code tagging easy but means the issues cluster elsewhere. Documented: the 2023-24 park-outside recall over the tow-hitch harness fire risk (a large, checkable campaign), the seat-motor/power-seat fire recall, oil consumption and piston-ring complaints on the Lambda II, transmission harshness, wind noise and roof-rack water intrusion, and UVO/infotainment faults. The Hyundai Palisade is the platform twin (10 recent issues) - shared defects are plausible but confirm the nameplate.",
    "forums": "tellurideforums.com, kia-forums.com, palisadeforums.org, r/Telluride, r/kia"
  },
  {
    "style": "volume",
    "make": "Kia",
    "model": "Sportage",
    "yearsHint": "2005-2025",
    "note": "Only 22 issues across four generations of a global high-volume crossover. KM 2005-2010, SL 2011-2016 (2.4 Theta II and the 2.0T - the rod-bearing/engine-fire and KSDS chapters), QL 2017-2022 (2.4 GDI and 1.6T with the 7DCT), NQ5 2023-2025 (2.5 NA, plus hybrid and PHEV). Also: the ABS/HECU fire recalls that swept the Kia/Hyundai range, sunroof shattering, and the 1.6T DCT judder. Tag to the exact engine - the Theta II story and the 1.6T story are different failures on different hardware, and merging them is the most common error on this nameplate.",
    "forums": "kia-forums.com, kiasportageforum.com, kiaforums.com, r/kia"
  },
  {
    "style": "volume",
    "make": "Volkswagen",
    "model": "Jetta",
    "yearsHint": "1999-2025",
    "note": "Only 24 issues (plus 4 pending) across five generations of VW's highest-volume US nameplate. Mk4 1999-2005 (window regulators, coil packs, the ALH/BEW TDI), Mk5 2005-2010 (2.5 five-cylinder, the 2.0T FSI cam follower, and the BRM TDI), Mk6 2011-2018 (1.8T EA888 Gen3 water pump and PCV, the EA189 diesel at the centre of the emissions scandal), Mk7 2019-2025 (1.4T/1.5T EA211). Quarterly-priority make (VW, 3 of 22 models covered). GLI is a separate nameplate concern - keep genuinely Jetta-wide issues here. Tag to the exact engine code.",
    "forums": "vwvortex.com, tdiclub.com, jettaforums.com, vwforum.com, r/Volkswagen"
  },
  {
    "style": "volume",
    "make": "Hyundai",
    "model": "Elantra",
    "yearsHint": "2001-2025",
    "note": "29 issues across five generations of a perennial top-20 US seller - still light for the volume. XD 2001-2006, HD 2007-2010, MD 2011-2016 (the Nu 1.8 - oil consumption, plus the widely reported steering-column/MDPS clunk and the fuel-economy restatement), AD 2017-2020 (the 2.0 Nu and the 1.6T), CN7 2021-2025 (2.0 Smartstream, the N with the 2.0T, plus hybrid). Also: the ABS/HECU fire recalls, the piston-ring/engine-seizure campaigns on Nu and Gamma engines, and the well-publicised 2015-2021 theft vulnerability from the missing engine immobiliser. Quarterly-priority make.",
    "forums": "hyundai-forums.com, elantraxd.com, hyundaiforums.net, r/Hyundai, r/Elantra"
  },
  {
    "style": "thin",
    "make": "Acura",
    "model": "TLX",
    "yearsHint": "2015-2025",
    "note": "Only 3 documented issues on a nameplate that has been on sale for a decade. UB1/UB2 2015-2020: the K24 2.4 with the 8-SPEED DUAL-CLUTCH (DCT) - harsh engagement, hesitation and the torque-converter-equipped DCT's own faults - and the J35 3.5 V6 with the 9-speed ZF (the same 9AT widely reported for harsh shifting and rollaway across Acura/Honda). Precision All-Wheel Steer and SH-AWD are TLX-specific hardware. UB5 2021-2025: all-new, 2.0T and the Type S 3.0T V6 with a 10-speed. Keep the two generations and the two transmissions strictly separate.",
    "forums": "acurazine.com, acura-forums.com, tlxforums.com, r/Acura"
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "CX-7",
    "yearsHint": "2007-2012",
    "note": "Only 2 documented issues on a vehicle with a genuinely notorious record. The 2.3 DISI turbo (MZR DISI) is the story: TURBOCHARGER FAILURE from oil-feed pipe coking and carbon buildup, timing chain stretch and the chain guide/VVT actuator noise, and heavy oil consumption - all extensively documented and the subject of extended warranties in several markets. Also: the 2.5 naturally aspirated added for 2010, front lower control arm and ball joint wear, rear subframe and suspension corrosion in salt states, A/C compressor failure, and water pump leaks. This is a coverage gap, not a clean vehicle.",
    "forums": "mazdas247.com, cx7forums.com, mazdaforum.com, r/mazda"
  },
  {
    "style": "thin",
    "make": "Lexus",
    "model": "GS",
    "yearsHint": "1998-2020",
    "note": "Only 4 issues (this catalog also holds GS300 with 2 - keep genuinely GS-wide findings here). S160 1998-2005 (2JZ-GE and the 3UZ V8 on the GS400/430), S190 2006-2011 (the 2GR-FSE - and the RUBBER OIL SUPPLY HOSE recall plus the VVT-i oil line failure that swept the 2GR family, along with the GS450h hybrid), L10 2013-2020 (2GR-FKS, the GS F with the 2UR-GSE 5.0 V8). Recurring: dashboard melting/stickiness in heat (a well-documented Toyota/Lexus complaint of this era), air suspension on equipped cars, and infotainment/navigation faults. Quarterly note: Lexus is thin overall.",
    "forums": "clublexus.com, lexusownersclub.com, gs300.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "thin",
    "make": "Nissan",
    "model": "350Z",
    "yearsHint": "2003-2009",
    "note": "Only 4 issues on a car with one of the largest enthusiast communities of its generation. Z33 with the VQ35DE (2003-2006, the DE and the revised REV-UP HR-precursor) and the VQ35HR from 2007 - and these are DIFFERENT engines with different failure records, which is the main tagging trap. Documented: heavy oil consumption on the early DE, the well-known tyre feathering/rear-tyre wear from suspension geometry, clutch and CSC (concentric slave cylinder) failures on the 6-speed, catalytic converter failure sending debris back into the engine, window motor/regulator failure, and rear differential and driveshaft bushing wear.",
    "forums": "my350z.com, 350z-tech.com, nico club (nicoclub.com), the350z.com, r/350z"
  },
  {
    "style": "moto",
    "make": "Harley-Davidson",
    "model": "Sportster",
    "yearsHint": "2004-2022",
    "note": "RE-RUN: this nameplate's discover agent returned EMPTY in the pilot from search starvation, not because the machine is clean. Evolution 883/1200 air-cooled V-twin, rubber-mounted frame from 2004. Long-documented themes: cam chain tensioner and cam bearing wear, primary chain adjuster, stator and voltage regulator failure, oil weep from the cam cover, and the 2014+ ABS/ECU electrical faults. The 2021+ Sportster S is a COMPLETELY different bike (liquid-cooled Revolution Max 1250T) - do NOT carry Evolution issues onto it.",
    "forums": "xlforum.net, hdforums.com, thesportsterandbuellmotorcycleforum.com, r/Harley"
  },
  {
    "style": "moto",
    "make": "Honda",
    "model": "Gold Wing",
    "yearsHint": "2001-2025",
    "note": "RE-RUN: returned EMPTY in the pilot from search starvation, not from being clean. GL1800 flat-six. Two eras: 2001-2017 (the long-running chassis, subject of a major NHTSA recall for the secondary fuel-pump/fuel-feed hose and a separate steering-stem bearing issue) and 2018+ (all-new chassis, 7-speed DCT option). Recurring: final drive splines and dry spline wear, rear brake caliper corrosion, alternator/stator failure, and airbag/electrical complaints. Distinguish the two generations - they share almost nothing structurally.",
    "forums": "goldwingfacts.com, gl1800riders.com, wingstuff forums, r/goldwing"
  },
  {
    "style": "moto",
    "make": "Suzuki",
    "model": "V-Strom 650",
    "yearsHint": "2004-2025",
    "note": "RE-RUN: returned EMPTY in the pilot from search starvation. MAKE COLLISION - this catalog also holds Suzuki Vitara, Swift, Jimny, SX4 (cars). DL650 with the SV650-derived 645cc 90-degree V-twin. Recurring: regulator/rectifier and stator failure (the signature electrical complaint), fuel pump and FI issues, second-gear and clutch basket wear, cam chain tensioner, and rear shock linkage bearing seizure from lack of grease. 2012+ got a revised engine and 2017+ another revision - note which applies.",
    "forums": "stromtrooper.com, vstrom.info, wee-strom forums, r/Vstrom, r/SuzukiMotorcycles"
  },
  {
    "style": "moto",
    "make": "Kawasaki",
    "model": "Ninja 650",
    "yearsHint": "2006-2025",
    "note": "NET-NEW NAMEPLATE and a NET-NEW MAKE for this catalog - Kawasaki has zero rows today. ER-6f/Ninja 650R 2006-2011, 2012-2016, and the 2017+ redesign onto the trellis-frame platform shared with the Z650 and Versys 650, all using the 649cc parallel twin. Recurring documented themes: regulator/rectifier and stator charging failures (the signature complaint on this engine family), fuel pump and FI faults, cam chain tensioner noise, clutch slave cylinder leaks, fork seal and rear shock wear, and the 2020+ TFT/Bluetooth dash issues. Also check NHTSA recalls - Kawasaki files them like any other manufacturer.",
    "forums": "ninja650.net, kawiforums.com, ninjette.org, exriders.com, r/Kawasaki, r/motorcycles"
  }
]

const EXCLUSIONS = [
  {
    "make": "Chevrolet",
    "model": "Bolt EUV",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Chevrolet",
    "model": "Bolt EV",
    "existingTitles": [
      "Battery Capacity Degradation Over Time",
      "Cabin Heater Failure in Cold Weather",
      "DC Fast Charging Speed Reduction After Battery Recall",
      "Front Drive Motor Bearing Noise",
      "High-Voltage Battery Fire Risk (Recall)",
      "High-Voltage Battery Fire Risk Recall (NHTSA 21V-560)",
      "Infotainment Screen Ghosting and Flickering",
      "Infotainment System Freezing and Black Screen"
    ],
    "yearsCovered": [
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023
    ]
  },
  {
    "make": "Volvo",
    "model": "XC40 Recharge",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Genesis",
    "model": "GV60",
    "existingTitles": [
      "12V Battery Drain When Parked",
      "OTA Software Update Failures",
      "Range Estimate Inconsistency"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Nissan",
    "model": "Ariya",
    "existingTitles": [
      "DC Fast Charging Failures and Speed Reduction",
      "HVAC System Range Impact and Heat Pump Inefficiency",
      "OTA Software Updates Causing System Failures",
      "Significant Range Loss in Cold Weather",
      "Software Bugs and Infotainment Issues"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Ford",
    "model": "Mustang Mach-E",
    "existingTitles": [
      "12V Battery Drain Causing Electronic Door Lock-Out and Passenger Entrapment",
      "12V Battery Drain Causing No-Start and Dead Vehicle",
      "DC Fast Charging Speed Severely Reduced in Cold Weather",
      "High-Voltage Battery Contactor Failure — Cannot Charge or Drive",
      "High-Voltage Battery Contactor Overheating Causing Sudden Loss of Drive Power",
      "SYNC 4A Infotainment Freezing and Spontaneous Rebooting",
      "Windshield and Panoramic Glass Roof Detachment Risk",
      "Windshield Stress Cracking Without Impact"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Lexus",
    "model": "TX",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Mazda",
    "model": "CX-90",
    "existingTitles": [
      "48V MHEV Battery Cell Imbalance — Engine Malfunction Light, Loss of Hybrid Assist and Fail-Safe Mode (DTC P0DAB)",
      "8-Speed Automatic Transmission Jerkiness",
      "Dash Electrical Supply Unit (ESU) Software Fault — Inoperative Defroster, Seat-Belt Warning, 360° Monitor & HV Battery Cooling — Recall 7124J / NHTSA 24V814",
      "Engine Stalling / Loss of Power (Recall Related)",
      "Inaccurate Fuel Gauge Causing Unexpected Stalling — Recall 7825I / NHTSA 25V568",
      "Infotainment Display Freezing and Wireless CarPlay/Android Auto Disconnects",
      "Panoramic Roof Creaking and Popping Noises",
      "PHEV Charging System Failures",
      "Sudden Increase in Steering Effort ('Sticky Steering') — Recall 24V022 / Failed-Remedy Investigation RQ26002"
    ],
    "yearsCovered": [
      2024,
      2025
    ]
  },
  {
    "make": "Hyundai",
    "model": "Santa Cruz",
    "existingTitles": [
      "12V Battery Parasitic Drain and Premature Failure",
      "8-Speed DCT Overheating Under Load / Towing",
      "Factory Bed Liner Peeling / Delaminating",
      "Forward Collision Avoidance Phantom / Unexpected Braking (Recall 26V316)",
      "Infotainment Screen Freezing / Black Screen",
      "Rear Window and Tailgate Rattle / Wind Noise",
      "Roof Side Molding Detachment While Driving (Recall 23V-038)",
      "Sunroof Drain Clogging Causing Interior Water Leaks",
      "Tow Hitch Harness Water Intrusion Causing Fire Risk (Recall 23V-181)",
      "Transmission Electric Oil Pump Fault Causing Loss of Drive Power (Recall 22V-746)"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "GMC",
    "model": "Canyon",
    "existingTitles": [
      "2.8L Duramax DEF System Faults and DPF Regeneration Issues",
      "2024 Headlight Flicker (24V673) and 2023-2024 Seat Belt Buckle Bolt Recalls (2nd-Gen Canyon)",
      "3.6L V6 (LGZ) Excessive Oil Consumption from Clogged PCV Orifice",
      "8-Speed Automatic Torque Converter Shudder",
      "8L45 8-Speed Transmission Torque Converter Shudder",
      "Active Fuel Management (AFM) Lifter Failure (V6)",
      "Driver Airbag Inflator Misalignment / SDM Reprogram (Recall 14690)",
      "Front Brake Caliper Brake Fluid Leak (Recall 15V278000)",
      "Front Suspension Clunk and Stabilizer Bar End Link Failure",
      "P0420/P0430 Catalytic Converter Efficiency Failure (3.6L V6)",
      "Power Steering Assist Loss from Corroded Steering Gear Connection (Recall 16V054)"
    ],
    "yearsCovered": [
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Grand Highlander",
    "existingTitles": [
      "12.3-inch Digital Instrument Panel May Be Blank at Startup (Recall)",
      "8-Speed Automatic Harsh Shifting and Torque Converter Shudder",
      "Curtain Shield Airbag May Deploy Outside an Open Window (Recall 24V461000)",
      "Excessive Wind Noise from A-Pillar and Mirror Area",
      "Fuel Tank Will Not Fill to Rated Capacity (Premature Nozzle Shut-Off)",
      "Hybrid Max (T24A-FTS) Cold-Start Camshaft Timing DTC P05CE / Check Engine Light",
      "Inaccurate Load Carrying Capacity Modification Label (Recall 24V548000)",
      "Infotainment Software Bugs and Display Issues",
      "Panoramic Roof and Headliner Rattle",
      "Panoramic View Monitor Software Error Kills the Reverse Camera Image (Recall 25V744000)",
      "Phantom Automatic Emergency Braking Activation"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Trax",
    "existingTitles": [
      "1.4L Turbo Excessive Oil Consumption",
      "1.4L Turbo Wastegate Actuator Failure",
      "1.4T Ecotec Turbo and Coolant Issues",
      "11-Inch Infotainment Screen Freezing, Blacking Out, or Rebooting",
      "12-Volt Battery Drain or No-Start After Sitting",
      "6-Speed Automatic Rough Shifting and Delayed Engagement",
      "Air Bags May Not Deploy in a Crash - SDM Left in Manufacturing Mode (Recall 18V774000)",
      "Coolant Leak from Water Outlet Housing",
      "Forward Collision Alert / Automatic Emergency Braking False Warnings or Unexpected Activation",
      "Front Brake Squeal or Grinding from Premature Pad/Rotor Wear",
      "Rearview Camera Image Missing, Delayed, or Blue/Black Screen"
    ],
    "yearsCovered": [
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2024,
      2025
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-5",
    "existingTitles": [
      "2021 Turbo Exhaust Valve Stem Seal Oil Consumption",
      "Air Conditioning Compressor Failure",
      "Carbon Buildup on Intake Valves (Skyactiv)",
      "Cylinder Deactivation Rocker Arm Dislodgement / Engine Stall (Recall 19V-497)",
      "Daytime Running Light (DRL) Failure",
      "Defective Fuel Pump (Denso Recall)",
      "Electronic Parking Brake (EPB) Actuator / Connector Malfunction",
      "Excessive Engine Oil Consumption",
      "Exhaust Manifold/Gasket Leaks",
      "Front Suspension Clunking Noise",
      "i-stop AGM Battery Premature Failure / Start-Stop System Malfunction",
      "Infotainment System CMU Failure (Black Screen)",
      "Mass Airflow (MAF) Sensor Failure",
      "Premature Wheel Bearing Failure",
      "Rust on Door Panels and Body",
      "SKYACTIV-G 2.5T Cracked Cylinder Head Coolant Leak",
      "Sticking Brake Calipers and Premature Wear",
      "Timing Chain Cover Oil Weep and Water Pump Coolant Seepage (SKYACTIV-G)"
    ],
    "yearsCovered": [
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023
    ]
  },
  {
    "make": "Hyundai",
    "model": "Tucson",
    "existingTitles": [
      "2.5L Smartstream GDI Oil Dilution and Excessive Oil Consumption",
      "7-Speed DCT Transmission Shudder and Hesitation",
      "A/C Compressor Failure",
      "AWD Rear Differential Coupler Failure",
      "Console Wiring Misrouting Allows Shift Out of Park Without the Brake — Rollaway Risk (Recall 24V877000)",
      "Driver Attention Warning Camera False Alerts Cancelling Smart Cruise Control",
      "Dual Clutch Transmission (DCT) Shudder",
      "Excessive Oil Consumption (Theta II Engine)",
      "Forward Collision Avoidance Phantom Braking (Unintended AEB)",
      "High Pressure Fuel Pump Failure (GDI)",
      "Hybrid / PHEV 12V Battery Repeated Drain and No-Start",
      "Improperly Installed Side Curtain Air Bags May Not Deploy as Intended (Recall 25V809000)",
      "Improperly Torqued Connecting Rod Bolts Causing Engine Failure and Oil-Leak Fire Risk (Recall 25V549000)",
      "Instrument Cluster and Head-Up Display Blackout with 'No Signal' (Recalls 26V047000 and 26V400000)",
      "Interior Door Pull-Handle / Trim Paint Peeling",
      "ISG Electric Oil Pump Controller Overheat Fire Risk (NX4)",
      "Misassembled B-Pillar Side Impact Sensors Delaying Air Bag Deployment (Recall 26V254000)",
      "Panoramic Sunroof Spontaneous Cracking",
      "Rear Brake Caliper Seizing / Premature Wear",
      "Rear Differential Coupling Failure (AWD)",
      "Theta II Engine Seizure Due to Connecting Rod Bearing Failure",
      "Tow Hitch Wiring Harness Water Intrusion and Fire Risk"
    ],
    "yearsCovered": [
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Kia",
    "model": "Telluride",
    "existingTitles": [
      "8-Speed Automatic Torque-Converter Shudder and Re-Acceleration Hesitation",
      "A/C Compressor Failure / No Cold Air",
      "Door Belt Molding Delamination / Detachment (Recall SC347)",
      "Engine Valve Spring Fracture / Loss of Motive Power (3.8L V6, Recall SC296)",
      "Front Power Seat Motor Overheating / Fire Risk",
      "Front Seat Back Frame Assembly Manufacturing Defect (Recall SC362 / NHTSA 26V105)",
      "Headliner Sagging Near Panoramic Sunroof",
      "Incorrect Spare Tire Impairing ABS and Traction Control (Recall SC355)",
      "Infotainment / UVO Touchscreen Freezing and Random Reboot",
      "Intermediate Shaft / Driveshaft Disengagement (Rollaway)",
      "Oil Dilution from Short Trip Driving (3.8L V6)",
      "Paint Bubbling at Hood and Roof Seams",
      "Panoramic Sunroof Glass Spontaneously Shattering",
      "Parasitic 12V Battery Drain from Telematics Modem / Intelligent Battery Unit (Repeat No-Start)",
      "Piston Oil-Control Ring Coking Causing Excessive Oil Consumption (3.8L Lambda II GDI)",
      "Power Liftgate Motor and Gas Strut Failure (Won't Close, Three-Beep Fault)",
      "Premature Windshield Cracking",
      "Rear Self-Leveling Shock Absorber Insulator Failure and Shock Blow-Out (Knock/Thump Over Bumps)",
      "Third Row Seat Latch Jamming",
      "Tow Hitch Wiring Harness Module Fire Risk"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Kia",
    "model": "Sportage",
    "existingTitles": [
      "4WD Front Hub/Vacuum Engagement Failure",
      "6-Speed Automatic (A6MF) Harsh Shifting and Valve Body Wear",
      "Air Bag Malfunction: Non-Deployment or Unintended Deployment",
      "Brake Line Corrosion and Hydraulic Brake Failure",
      "Cooling Fan Blade Deformation and Breakage",
      "Electrical Harness Overheating, Headlight Failure, and Fire Risk",
      "Excessive Oil Consumption (2.4L GDI Piston Ring / Oil Burning)",
      "Fuel Tank Rust, Leaks, and Gas Fume Intrusion",
      "HECU Electrical Short / Fire Risk",
      "ICCU Failure and 12V Battery Drain (Sportage Hybrid / PHEV, NQ5)",
      "Idle Stop & Go Oil Pump Overheating",
      "Infotainment System Reboot Loop and Screen Freeze",
      "Panoramic Sunroof Spontaneous Cracking",
      "Rear Differential Coupling Noise and Vibration (AWD)",
      "Rear Differential Mount Bushing Wear (AWD Models)",
      "Recall 23V531000: Idle Stop & Go Electric Oil Pump Controller Fire Risk (2023 Sportage)",
      "Roof Molding Can Loosen and Detach (NHTSA Recall 24V025000)",
      "Severe Frame and Underbody Rust",
      "Theta II Engine Bearing Failure",
      "Tow Hitch Harness Module Fire Risk (Recall SC249 / NHTSA 22V-703)",
      "Turbo Oil Feed Line Leak (1.6T)",
      "Weak A/C Cooling from Condenser Leak / Compressor (TSB Build-Date Range)"
    ],
    "yearsCovered": [
      2000,
      2002,
      2005,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Jetta",
    "existingTitles": [
      "1.9 TDI Timing Belt Failure on an Interference Engine (Short Original Interval)",
      "2.5L 5-Cylinder Intake Manifold Runner Failure",
      "ABS Control Module and Low-Speed False ABS Activation",
      "Airbag Warning Light, Crash Sensor, and Non-Deployment Concerns",
      "Backup Camera May Not Display an Image - Infotainment Memory Defect (Recall 22V514000)",
      "Brake Light Switch Failure",
      "Coolant Temperature Sensor (Blue/Black Top) Failure",
      "Direct Injection Carbon Buildup on Intake Valves",
      "Driver Frontal Airbag May Not Deploy Due to Contaminated Clock Spring (Recall 15V483000)",
      "DSG Mechatronic Unit Failure",
      "EA888 Gen1/Gen2 Timing Chain Tensioner Failure",
      "Fuel Pump and Fuel Leak Stalling Issues",
      "Hazard Flasher Switch Relay Failure",
      "Heated Seat Element Overheating and Burn-Through",
      "High-Pressure Fuel Pump (HPFP) Failure",
      "Ignition Coil Failure",
      "Ignition Coil Pack Failure Causing Misfires (2.0 ABA and VR6)",
      "Intake Valve Carbon Buildup",
      "PCV Valve/Diaphragm Failure",
      "Plastic Water Pump and Thermostat Housing Failure",
      "Power Window Regulator Clip Failure",
      "Power Window Regulator Failure",
      "Timing Chain Tensioner Failure",
      "Timing Chain Tensioner Failure (TSI)",
      "Turbocharger Failure/Wastegate Rattle",
      "VR6 Plastic Coolant Flange / 'Crack Pipe' Coolant Leak",
      "VR6 Timing Chain Guide and Tensioner Rattle (Rear of Engine)",
      "Water Pump/Thermostat Housing Failure"
    ],
    "yearsCovered": [
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Hyundai",
    "model": "Elantra",
    "existingTitles": [
      "ABS Module Electrical Short and Fire Risk",
      "ABS Module Short Circuit Causing Engine Compartment Fire (Recall 20V061)",
      "Airbag Sensor and Control Module Malfunction",
      "Automatic Transmission Input/Output Speed Sensor Failure Causing Harsh Shifting",
      "Brake Light Switch Failure Causing Inoperative Brake Lamps and Shift Interlock Problems",
      "Crankshaft Position Sensor Failure Causing Stalling",
      "Dual Clutch Transmission (DCT) Shudder and Failure",
      "Electronic Power Steering System Failure",
      "Evaporative Emissions Purge Valve and Fuel Tank Pressure Sensor Faults Triggering Check Engine Light",
      "Front Coil Spring Fracture and Tire Damage",
      "Front Lower Control Arm Corrosion and Possible Separation",
      "Front Seat Belt Pretensioner May Explode and Project Metal Fragments (Recall 229)",
      "Front Wheel Bearing Premature Wear Causing Humming Noise and Hub Play",
      "Fuel Pump Module and Fuel Level Sender Failure Causing No-Start or Inaccurate Gauge Readings",
      "IVT/CVT Transmission Failure and Power Loss",
      "MDPS Rubber Coupler Wear — Steering Clunk / Knock and Loss of Assist",
      "Nu Engine Bearing Failure and Seizure",
      "P0011 — Intake Camshaft Timing Over-Advanced (Bank 1) from Stuck CVVT Oil Control Valve",
      "P0016 — Crank/Cam Correlation (Bank 1 Sensor A) from Clogged OCV or Stretched Timing Chain",
      "P0128 — Coolant Below Thermostat Regulating Temp from Stuck-Open Thermostat",
      "P0171 — System Too Lean (Bank 1) from Vacuum Leak / Dirty MAF",
      "P0420 — Catalyst Efficiency Below Threshold (Bank 1), Often Downstream of Nu 2.0L Oil Consumption",
      "Panoramic Sunroof Spontaneous Shattering",
      "Phantom / False Automatic Emergency Braking and Forward Collision Activation",
      "Radiator End Tank Cracking and Coolant Loss on Aging 2.0L Cars",
      "Theft Vulnerability — Missing Engine Immobilizer ('Kia Boyz' / TikTok Challenge)",
      "Timing Belt Neglect Leading to Bent Valves and No-Start",
      "Valve Cover Gasket Oil Leaks Onto Spark Plug Wells and Exhaust Manifold",
      "White / Pearl Paint Peeling and Clear-Coat Delamination ('Scratch Recovery Clear')"
    ],
    "yearsCovered": [
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Acura",
    "model": "TLX",
    "existingTitles": [
      "9-Speed Automatic Transmission Shudder and Harsh Shifting",
      "Infotainment System Lag, Freezing, and Crashes",
      "Type S Brembo Front Brake Squeal and Premature Pad Wear",
      "Type S Turbo Oil Feed Line Leak"
    ],
    "yearsCovered": [
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-7",
    "existingTitles": [
      "2.3L Turbo Engine Failure from Oil Starvation",
      "2.3L Turbo VVT Actuator and Turbocharger Failure",
      "Variable Valve Timing (VVT) Actuator Failure",
      "VVT Actuator Failure"
    ],
    "yearsCovered": [
      2007,
      2008,
      2009,
      2010,
      2011,
      2012
    ]
  },
  {
    "make": "Lexus",
    "model": "GS",
    "existingTitles": [
      "Dashboard Melting and Sticky Surface",
      "Power Steering Rack Seal Leak",
      "Recall 06V096000: 2006 Lexus GS SRS Air Bag Inflator May Not Deploy With Full Force",
      "Water Pump Premature Failure"
    ],
    "yearsCovered": [
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020
    ]
  },
  {
    "make": "Nissan",
    "model": "350Z",
    "existingTitles": [
      "Excessive Oil Consumption (Pre-Revision VQ35DE)",
      "Power Window Regulator and Motor Failure",
      "Power Window Regulator Failure",
      "Steering Lock Module and NATS Immobilizer Failure",
      "VQ35DE Rev-Up Engine Oil Consumption"
    ],
    "yearsCovered": [
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009
    ]
  },
  {
    "make": "Harley-Davidson",
    "model": "Sportster",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Honda",
    "model": "Gold Wing",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Suzuki",
    "model": "V-Strom 650",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Kawasaki",
    "model": "Ninja 650",
    "existingTitles": [],
    "yearsCovered": []
  }
]

const CATEGORIES = ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other']

const CITATION = {
  type: 'object', additionalProperties: false,
  properties: { type: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } },
  required: ['type', 'title', 'url'],
}

const DISCOVER_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string', enum: CATEGORIES },
          years: { type: 'array', items: { type: 'number' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          recallCampaigns: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
          typicalMileageLow: { type: 'number' },
          typicalMileageHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'citations'],
      },
    },
  },
  required: ['candidates'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    isReal: { type: 'boolean' },
    confidence: { type: 'number' },
    hasLiveCitation: { type: 'boolean' },
    hasNonAggregatorSource: { type: 'boolean' },
    hasOwnerCommunitySource: { type: 'boolean' },
    hasOfficialSource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'hasOfficialSource', 'isDuplicate', 'reason'],
}

function existingFor(t) {
  const e = EXCLUSIONS.find((x) => x.make === t.make && x.model === t.model)
  return (e && e.existingTitles) || []
}

const CITATION_RULES = [
  `CITATION RULES - hard requirements:`,
  `  * At least ONE citation per issue must be an official source (NHTSA, manufacturer campaign, TSB) or a real owner community thread. Third-party problem-aggregator sites alone do not qualify.`,
  `  * NEVER cite a raw api.nhtsa.gov endpoint - cite the human-readable nhtsa.gov page or the campaign PDF.`,
  `  * Cite ONLY pages you actually found and opened. Do NOT construct or guess a URL from a pattern - fabricated URLs have polluted this database before, and a guessed static.nhtsa.gov PDF path was tested and 404s.`,
  `  * A forum thread found in search results counts even if the site blocks automated fetching (403).`,
].join('\n')

function fieldSpec(t) {
  return [
    `For EACH issue provide: title (name the component AND the failure mode), description, solution (the real fix, including whether a free recall remedy exists), severity, category (one of: ${CATEGORIES.join(', ')}), years, trims when variant-specific, engines[] when the failure is engine-code specific, symptoms[], recallCampaigns[] (NHTSA campaign numbers such as 24V123 - state these ONLY where you actually found them), dtcCodes[] where genuinely documented, estimatedCostLow/High and typicalMileageLow/High when known, and citations[].`,
    ``,
    `ENGINE-CODE SPECIFICITY: the model name is not enough. A failure on one engine is not a failure on another sold in the same body. Where the note above names specific engines, tag down to them.`,
  ].join('\n')
}

// ---------------------------------------------------------------- prompts

function discoverOfficialFirst(t) {
  const existing = existingFor(t)
  const isEv = t.style === 'ev'
  return [
    `You research REAL, documented known issues for a RECENTLY LAUNCHED vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `This vehicle is NEW. That changes where the evidence lives, so change where you look:`,
    `  1. OFFICIAL FIRST - NHTSA recalls and complaints, manufacturer recall and service campaigns, TSBs, stop-sale and delivery-hold notices, OEM service documentation. On a vehicle this new this is the RICHEST and most reliable source and where most of your effort should go.`,
    `  2. OWNER COMMUNITIES second - ${t.forums}. These exist but are THIN for a vehicle this new. Use them to corroborate and add detail, not as primary evidence.`,
    ``,
    `Because the forums are thin, the temptation to fill gaps with plausible-sounding threads is high. Do not. One issue grounded in a verifiable recall campaign is worth more than five with invented forum links. If you cannot find real evidence, return fewer issues.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this nameplate has NO coverage at all yet, so establish the foundational issues)',
    ``,
    `Find 6-10 ADDITIONAL well-documented issues NOT in that list.`,
    ``,
    isEv
      ? `THE EV FAILURE SURFACE IS NOT THE ICE ONE. Look specifically at: high-voltage battery and BMS faults; ICCU / on-board charger / DC-DC converter failures; DC fast-charging faults and derating; thermal management and heat pump; 12V auxiliary battery drain (an extremely common real complaint on new EVs); software and OTA update failures; infotainment; regenerative braking and brake-blending; drive-unit and reduction-gear failures; and propulsion-power-loss campaigns.`
      : `FAILURE SURFACE: this is an internal-combustion or hybrid vehicle in its first generation. Concentrate on the powertrain the note names (new turbo engines, new transmissions and new hybrid systems generate the launch-period failures), plus electrical and infotainment architecture, ADAS false activations, and any seat, belt or airbag campaigns.`,
    ``,
    `PLATFORM SIBLINGS - the single biggest error risk in this wave. Several targets share hardware with vehicles already in this catalog. A recall or failure on a sibling is NOT automatically an issue on THIS nameplate. Before you attribute one, confirm NHTSA or the manufacturer actually names THIS vehicle. Copying failures across platform mates is the exact error a previous cross-link audit caught.`,
    ``,
    `MODEL YEARS: this vehicle is 1-5 years old. Never return a year that predates its launch.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it: HV battery / BMS / charging / ICCU / 12V / software -> electrical; drive unit and reduction gear -> drivetrain; regenerative braking -> brakes; heat pump and cabin climate -> hvac; thermal management of the pack -> cooling.`,
    ``,
    isEv
      ? `DTC CODES: most EV faults surface as manufacturer-specific codes or dash messages, not generic OBD-II P-codes. Provide dtcCodes[] only where a code is genuinely documented for this vehicle. Never infer one by analogy to a gas car.`
      : `DTC CODES: provide them only where genuinely documented for this vehicle. Never infer a code by analogy to a related model.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverForumFirst(t) {
  const existing = existingFor(t)
  const isThin = t.style === 'thin'
  return [
    `You research REAL, documented known issues for a specific vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    isThin
      ? `THIS NAMEPLATE HAS ALMOST NO COVERAGE IN OUR DATABASE - ${existing.length} issue(s) for a vehicle sold for years with an active owner community. Read that as a COVERAGE GAP, not as evidence the vehicle is reliable. The note above names failures that are extensively documented. Your job is to establish the foundational record for this nameplate.`
      : `THIS IS A HIGH-VOLUME NAMEPLATE CARRYING ONLY ${existing.length} ISSUES, while comparable-volume vehicles in this catalog average 50 or more. It is under-documented, not clean. Go deep: this vehicle has decades of owner reporting behind it.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. OWNER COMMUNITIES FIRST - ${t.forums}. On a vehicle with this much history the forums hold detail no government summary ever captures: which build months, which engine code, what the actual fix was, what the dealer denied.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls and complaints, manufacturer campaigns, TSBs, class-action settlements and extended warranty notices. These make an issue checkable.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Find ${isThin ? '8-12' : '10-14'} ADDITIONAL well-documented issues NOT in that list. Spread them across generations and across systems - do not return ten variations of the same engine complaint.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: this nameplate spans multiple generations and engines. A failure on one generation is NOT a failure on the next, and the most common error on nameplates like this is merging two different engines' stories into one issue. The note above names the specific traps.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverMoto(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a specific MOTORCYCLE. Machine: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this machine: ${t.note}`,
    ``,
    `This is a motorcycle, not a car. Treat it as one: riders diagnose and document differently, and the failure surface is different - charging systems (stator, regulator/rectifier), final drive (chain, belt, or shaft and its splines), fork seals and steering head bearings, cam chain tensioners, clutch baskets and slave cylinders, fuel pumps and FI, and corrosion on exposed components are the recurring themes across most makes.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. RIDER COMMUNITIES FIRST - ${t.forums}. These are the primary record for motorcycles; long-running model-specific forums document failures in far more detail than any official source.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls (manufacturers file motorcycle campaigns like any other vehicle), manufacturer service bulletins and campaigns.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this machine has NO coverage yet, so establish the foundational issues)',
    ``,
    `Find 8-12 well-documented issues NOT in that list.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: the note above names the generation split for this machine, and it matters more on bikes than on cars because manufacturers reuse a nameplate across completely unrelated engines. Never carry a finding across that split.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the category list is CLOSED and SHARED with the automotive catalog. The renderer knows exactly these 17 and nothing else. Map motorcycle concepts INTO the set, never extend it: final drive / chain / belt / shaft splines -> drivetrain; fairing and bodywork -> exterior; stator, regulator-rectifier and wiring -> electrical; forks, shocks and steering head bearings -> suspension (or steering where it is genuinely the steering head).`,
    ``,
    `DTC CODES: motorcycles largely do NOT use OBD-II. Codes here are manufacturer-specific (Harley P- and B-codes, Honda/Yamaha/Suzuki/Kawasaki FI blink codes). Provide dtcCodes[] only where a code is genuinely documented for THIS machine, and never one borrowed from automotive OBD-II.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverPrompt(t) {
  if (t.style === 'moto') return discoverMoto(t)
  if (t.style === 'ev' || t.style === 'new') return discoverOfficialFirst(t)
  return discoverForumFirst(t)
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  const isNewish = t.style === 'ev' || t.style === 'new'
  const kind = t.style === 'moto' ? 'MOTORCYCLE' : (isNewish ? 'RECENTLY LAUNCHED vehicle' : 'vehicle')
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Subject: ${t.make} ${t.model} (${t.yearsHint}) - a ${kind}.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines claimed: ${(c.engines || []).join(', ') || '(none)'}`,
    `Recall campaigns claimed: ${(c.recallCampaigns || []).join(', ') || '(none)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this nameplate:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Verify:`,
    `(1) PLATFORM AND GENERATION. Is this genuinely documented for THIS nameplate, THIS generation and THIS engine - or is it a sibling's or a different generation's problem copied across? Shared hardware makes a shared defect PLAUSIBLE but never automatic. If a recall is claimed, confirm the campaign lists THIS vehicle.`,
    `(2) If a recall campaign number is claimed, does it exist AND cover this make/model? An invented campaign number is the clearest possible sign of fabrication.`,
    `(3) Do the cited URLs exist, resolve, and support the claim? A 404 is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(4) Are the model years plausible for this nameplate and generation?`,
    isNewish
      ? `(5) Is this a RECURRING documented problem or a handful of early-adopter complaints? New vehicles attract loud launch-period noise, and a software annoyance that one OTA fixed is not a known issue.`
      : `(5) Is this a RECURRING documented problem affecting a meaningful population, or one owner's bad luck amplified by a single thread?`,
    `(6) Is it substantively the same problem as one already in our database above (isDuplicate)? Judge on the FAILURE, not the wording.`,
    ``,
    `Classify sources: hasOfficialSource (NHTSA / manufacturer campaign / TSB), hasOwnerCommunitySource (a real owner or rider forum, or a model-specific community), hasNonAggregatorSource (either of those, as opposed to third-party problem-aggregator sites).`,
    ``,
    `Return isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, hasOfficialSource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring documented problem, isReal=false.`,
  ].join('\n')
}

// ------------------------------------------------------------------- run

const byStyle = {}
for (const t of TARGETS) byStyle[t.style] = (byStyle[t.style] || 0) + 1
log(`Wave 11: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) {
      return { make: t.make, model: t.model, style: t.style, found: 0, confirmed: [], forumBacked: 0, officialBacked: 0 }
    }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          // EVIDENCE gates only — see the header note on why there is no numeric confidence threshold.
          if (!v.isReal) return null
          if (!v.hasLiveCitation) return null
          if (!v.hasNonAggregatorSource) return null
          if (v.isDuplicate) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c,
            make: t.make,
            model: t.model,
            vehicleType: t.style === 'moto' ? 'motorcycle' : 'car',
            _style: t.style,
            _verdict: v,
            _verdictConfidence: v.confidence,
            _verdictReason: v.reason,
            _forumBacked: !!v.hasOwnerCommunitySource,
            _officialBacked: !!v.hasOfficialSource,
          }
        })
    )).then((res) => {
      const kept = res.filter(Boolean)
      return {
        make: t.make, model: t.model, style: t.style,
        found: candidates.length,
        confirmed: kept,
        forumBacked: kept.filter((x) => x._forumBacked).length,
        officialBacked: kept.filter((x) => x._officialBacked).length,
      }
    })
  }
)

const confirmed = []
let totalFound = 0, totalForum = 0, totalOfficial = 0
const perModelStats = []
const styleTotals = {}
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForum += r.forumBacked
  totalOfficial += r.officialBacked
  styleTotals[r.style] = styleTotals[r.style] || { found: 0, confirmed: 0 }
  styleTotals[r.style].found += r.found
  styleTotals[r.style].confirmed += r.confirmed.length
  perModelStats.push({ make: r.make, model: r.model, style: r.style, found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked, officialBacked: r.officialBacked })
  log(`[${r.style}] ${r.make} ${r.model}: ${r.confirmed.length}/${r.found} confirmed, ${r.officialBacked} official-backed, ${r.forumBacked} forum-backed`)
  for (const c of r.confirmed) confirmed.push(c)
}
for (const [s, v] of Object.entries(styleTotals)) log(`  style ${s}: ${v.confirmed}/${v.found} confirmed`)
log(`WAVE 11 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
