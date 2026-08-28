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
  name: 'research-wave13-four-bucket',
  description: 'Wave-13: 26 targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "ev",
    "make": "Genesis",
    "model": "Electrified GV70",
    "yearsHint": "2023-2026",
    "note": "NET-NEW NAMEPLATE - zero rows today. This catalog holds the petrol Genesis GV70 (18 issues) as a SEPARATE nameplate, so keep them apart: the Electrified shares a body but nothing of the powertrain. E-GMP-derived 800V architecture built on the petrol platform rather than pure E-GMP, which is unusual and worth stating correctly. THE ICCU (Integrated Charging Control Unit) FAILURE is the defining Hyundai-Kia-Genesis electric story - it kills the 12V and strands the car, and it carries its own recalls and warranty extensions across the GV60, Ioniq 5 and EV6. Confirm which campaigns name the Electrified GV70 specifically. Also: DC fast-charge derating, boost mode, and infotainment/OTA faults.",
    "forums": "genesisownersclub.com, gv70forum.com, ioniqforum.com, r/GenesisMotors, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Chevrolet",
    "model": "Blazer EV",
    "yearsHint": "2024-2026",
    "note": "Only 4 documented issues on one of the most recall-active vehicles GM sells. GM Ultium (BEV3). The defining chapter is the December 2023 SOFTWARE STOP-SALE that halted deliveries fleet-wide after widespread infotainment and charging failures on early cars - an unusually well-documented event - followed by a string of campaigns. Also: DC fast-charging faults, 12V auxiliary battery, rear drive-unit and propulsion-power-loss campaigns, and the 2024 price/trim restructure. ULTIUM SIBLINGS in this catalog: Equinox EV, Silverado EV, Hummer EV, Honda Prologue, Acura ZDX. A sibling recall is NOT automatically this vehicle's - confirm NHTSA names the Blazer EV.",
    "forums": "blazerevforum.com, gm-trucks.com, chevroletforum.com, r/ChevyBlazerEV, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "GMC",
    "model": "Hummer EV",
    "yearsHint": "2022-2026",
    "note": "Only 4 documented issues on a vehicle with an unusually heavy recall record. Ultium pickup body style - this catalog lists \"Hummer EV SUV\" as a SEPARATE nameplate, so keep findings to the pickup unless a campaign covers both. Documented themes: the 2023-24 battery-module and pack campaigns, the recall over a water-pump/battery-sealing defect, extreme curb weight (over 9,000 lb) driving brake and tire complaints that are genuinely specific to this vehicle, CrabWalk and four-wheel-steer faults, Super Cruise, and software/OTA failures. Early 2022 Edition 1 builds differ substantially from later production.",
    "forums": "gmhummerevforum.com, gm-trucks.com, hummerchat.com, r/HummerEV, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Hyundai",
    "model": "Ioniq 6",
    "yearsHint": "2023-2026",
    "note": "Only 9 documented issues. E-GMP, sibling to the Ioniq 5 (14 issues here) and Kia EV6 (21) - and THE ICCU FAILURE is the defining platform story, stranding cars with a dead 12V and carrying recalls plus a warranty extension. Confirm which campaigns name the Ioniq 6 rather than assuming Ioniq 5 coverage carries across. Also: the 2023-24 charging-port and DC fast-charge faults, the rear-view camera and FMVSS 111 campaigns that swept Hyundai, heat-pump and cold-weather range, and the digital side mirrors on equipped markets. Quarterly-priority make (Hyundai).",
    "forums": "ioniqforum.com, ioniq6forum.com, hyundai-forums.com, r/Ioniq6, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Cadillac",
    "model": "Lyriq",
    "yearsHint": "2023-2026",
    "note": "Only 10 documented issues on Cadillac's volume EV, four model years in. GM Ultium, and one of the earliest Ultium vehicles to reach customers - which means it carries early-production faults the later siblings do not. Documented themes: the 2023-24 recalls (including the rear-view camera/display software and the battery-module campaigns), 12V drain, DC fast-charge faults, the 33-inch LED display and its software failures, Super Cruise, and heat-pump/HVAC issues. ULTIUM SIBLINGS: Blazer EV, Equinox EV, Silverado EV, Hummer EV, Prologue, ZDX - confirm nameplate before attributing.",
    "forums": "cadillaclyriqforum.com, cadillacforums.com, gm-trucks.com, r/Cadillac, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Kia",
    "model": "EV9",
    "yearsHint": "2024-2026",
    "note": "Only 10 documented issues on Kia's three-row flagship EV. E-GMP 800V, sibling to the Ioniq 5/6, EV6 and GV60. THE ICCU FAILURE applies to this platform and the EV9 has its own campaigns - verify rather than inherit. Also documented: the 2024 recalls over the front trim/emblem and the seat-belt pretensioners, DC fast-charge behaviour, 12V drain, the ADAS and Highway Driving Assist faults, third-row seat and latch issues, and software/OTA failures. Being the newest and largest E-GMP vehicle, thermal management under load and towing is a distinct area worth checking.",
    "forums": "kiaev9forum.com, kia-forums.com, ev6forum.com, r/KiaEV9, r/electricvehicles"
  },
  {
    "style": "new",
    "make": "Lexus",
    "model": "NX",
    "yearsHint": "2015-2025",
    "note": "Only 9 documented issues across TWO generations of a high-volume Lexus. AZ10 2015-2021 (NX 200t/300 with the 8AR-FTS 2.0 turbo - a rare turbo for Lexus with its own carbon and wastegate record - plus the NX 300h hybrid). AZ20 2022-2025: all-new on TNGA-K, with the NX 250, NX 350 (T24A-FTS 2.4 turbo), NX 350h and the NX 450h+ PHEV, plus the new Lexus Interface infotainment. THE 2022-23 RECALLS matter here, including the PHEV battery and charging campaigns. Quarterly note: Lexus is thin overall. Keep the two generations and the four powertrains strictly apart.",
    "forums": "clublexus.com, lexusownersclub.com, nxforum.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "new",
    "make": "Mazda",
    "model": "CX-30",
    "yearsHint": "2020-2026",
    "note": "Only 9 documented issues six model years in. Built on the Mazda3 platform (Mazda3 has rows here - related but a different vehicle, confirm the nameplate). Powertrains: 2.5 naturally aspirated, the 2.5 Turbo from 2021, and the SkyActiv-X in some markets. Documented themes: the widely reported i-Activsense/Smart Brake Support phantom braking (Mazda issued Service Alerts rather than a recall - describe that accurately, an SA is not a campaign), infotainment and CarPlay disconnects, the A/C condenser, windshield stress cracking, cylinder deactivation on the 2.5, and the 2020-21 recalls.",
    "forums": "cx30forum.com, mazdas247.com, mazda3forums.com, r/mazda"
  },
  {
    "style": "new",
    "make": "Toyota",
    "model": "Corolla Cross",
    "yearsHint": "2022-2026",
    "note": "Only 16 documented issues (plus 7 pending) on a fast-growing nameplate. TNGA-C, related to the Corolla but a distinct vehicle - confirm the nameplate on any campaign rather than inheriting Corolla findings. Two powertrains: the 2.0 M20A-FKS with a CVT, and the Corolla Cross Hybrid from 2023 with the 2.0 hybrid system and e-AWD. Documented themes: the 2022-23 recalls including the airbag/seat-belt campaigns, the CVT behaviour, infotainment, and the hybrid battery and inverter. Quarterly-priority make (Toyota, 39 models).",
    "forums": "toyotanation.com, corollacrossforum.com, corollaforum.com, r/Toyota"
  },
  {
    "style": "new",
    "make": "Subaru",
    "model": "Ascent",
    "yearsHint": "2019-2026",
    "note": "Only 16 documented issues (plus 1 pending) on Subaru's three-row flagship. Single powertrain: the FA24F 2.4 turbo boxer with a CVT (TR690/Lineartronic). THE DEFINING EARLY CHAPTER is the 2019 recall over improperly welded/omitted fuel pump and fuel tank components, followed by the widely reported 2019-2020 fuel pump failures (Denso pump impeller) and the transmission/CVT complaints. Also: oil consumption on the FA24, the panoramic moonroof, and the Starlink infotainment failures that drew a class action. Quarterly-priority make (Subaru, 14 models).",
    "forums": "subaruascentforum.com, subaruoutback.org, nasioc.com, r/Subaru_Ascent, r/subaru"
  },
  {
    "style": "new",
    "make": "Honda",
    "model": "HR-V",
    "yearsHint": "2016-2026",
    "note": "Only 17 documented issues across TWO very different generations. 2016-2022: built on the Fit platform with the L15 1.8 and a CVT, small and light. 2023-2026: all-new, built on the Civic platform with the 2.0 K20 naturally aspirated and a CVT - a substantially larger and heavier vehicle that shares almost nothing with the first generation. Do not carry findings across. Documented themes: CVT behaviour and judder, the 2023-24 recalls, A/C condenser failures (a recurring Honda complaint of this era), infotainment, and the Honda Sensing false-activation complaints.",
    "forums": "hrvforums.com, hondahrvforum.com, drivehonda.net, r/Honda, r/HRV"
  },
  {
    "style": "volume",
    "make": "Toyota",
    "model": "Sienna",
    "yearsHint": "1998-2025",
    "note": "Only 19 issues across FOUR generations of the best-selling non-Chrysler minivan. XL10 1998-2003 (1MZ-FE), XL20 2004-2010 (3MZ-FE then 2GR-FE - and the RUBBER OIL SUPPLY HOSE recall plus the VVT-i oil line failure), XL30 2011-2020 (2GR-FE/FKS, the only AWD minivan for much of its life), XL40 2021-2025 (hybrid ONLY, the 2.5 A25A-FXS - a complete powertrain break). Quarterly-priority make. Themes: the 2GR oil line, sliding-door motor and cable failures (the signature minivan complaint), the 2010 accelerator-pedal and floor-mat recalls, rear liftgate struts, and the hybrid battery on XL40.",
    "forums": "siennachat.com, toyotanation.com, priuschat.com, r/Toyota"
  },
  {
    "style": "volume",
    "make": "Chevrolet",
    "model": "Colorado",
    "yearsHint": "2004-2026",
    "note": "Only 19 issues across THREE generations of GM's mid-size truck. GMT355 2004-2012 (the Atlas inline-4/5 and the 5.3 V8 - the inline-five is unusual and has its own record), 2015-2022 (2.5 LCV, 3.6 LGZ, and the 2.8 Duramax diesel - a genuinely distinct powertrain with DEF and emissions issues), 2023-2026 (2.7 Turbo only, with the 8L80). Themes: the 3.6 timing chain and the 8-speed shudder that runs across GM, the 2.8 diesel emissions and DEF faults, front differential actuator failures, and the launch-year recalls on the 2023 redesign. The GMC Canyon (deepened 2026-08-26) is the platform twin - confirm the nameplate.",
    "forums": "coloradofans.com, gm-trucks.com, chevroletforum.com, r/ColoradoZR2, r/Chevy"
  },
  {
    "style": "volume",
    "make": "Kia",
    "model": "Forte",
    "yearsHint": "2010-2025",
    "note": "Only 19 issues across THREE generations of Kia's highest-volume compact. TD 2010-2013, YD 2014-2018 (the 1.8/2.0 Nu and the 1.6 turbo), BD 2019-2025 (2.0 Nu with the IVT continuously variable transmission, plus the GT with the 1.6T and a 7-speed DCT). Themes to tag by engine: the Nu-family piston-ring and engine-seizure campaigns and the KSDS knock-sensor software, the IVT judder and failure complaints, the ABS/HECU fire recalls that swept Kia and Hyundai, and THE 2015-2021 THEFT VULNERABILITY from the missing engine immobiliser, which is a genuine documented defect with an insurance and software-fix dimension.",
    "forums": "kia-forums.com, kiaforteforum.com, forteforums.com, r/kia"
  },
  {
    "style": "volume",
    "make": "Hyundai",
    "model": "Sonata",
    "yearsHint": "2001-2025",
    "note": "Only 21 issues across FIVE generations of Hyundai's flagship sedan - very light for the volume, and this nameplate sits at the CENTRE of the Theta II story. EF 2001-2005, NF 2006-2010, YF 2011-2014 and LF 2015-2019 (2.0/2.4 THETA II GDI - the rod-bearing failures, engine fires, the multi-million-vehicle recalls, the KSDS knock-sensor campaign and the class-action settlement; plus the 2.0T and the hybrid), DN8 2020-2025 (2.5 Smartstream, 1.6T, hybrid, and the N Line). Also: the ABS/HECU fire recalls and the theft vulnerability. Quarterly-priority make. TAG TO THE EXACT ENGINE - Theta II is not Smartstream.",
    "forums": "hyundai-forums.com, sonataforums.com, hyundaiforums.net, r/Hyundai"
  },
  {
    "style": "volume",
    "make": "Chevrolet",
    "model": "Traverse",
    "yearsHint": "2009-2026",
    "note": "Only 22 issues (plus 2 pending) across THREE generations of GM's big three-row crossover. 2009-2017 (Lambda platform with the 3.6 LLT/LFX - and the TIMING CHAIN STRETCH and the notorious high-pressure fuel pump and cam-actuator issues of that V6, plus the wave of power-steering and transmission complaints), 2018-2023 (C1XX with the 3.6 LFY and the 9-speed 9T65), 2024-2026 (the 2.5 turbo LK0 - a complete break from the V6). Themes: the 3.6 timing chain, the 6T70/9T65 transmissions, A/C condenser and evaporator failures, and the liftgate and seat campaigns. Do not carry V6 findings onto the 2024+ 2.5T.",
    "forums": "traverseforum.com, gm-trucks.com, chevroletforum.com, r/Chevy"
  },
  {
    "style": "thin",
    "make": "Acura",
    "model": "RSX",
    "yearsHint": "2002-2006",
    "note": "Only 2 documented issues on a car with one of the largest and still-active enthusiast communities of its generation - the same profile as the Nissan 350Z, which returned 13 of 13 from a base of 5. DC5 chassis. TWO DISTINCT ENGINES that must never be merged: the K20A3 in the base RSX (SOHC-ish economy tune) and the K20A2/K20Z1 in the Type-S (higher compression, 6-speed). Documented themes: the widely reported 5th/6th gear grind and transmission synchro failure on the Type-S 6-speed, VTC actuator cold-start rattle, motor mount failure, A/C compressor and condenser, power steering pump whine, and rear trailing arm and rust issues.",
    "forums": "club-rsx.com, acurazine.com, honda-tech.com, k20a.org, r/Acura, r/RSX"
  },
  {
    "style": "thin",
    "make": "Acura",
    "model": "ILX",
    "yearsHint": "2013-2022",
    "note": "Only 2 documented issues on a nameplate sold for a decade. Built on the Civic platform. THREE powertrain configurations across its life, and merging them is the main trap: the 2.0 with a 5-speed automatic, the 2.4 K24 with a 6-speed MANUAL only (2013-2015, an unusual combination), the 1.5 hybrid (2013-2014, using the Civic Hybrid IMA system), and from 2016 the 2.4 K24 with the 8-SPEED DUAL-CLUTCH (DCT) with torque converter - the DCT drivability complaints are the defining chapter. Also: Takata airbag inflator recalls, A/C condenser failure, and infotainment/ELS audio faults.",
    "forums": "acurazine.com, ilxforums.com, acura-forums.com, r/Acura"
  },
  {
    "style": "thin",
    "make": "Hyundai",
    "model": "Genesis Coupe",
    "yearsHint": "2010-2016",
    "note": "Only 4 documented issues on a car with a large enthusiast and tuning community. BK chassis. TWO ENGINES, and they have completely different records: the 2.0T Theta II turbo (2010-2014, then the 2.0T with revisions) and the 3.8 Lambda V6. The 2013 facelift changed both engines substantially - the 2.0T went to the revised turbo and the 3.8 gained GDI - so a pre- and post-2013 distinction matters as much as the engine choice. Documented themes: the Theta II turbo oil-feed and bearing issues, the well-reported clutch and flywheel failures on the 6-speed manual, rear differential and axle problems under power, sunroof and water leaks, and the ZF/Hyundai automatic.",
    "forums": "genesiscoupe.com, hyundai-forums.com, genesisownersclub.com, r/GenesisCoupe, r/Hyundai"
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "CX-3",
    "yearsHint": "2016-2021",
    "note": "Only 4 documented issues. Built on the Mazda2/Demio platform with the 2.0 Skyactiv-G and a 6-speed automatic (a 1.5 diesel in some markets). Small, and sold in modest numbers in the US, but with a long European and Australian life that produces most of the owner reporting - search accordingly. Documented themes: the 2016-2018 recalls, the widely reported rear brake caliper and parking-brake corrosion, A/C condenser and compressor failures, infotainment and the MZD Connect freezing/reboot complaints, cylinder deactivation on later cars, and windshield stress cracking (a recurring complaint across Mazda of this era).",
    "forums": "cx3forum.com, mazdas247.com, mazdaforum.com, r/mazda"
  },
  {
    "style": "thin",
    "make": "Jeep",
    "model": "Commander",
    "yearsHint": "2006-2010",
    "note": "Only 4 documented issues. XK chassis, built alongside the WK Grand Cherokee and sharing most of its mechanicals - Grand Cherokee findings may be genuinely relevant but confirm the nameplate, because the Commander has its own body, roof structure and third row. THREE ENGINES: the 3.7 PowerTech V6, the 4.7 PowerTech V8 and the 5.7 Hemi. Documented themes: the 4.7 V8 valve-seat and misfire problems, the 3.7 timing chain and rocker failures, the notorious water leaks around the sunroofs and the roof rails into the headliner, the electronic throttle and TIPM electrical faults, and front differential and axle issues on 4WD.",
    "forums": "jeepcommander.com, jeepforum.com, jeepgarage.org, wkjeeps.com, r/Jeep"
  },
  {
    "style": "moto",
    "make": "Harley-Davidson",
    "model": "Road King",
    "yearsHint": "2000-2025",
    "note": "NET-NEW NAMEPLATE. FLHR touring, with a long life spanning three engine eras that must never be merged: Twin Cam 88 (1999-2006), Twin Cam 96/103 (2007-2016), and Milwaukee-Eight 107/114 (2017+). Recurring documented themes: the TWIN CAM CAM-CHAIN TENSIONER shoe wear that sends debris through the oil system (the signature failure of that era), excessive rear-cylinder heat, the compensator sprocket noise and failure on 2007-2016 bikes, stator and voltage-regulator failure, front fork and steering-head bearing wear on a heavy touring chassis, and the ABS and hydraulic-clutch recalls that swept the touring range.",
    "forums": "hdforums.com, harley-davidsonforums.com, roadkingforums.com, fljrider.com, r/Harley"
  },
  {
    "style": "moto",
    "make": "Honda",
    "model": "CBR600RR",
    "yearsHint": "2003-2025",
    "note": "NET-NEW NAMEPLATE and one of the most-produced sportbikes ever, with an enormous owner and track community. Generations: 2003-2004 (PC37), 2005-2006, 2007-2012 (the major redesign, with C-ABS as an option from 2009), 2013-2016, and the 2021+ revival. Recurring documented themes: regulator/rectifier and stator charging failure (the signature complaint on Hondas of this era), the 2007-2008 recalls, cam chain tensioner, fuel pump and FI faults, clutch slave cylinder leaks, fork seal and steering-head bearing wear, and the specific issues of the combined-ABS system on equipped bikes. Track-used examples have their own wear profile - distinguish it from street use.",
    "forums": "cbrforum.com, 600rr.net, honda-forums.com, sportbikes.net, r/CBR, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "Suzuki",
    "model": "GSX-R600",
    "yearsHint": "2001-2025",
    "note": "NET-NEW NAMEPLATE. MAKE COLLISION - this catalog holds Suzuki Vitara, Swift, Jimny, SX4 (cars) and V-Strom 650 (motorcycle). Generations: 2001-2003 (K1-K3), 2004-2005 (K4-K5), 2006-2010 (K6-K10), 2011+ (L1 onward). Recurring documented themes: regulator/rectifier and stator failure (the defining electrical complaint across the GSX-R range), the well-known fuel pump and FI issues, cam chain tensioner, clutch basket and slave cylinder wear, fork seal failure, and the recalls covering the front brake master cylinder (a large multi-year Suzuki campaign) and the ignition/starter circuit. Distinguish track-used from street-used examples.",
    "forums": "gsxr.com, gixxer.com, sportbikes.net, suzuki-forums.com, r/SuzukiMotorcycles, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "KTM",
    "model": "390 Duke",
    "yearsHint": "2013-2025",
    "note": "NET-NEW NAMEPLATE and KTM is a NET-NEW MAKE for this catalog. Built by Bajaj in India on the shared 390/250/200 platform. Generations: 2013-2016, 2017-2023 (the major redesign with the TFT dash), and the 2024+ all-new model. Recurring documented themes that are genuinely well documented for this bike: the fuel pump and fuel-pump-relay failures, the notorious cooling-fan and overheating complaints in traffic, wiring-harness and connector corrosion, camshaft and rocker wear on early engines, clutch slave cylinder leaks, and the multiple recalls (including the fuel line and the brake). Watch the RC 390 - a different bike sharing the engine.",
    "forums": "ktmduke390.com, ktmforums.com, advrider.com, r/KTM, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "Ducati",
    "model": "Monster",
    "yearsHint": "2000-2025",
    "note": "NET-NEW NAMEPLATE and Ducati is a NET-NEW MAKE. A nameplate spanning twenty-five years and several unrelated engines, which is the central trap: the air-cooled two-valve Desmodue (M600/620/695/696/796/797), the water-cooled Testastretta (S4, S4R, 821, 1200), and the 2021+ Monster with the Superquadro-derived 937. Recurring documented themes: DESMODROMIC VALVE SERVICE INTERVALS and the cost/consequence of skipping them, the dry clutch on older models (rattle, basket wear), regulator/rectifier and stator failure, fuel pump and FI faults, and the recalls covering the side stand, the fuel tank (the well-documented ethanol tank-swelling issue on 2009-2011 bikes) and the brakes.",
    "forums": "ducatimonster.org, ducati.ms, ducatiforum.co.uk, advrider.com, r/Ducati, r/motorcycles"
  }
]

const EXCLUSIONS = [
  {
    "make": "Genesis",
    "model": "Electrified GV70",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Chevrolet",
    "model": "Blazer EV",
    "existingTitles": [
      "Door Striker Fracture Allowing Unexpected Door Opening",
      "Infotainment System Black Screen, Freezing, and Software Glitches",
      "Rear Drive Unit Motor Insulation Failure Causing Power Loss",
      "Rear Parking Brake Wiring Harness Defect Causing Unintended Activation"
    ],
    "yearsCovered": [
      2024
    ]
  },
  {
    "make": "GMC",
    "model": "Hummer EV",
    "existingTitles": [
      "A-Pillar Water Leak Disables Door Switches",
      "Battery Pack Enclosure Water Ingress",
      "Multiple Warning Lights with Speed Limited to 36 MPH",
      "Public Charging Failures and Software Anomalies"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Hyundai",
    "model": "Ioniq 6",
    "existingTitles": [
      "12V Auxiliary Battery Drain (Same as Ioniq 5 Platform)",
      "Charging port door / outer panel detachment recall",
      "Excessive Road/Tire Noise on Rough Pavement",
      "Excessive Wind Noise from Door Seals and Mirrors",
      "Front seat belt anchor separation recall",
      "ICCU failure causing 12V drain / loss of drive power (no-start / power loss while driving)",
      "Infotainment / cluster screen blackout and rearview camera loss",
      "Rear Camera and Sensor Obstruction from Aero Design",
      "Windshield stress cracking without impact"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Cadillac",
    "model": "Lyriq",
    "existingTitles": [
      "12V Battery Drain and Electrical Gremlins",
      "Charge Port Door May Not Auto-Close After Unplugging",
      "Dead 12V Battery from Gateway or BECM Software Conditions",
      "Driver Display Can Go Blank While Driving (Recall 25V356)",
      "False ABS Activation Can Reduce Braking Below 25 mph (Recall 24V589)",
      "Heat Pump / Climate System Failure and No Heat in Extreme Cold",
      "Inaccurate Range Estimation in Cold Weather",
      "Inconsistent DC Fast-Charging Speed With Mid-Session Power Dips",
      "Loose Stabilizer Bracket Bolts Can Damage EV Cables (Recall 25V232)",
      "Rear Camera and Surround Vision System Intermittent Failure",
      "Rear Seat-Belt Anchor Bracket May Be Improperly Welded (Recall 23V785)"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Kia",
    "model": "EV9",
    "existingTitles": [
      "Charge Port Door Actuator Fails to Release or Freezes Shut in Winter",
      "ICCU Failure Causing 12V Battery Drain and Loss of Drive Power",
      "Instrument Panel Screen Goes Blank Due to Software Error",
      "Level 2 AC Charging Terminates Early or Will Not Start While DC Fast Charging Still Works",
      "Missing Second- and Third-Row Seat Mounting Bolts (Recall SC329)",
      "Power Liftgate Unlatches but Will Not Power-Open (Tailgate Drive Motor/Module Failure)",
      "Rear Alignment Out of Spec From the Factory Wearing Rear Tires Out Under 10,000 Miles",
      "Rear Gear Drive Unit Motor Shaft Weld Failure Causing Loss of Drive Power (Recall SC337)",
      "Software Update and Infotainment Issues",
      "Windshield Wipers Stopping During Snow and Ice Conditions"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Lexus",
    "model": "NX",
    "existingTitles": [
      "Airbag Pressure and Acceleration Sensor Failure Prevents Deployment (Recall 18V085000)",
      "Blocked A-Pillar and Sunroof Drain Tubes Causing Cabin Water Leak",
      "CVT Drone and Rubber Band Effect",
      "Infotainment System Lag and Touchpad Issues",
      "Low-Pressure Fuel Pump Failure Causing Engine Stall (Recall 25V028000)",
      "Panoramic View Monitor Rearview Camera Freezes or Goes Blank (Recall 25V744000)",
      "Rearview Camera Image Fails to Display in Reverse (Recall 26V162000)",
      "Steering Column Spiral Cable Weld Failure Deactivates Driver Airbag (Recall 25V040000)",
      "Turbo Heat Soak Power Loss",
      "Water Pump Leak on 8AR-FTS Turbo Engine"
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
      2025,
      2026
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-30",
    "existingTitles": [
      "A/C Condenser Leak",
      "Cylinder Deactivation Shudder",
      "Cylinder Deactivation Valvetrain Tapping/Rattle (Switchable HLA Air Entrapment) - SA-026/23",
      "Damaged ABS Hydraulic Control Unit - Reduced Braking - Recall 23V275000 (5823D)",
      "Disconnected Fuel Evap Vent Hose Causing Fuel Leak / Stalling (AWD) - Recall 20V347000 (4520F)",
      "Excessive Oil Consumption (2.5 Turbo) - Low Oil Warning Between Changes",
      "i-Activsense False Emergency Braking & Spurious Brake/Driver-Assist Warnings",
      "Infotainment System Freezing / CarPlay Disconnecting",
      "Power Liftgate Unexpectedly Lowers - Recall 21V086000 (4621B)",
      "Windshield Stress Cracking"
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
    "make": "Toyota",
    "model": "Corolla Cross",
    "existingTitles": [
      "2022 Corolla Cross Power Liftgate Unlatches but Does Not Raise — Owner Report",
      "2022 Corolla Cross Rear Clunk or Harsh Bang Over Bumps — Owner Report",
      "2022-2023 Corolla Cross Passenger-Airbag Panel - Recalls 23V-384 and 23V-864",
      "2022-2023 Corolla Cross Permanent Multimedia Blackout Claim - Archived",
      "2022-2023 Corolla Cross Stop & Start Restart-Failure Reports - Diagnosis Required",
      "2022-2025 Corolla Cross A/C Compressor-Cycling Claim - Archived",
      "2022-2025 Corolla Cross BSM Limitations or Unavailable Warning - Diagnosis Required",
      "2022-2025 Corolla Cross CVT Shudder Aggregation - Archived",
      "2022-2025 Corolla Cross Door-Seal Wind-Noise Claim - Archived",
      "2022-2025 Corolla Cross Rear-USB Failure Claim - Archived",
      "2022-2025 Corolla Cross Windshield Stress-Crack Claim - Archived",
      "2022-2026 Corolla Cross CVT Hesitation Aggregation - Archived",
      "2023 Corolla Cross Driver-Airbag Spiral Cable - Recalls 23V-480 and 25V-040",
      "2023 Corolla Cross Hybrid XSE Whistling Noise — Owner Report",
      "2023 Corolla Cross PCS Forward-Camera Software - Campaign 25TC03",
      "2023-2024 Corolla Cross Hybrid Temporary Hard Brake Pedal - Recall 24V-708",
      "2023-2025 Corolla Cross Hybrid Reverse Pedestrian Alert - Recall 26V-203",
      "2023-2025 Corolla Cross Toyota Multimedia Connectivity or Reboot Concerns - Diagnosis Required",
      "2024 Corolla Cross Low-Speed Brake Squeal or Squeak — Owner Reports",
      "Cabin Road Noise or Booming on Rough Pavement — Owner Reports",
      "Corolla Cross Hybrid 12-Volt No-READY Events After Sitting — Owner Reports",
      "Fuel-Gauge Reading or Fill-Amount Concern — Owner Reports",
      "Rattle at Speed or While Climbing — Owner Reports"
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
    "make": "Subaru",
    "model": "Ascent",
    "existingTitles": [
      "A/C Condenser Leak from Road Debris",
      "CVT Transmission Hesitation and Harsh Engagement",
      "CVT Valve Body Failure and Transmission Warning",
      "Denso Low-Pressure Fuel Pump Impeller Failure (Recall 21V-587 / WRG-21)",
      "Driveshaft Center Support Bolts Can Loosen and Disconnect Front of Driveshaft (Recall 23V647 / WRN-23)",
      "FA24F PCV Hose Oil/Fuel/Hot-Rubber Odor Under Hood (TSB 11-204-23)",
      "Front Strut Internal Rebound Stopper Rattle / Clunk Over Bumps (TSB 05-90-24R)",
      "Fuel Pump Impeller Failure - Recall WRK-22 / NHTSA 20V-701",
      "Incorrect Gross Axle Weight Rating on Certification Label (Recall 26V436)",
      "Open Tailgate Drains 12V Battery in Hours (Body Integrated Unit Stays Awake)",
      "Parasitic Battery Drain - Dead Battery After Sitting",
      "Parasitic Battery Drain and Dead Battery",
      "PTC Cabin Heater Ground Bolt Loosens and Melts Under-Dash Wiring (Recall WRL-22 / NHTSA 22V907)",
      "Spontaneously Cracking Windshield (Class-Action Settlement Coverage)",
      "TR690 CVT Chain Slip and Chain Guide Breakage (Recall WRK-21 / NHTSA 21V-955)",
      "Undersized Front Brake Rotors and Pads - Pulsation and Shudder Under 30,000 Miles",
      "Windshield Spontaneous Cracking"
    ],
    "yearsCovered": [
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
    "make": "Honda",
    "model": "HR-V",
    "existingTitles": [
      "2024 HR-V Driver's Seat Cushion Frame Improperly Tightened — Recall 24V859",
      "AC Compressor Failure",
      "CVT Transmission Shuddering and Judder",
      "Door Lock Actuator Failure — Clicking and Erratic Locking",
      "Drive Belt Tensioner Bearing Rattle",
      "Electrical System Issues and Battery Drain",
      "Front Seat Belt Pretensioner Missing Rivet (Recall 23V-782)",
      "Front Wheel Bearing Premature Failure",
      "Fuel Pump Impeller Swelling Causing Engine Stall (Recall C2P / 20V-314 / 23V-858)",
      "Infotainment System Freezing and Glitches",
      "Minor Oil Leaks from Engine Seals",
      "Paint and Clearcoat Peeling (Roof and Hood)",
      "Rear Window Spontaneous Shattering (Defroster Defect)",
      "Rear-View Camera Display Failure (NHTSA Recall)",
      "Recall 24V744: HR-V Steering Gearbox Friction Can Cause Difficulty Steering",
      "Steering Gearbox Defect (NHTSA Recall)",
      "Window Gasket Slipping and Falling Out"
    ],
    "yearsCovered": [
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
    "model": "Sienna",
    "existingTitles": [
      "12V Auxiliary Battery Parasitic Drain - Vehicle Will Not Enter READY Mode",
      "2GR-FE V6 Excessive Oil Consumption",
      "2GR-FE Water Pump Bearing Failure and Coolant Leak",
      "3.5L 2GR-FE Oil Leak from VVT-i System and Timing Cover",
      "AC Evaporator Core Leak and Refrigerant Loss",
      "Acoustic Windshield Cracking from Minor Chips and ADAS Recalibration Cost",
      "Dashboard Cracking and Melting",
      "Dashboard Cracking and Warping",
      "Denso Low-Pressure Fuel Pump Failure Causing Engine Stall (Recall 20V-682 / 20TA02)",
      "EVAP System Leak-Detection / Vapor Canister Fault (Check Engine Light, Hard Refueling)",
      "Hybrid Battery Performance Degradation Signs",
      "Momentary Brake Lurch During Regenerative-to-Hydraulic Transition (TSB 0047-24)",
      "Power Liftgate Strut Failure and Hatch Misalignment / Twisting",
      "Power Sliding Door Cable and Motor Failure",
      "Power Sliding Door Malfunction",
      "Power Steering Rack Seal Leak",
      "Rear Coil Spring Fracture at Lower Coil from Corrosion",
      "Rearview Camera Image Freeze or Blank Screen in Reverse (Recall 25V744 / 25TB13)",
      "Sliding Door Track and Rocker Panel Corrosion Under the Door Sills",
      "Spare Tire Carrier Cable Corrosion Causing Spare to Drop (Recalls 10V-160 and 14V-273)",
      "Third-Row Seatback Recliner Bolts Under-Torqued (Recall 25V-086 / 25TA05)"
    ],
    "yearsCovered": [
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
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Colorado",
    "existingTitles": [
      "8-Speed Transmission Shudder/Harsh Shifts",
      "A/C Compressor Failure",
      "ABS Module / Wheel Speed Sensor Faults Causing ABS Warning and Intermittent Brake Activation",
      "Blower Motor Resistor and HVAC Fan Speed Failure",
      "Brake Light Switch Failure Causing Stuck Brake Lamps, Shift Interlock Problems, or Cruise Control Malfunction",
      "Cylinder Head Valve Seat Failure and Misfire on 3.5L/3.7L Inline-Five",
      "Diesel Emissions System Issues (DEF/DPF)",
      "EVAP Vent Valve and Charcoal Canister Dust Ingestion Causing Check Engine Light and Hard Refueling",
      "Frame Rust and Rear Leaf Spring Shackle / Brake Line Corrosion",
      "Front Brake Caliper Brake Fluid Leak (NHTSA Recall 15V278000)",
      "Front Suspension Clunk Over Bumps",
      "Fuel Level Sensor Failure Causing Inaccurate Gauge and Empty Reading",
      "Infotainment System Freezing/Rebooting",
      "Intermediate Steering Shaft Clunk and Steering Column Knock",
      "Parasitic Battery Drain",
      "Passlock Ignition Switch Failure Causing No-Start and Security Light",
      "Tail Lamp Circuit Board and Rear Lamp Socket Overheating",
      "Transfer Case Encoder Motor/Switch Issues",
      "Water Pump Failure (3.6L V6)"
    ],
    "yearsCovered": [
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
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
    "make": "Kia",
    "model": "Forte",
    "existingTitles": [
      "7-Speed D7UF1 Dry Dual-Clutch (DCT) Judder and Slipping on 1.6T GT Models",
      "A/C Compressor and Compressor Clutch Failure Causing Intermittent Warm Air",
      "ABS/HECU Brake-Fluid Leak Causing Electrical Short and Engine-Bay Fire",
      "Airbag Control Unit Electrical Fault - Airbags May Not Deploy in a Crash",
      "Canister Purge Control Solenoid Valve (PCSV) Sticking Open - Hard Start After Refueling and P0441/P0496",
      "Catalytic Converter Substrate Breakdown and P0420 Caused by Nu 2.0L Oil Consumption",
      "Clear-Coat / Paint Peeling and Flaking (Snow White Pearl and Light Colors)",
      "Clogged Sunroof Drain Tubes Flooding Front Passenger Footwell and Trunk",
      "Connecting Rod Bearing Failure Causing Engine Seizure, Sudden Stall and Fire Risk",
      "Crankshaft Position Sensor Failure Causing Hot-Restart Stall and Intermittent No-Start (P0335)",
      "CVT Shudder and Hesitation Under Acceleration",
      "Front and Rear Wheel Hub Bearing Failure Producing Speed-Dependent Humming/Growling",
      "Front Strut Bearing and Upper Spring Pad Noise/Failure",
      "Headlight and Taillight Moisture Condensation",
      "Motor-Driven Power Steering (MDPS) Flexible Coupler Knocking/Clunking",
      "No Engine Immobilizer on Turn-Key Ignition Models - Trivially Defeated Steering Lock Enables 'Kia Boyz' USB Theft",
      "Nu 2.0L GDI Engine Knocking and Oil Consumption",
      "Premature Low-Beam Headlight Burnout from Melting Connector/Socket",
      "UVO Head Unit Locking Up on the Splash Screen or Going Black - Loss of Radio, Bluetooth and Backup Camera"
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
      2024
    ]
  },
  {
    "make": "Hyundai",
    "model": "Sonata",
    "existingTitles": [
      "A/C Compressor Failure",
      "Connecting Rod Bearing Failure (Theta II)",
      "Dual-Clutch Transmission (DCT) Shudder/Hesitation",
      "Electric Power Steering (EPS) Failure",
      "Front Radar / Forward Collision-Avoidance Warning Disabled by Sensor or Calibration Faults",
      "Fuel Injector Failure Causing Misfire, Rough Running, and Check Engine Light",
      "Infotainment System Freezing/Issues",
      "MDPS / Electronic Power Steering (EPS) sudden assist loss and steering lockup",
      "P0011 — Intake Cam Over-Advanced from Failed Oil Control Valve (CVVT)",
      "P0016 — Crank/Cam Correlation Fault from Stretched Timing Chain (Theta II 2.4L GDI)",
      "P0128 — Engine Not Reaching Operating Temp from Stuck-Open Thermostat",
      "P0171 — Bank 1 Lean from Intake Manifold Gasket Vacuum Leak / Stuck Purge Valve",
      "P0174 — Bank 2 Lean from Upper Intake Plenum Gasket Leak (V6)",
      "P0420 — Bank 1 Catalytic Converter Failure from Theta II 2.4L GDI Oil Consumption",
      "P0430 — Bank 2 Catalytic Converter Efficiency Failure (V6)",
      "P0442 — Small EVAP Leak from Gas Cap Seal or NVLD Sensor",
      "P0455 — Gross EVAP Leak from Loose/Failed Gas Cap or Stuck Purge Valve",
      "Panoramic sunroof wind-deflector detachment / glass shattering",
      "Parasitic Battery Drain",
      "Theta II 2.0T/2.4L GDI connecting-rod bearing failure (knock, stall, fire)",
      "Theta II Engine Seizure/Failure",
      "Theta II GDI excessive oil consumption"
    ],
    "yearsCovered": [
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
      2024,
      2025
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Traverse",
    "existingTitles": [
      "3.6L V6 Timing Chain Stretch",
      "9-Speed Automatic (9T65) Torque Converter Shudder on Low-Speed Shifts",
      "9-Speed Automatic Transmission Issues",
      "9-Speed Automatic Transmission Shudder (9T65)",
      "A/C Condenser / Refrigerant Line Leak Causing Loss of Cooling",
      "A/C Evaporator Core Leak",
      "AC Compressor Premature Failure",
      "Airbags May Not Deploy - SDM Left in Manufacturing Mode (Recall 18V774000)",
      "Engine Oil Consumption (3.6L V6)",
      "EVAP Purge Valve Failure Causing Rough Idle, Stalling and Hard Starts (P0496) — GM Special Coverage N232395300",
      "Excessive Oil Consumption on 3.6L LFY (Worn Rings / PCV)",
      "HVAC Blend Door Actuator Failure — Warm Air on One Side / Inconsistent Dual-Zone Temps",
      "Inaccurate / Stuck Fuel Gauge (Fuel Level Sender Wear + 2014 ECM Recall)",
      "Infotainment Touchscreen Blackout / Freezing",
      "Intermittent \"Shift to Park\" Message — Faulty Shifter Park Switch",
      "Intermittent No-Crank / No-Start from Connector X203 and Wake-Up Faults",
      "Loss of Power Steering Assist from Hydraulic Power Steering Pump Wear",
      "Power Liftgate Strut Failure",
      "Recall 09V073000: Traverse Shift Cable Clip May Be Unseated (FMVSS 102/114 Noncompliance)",
      "Service StabiliTrak / Traction Control Warnings with Reduced Power",
      "Start/Stop Accumulator Missing Bolts Causing Transmission Fluid Leak / Loss of Propulsion (Recall N202313440)",
      "Sunroof/Moonroof Drain Clog Causing Interior Water Leak from Headliner",
      "Timing Chain Stretch and Failure (3.6L V6 LLT/LFX)",
      "Water Pump Shaft Seal Coolant Leak (3.6L V6)"
    ],
    "yearsCovered": [
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
      2024,
      2025
    ]
  },
  {
    "make": "Acura",
    "model": "RSX",
    "existingTitles": [
      "3rd Gear Synchro Grind on Manual Transmission",
      "AC Compressor Clutch Bearing Failure"
    ],
    "yearsCovered": [
      2002,
      2003,
      2004,
      2005,
      2006
    ]
  },
  {
    "make": "Acura",
    "model": "ILX",
    "existingTitles": [
      "8-Speed DCT Shudder and Low-Speed Jerking",
      "AC Compressor Failure and Refrigerant Leak",
      "Infotainment System Lag and Unresponsive Touchscreen"
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
      2022
    ]
  },
  {
    "make": "Hyundai",
    "model": "Genesis Coupe",
    "existingTitles": [
      "Concentric Slave Cylinder Failure (Manual Transmission)",
      "Excessive Oil Consumption - 3.8L Lambda V6",
      "Rear Differential Whine / Bearing Failure",
      "Steering Rack Clunk / Intermediate Shaft Noise"
    ],
    "yearsCovered": [
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-3",
    "existingTitles": [
      "A/C Compressor Failure",
      "Automatic Transmission Shudder",
      "Rear Brake Noise and Premature Wear",
      "Skyactiv 2.0L Intake Valve Carbon Buildup"
    ],
    "yearsCovered": [
      2016,
      2017,
      2018,
      2019,
      2020,
      2021
    ]
  },
  {
    "make": "Jeep",
    "model": "Commander",
    "existingTitles": [
      "Engine Overheating / Cooling System Failures",
      "Engine Stalling / Loss of Power While Driving",
      "Random Electrical Failures / Dashboard Warning Lights",
      "Transmission Overheating / Control Module Failure"
    ],
    "yearsCovered": [
      2006,
      2007,
      2008,
      2009,
      2010
    ]
  },
  {
    "make": "Harley-Davidson",
    "model": "Road King",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Honda",
    "model": "CBR600RR",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Suzuki",
    "model": "GSX-R600",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "KTM",
    "model": "390 Duke",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Ducati",
    "model": "Monster",
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
log(`Wave 13: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 13 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
