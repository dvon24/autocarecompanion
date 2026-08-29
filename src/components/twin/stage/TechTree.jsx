"use client";
/* eslint-disable */
/**
 * Au7o Tech Tree — ported verbatim from `design/au7o (6)` (the standalone
 * bundle’s tech-tree module). Kept as .jsx on purpose: the design source is
 * plain React, and re-typing 900+ lines into strict TSX would risk changing
 * behaviour for no gain. Only three things were edited:
 *   • globals (React, Icon) are now imports
 *   • `assets/...` paths point at /twin-stage/
 *   • the symbols the stage needs are exported at the bottom
 */
import React from "react";
import { Icon } from "./Icon";
import { MaintenanceLogFlow } from "../../vehicle/MaintenanceLogFlow";
import { useTwinEquipment, useTwinLive, useTwinOwnerActions, useTwinVehicle, useTwinTrees, useTwinMode } from "../twin-context";

/* Ported from the design bundle's "Hub personalized" module — TTDetail renders
   it, and its absence crashed every part tap with a ReferenceError. */
function FitmentBadge({ node }) {
  /* Named the demo car in hardcoded text. On a live hub this badge is a
     fitment claim about the OWNER's car, so it has to read from the vehicle
     actually being shown — a "verified fit" label naming the wrong car is
     exactly the failure this project has been careful to avoid elsewhere. */
  const v = useTwinVehicle();
  const directReviewedPart = Boolean(node?.buyUrl)
    && !/parts\.nissanusa\.com\/v-/i.test(node.buyUrl)
    && node?.partNo && node.partNo !== "—"
    && node?.price && !/verify|choose|not sourced/i.test(node.price);
  if (!directReviewedPart) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, maxWidth:"100%", whiteSpace:"normal", lineHeight:1.3, fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:999, background:"var(--ki-page)", color:"var(--slate-600)", border:"1px solid var(--ki-line)" }}>
        {node?.partNo === "Not sourced for this demo" ? "System mapped · exact part not sourced" : /parts\.nissanusa\.com\/v-/i.test(node?.buyUrl || "") ? "OEM catalog · confirm VIN" : "Part recorded · confirm fitment"}
      </span>
    );
  }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, maxWidth:"100%", whiteSpace:"normal", lineHeight:1.3, fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:999, background:"var(--ki-ok-bg)", color:"var(--ki-ok-ink)" }}>
      <Icon name="check" size={10} stroke={2.4}/> Fitment reviewed · {v.year} {v.trim || v.model}
    </span>
  );
}

export function resolveKnownIssueAction(node) {
  const issue = node?.knownIssue;
  if (!issue?.id) return null;
  const fixParts = Array.isArray(issue.fixParts) ? issue.fixParts : [];
  let fixPart = null;
  for (const part of fixParts) {
    const link = Array.isArray(part?.buyLinks)
      ? part.buyLinks.find((candidate) => candidate?.verified === true && typeof candidate.url === "string" && candidate.url.length > 0)
      : null;
    if (link) { fixPart = { part, link }; break; }
  }
  return {
    summary:issue.description || node.issue || issue.label || null,
    repair:issue.solution || node.upgrade?.fixes || null,
    fixPart,
    href:issue.href || null,
  };
}

function TTKnownIssueCard({ node, dense }) {
  const action = resolveKnownIssueAction(node);
  if (!action) return null;
  const { summary, repair, fixPart, href } = action;
  return (
    <div style={{ marginTop:dense?13:14, padding:"11px 12px", borderRadius:dense?12:11, background:"rgba(139,92,246,.12)", border:"1px solid rgba(167,139,250,.35)" }}>
      <div className="eyebrow" style={{ fontSize:9.5, color:TT_UP_HEX }}><Icon name="shield-alert" size={10}/> Known issue on record</div>
      {summary && <div style={{ marginTop:7 }}><div style={{fontSize:10,fontWeight:700,color:"var(--slate-500)",textTransform:"uppercase",letterSpacing:".06em"}}>Summary</div><div style={{ fontSize:dense?12.5:12, lineHeight:1.5, marginTop:3, textWrap:"pretty" }}>{summary}</div></div>}
      {repair && <div style={{ marginTop:9 }}><div style={{fontSize:10,fontWeight:700,color:"var(--slate-500)",textTransform:"uppercase",letterSpacing:".06em"}}>How to fix</div><div style={{fontSize:dense?12.5:12,lineHeight:1.5,marginTop:3,textWrap:"pretty"}}>{repair}</div></div>}
      <div style={{marginTop:10,paddingTop:9,borderTop:"1px solid rgba(167,139,250,.25)"}}>
        {fixPart ? (
          <a href={fixPart.link.url} target="_blank" rel="noopener noreferrer sponsored" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,minHeight:40,padding:"8px 10px",borderRadius:9,background:"var(--ki-card)",border:"1px solid var(--ki-line)",color:"#2563EB",fontSize:11.5,fontWeight:650,textDecoration:"none"}}>
            <span style={{minWidth:0}}>Fix part: {fixPart.part.component}{fixPart.part.oemPartNumber ? ` · ${fixPart.part.oemPartNumber}` : ""}</span><span style={{flexShrink:0}}>{fixPart.link.vendor || "View part"} →</span>
          </a>
        ) : (
          <div style={{padding:"8px 10px",borderRadius:9,background:"var(--ki-card)",border:"1px solid var(--ki-line)",fontSize:11.5,lineHeight:1.45,color:"var(--slate-600)"}}><strong style={{color:"var(--ink)"}}>Service action:</strong> Ask a dealer or qualified repair shop to confirm the diagnosis and correct repair for this VIN before ordering parts.</div>
        )}
      </div>
      {node.issueRef && <div className="mono" style={{ fontSize:9.5, color:"var(--slate-500)", marginTop:8 }}>{node.issueRef}</div>}
      {href && <a href={href} style={{ display:"inline-block", marginTop:8, color:TT_UP_HEX, fontSize:11, fontWeight:650 }}>View full known issue</a>}
    </div>
  );
}

/* Au7o Tech Tree — node canvas. Draggable nodes, expandable hierarchy, AI-driven reshaping,
   mileage/known-issue risk glow, right-click node styling. */

const TT_SHAPES = [
  { id:"rect",    label:"Square",  radius:3 },
  { id:"rounded", label:"Rounded", radius:14 },
  { id:"pill",    label:"Pill",    radius:999 },
  { id:"cut",     label:"Cut",     radius:3, cut:true },
];
const TT_COLORS = [
  { id:"ink",   label:"Graphite", hex:"var(--ink)" },
  { id:"blue",  label:"Blue",     hex:"#2563EB" },
  { id:"red",   label:"Red",      hex:"#A62B22" },
  { id:"amber", label:"Amber",    hex:"#D9822B" },
  { id:"violet",label:"Violet",   hex:"#6D28D9" },
];

const TT_NODE_W = 198;
/* Part art lives at /twin-stage/parts/x.webp but the thumbnail set is FLAT at
   /twin-stage/thumbs/x.webp. A blanket "/twin-stage/" -> "/twin-stage/thumbs/"
   replace produced /twin-stage/thumbs/parts/x.webp, which 404s — that was the
   broken-image mark in the tech tree. Map the filename, not the path. */
const ttThumb = src => {
  if (!src) return "";
  if (src.indexOf("/twin-stage/thumbs/") === 0) return src;
  if (/\/base-[^/]+\.webp$/i.test(src) || src.endsWith("/car-xray.webp")) return src;
  const file = src.slice(src.lastIndexOf("/") + 1);
  return "/twin-stage/thumbs/" + file;
};

/* riskAt = mileage the part is typically consumed / known to fail. life = service life copy. */
const TT_TREES = {
  wheel: {
    label:"Wheel, Tire & Brakes", short:"Wheel · Tire · Brakes", root:"wtb",
    nodes:{
      wtb:{ label:"Wheel, Tire & Brakes", sub:"All four corners", img:"/twin-stage/parts/part-wheel.webp", kids:["tire","wheelA","brakes"], group:true,
            partNo:"—", where:"Hub outward, front and rear", spec:"Same wheel and tire all round · brakes differ front to rear", price:"—" },
      tire:{ label:"Tire", sub:"275/40ZR20 · all four", img:"/twin-stage/parts/part-tire.webp", kids:[], riskAt:40000,
             partNo:"275/40R20 106Y XL · Discount Tire item 137905", brand:"Pirelli P Zero AS Plus 3 replacement option", where:"All four corners — same size front and rear", spec:"275/40R20 106Y XL · 9–11 in approved rim range and 2,094 lb max load · confirm the door placard and every installed sidewall", price:"$317.00 each when reviewed", stock:"Discount Tire · direct product page live when reviewed", buyUrl:"https://www.discounttire.com/buy-tires/pirelli-p-zero-as-plus-3/p/137905",
             life:"Replace at 3/32\" tread or 6 years", dueNote:"You are 25,000 mi past a typical set.", issue:"Heat-cycled sidewalls on a 392 go off well before the tread does — a set that still shows tread can be long past its grip." },
      wheelA:{ label:"Wheel", finishes:true, sub:"20 × 9.5 forged · all four", img:"/twin-stage/parts/part-wheel.webp", kids:["lugs","tpms"],
               partNo:"5XC13TRMAA", brand:"Mopar forged aluminum", where:"All four corners — same part front and rear", spec:"20×9.5 · 5×115 · +23 mm offset", price:"$542.00 ea", stock:"Mopar parts counter · special order",
               life:"Inspect for curb damage and runout at every rotation" },
      lugs:{ label:"Lug Nuts", sub:"Set of 20 · M14 × 1.5", img:"/twin-stage/parts/part-lugs.webp", kids:[], riskAt:60000,
             partNo:"6509064AA", brand:"Mopar capped lug nut", where:"5 per corner · 22 mm socket", spec:"Torque 130 ft-lb · star pattern", price:"$3.85 ea", stock:"RockAuto · in stock",
             life:"Replace any nut that no longer takes a 22 mm socket cleanly",
             issue:"Classic Chrysler swollen-lug-nut failure — the chrome cap separates and balloons, so the socket won't seat. Extremely common by 60k. Solid one-piece aftermarket nuts are the usual fix.",
             alt:"Gorilla 21133HT one-piece steel · $28.60 for 20" },
      tpms:{ label:"TPMS Sensor", sub:"433 MHz · pressure + temp", img:"/twin-stage/parts/part-wheel.webp", kids:[],  riskAt:70000,
             partNo:"68239720AA", brand:"Mopar / Schrader clamp-in", where:"Inside the wheel at the valve stem", spec:"433 MHz · relearn required after swap", price:"$46.20", stock:"O'Reilly · 2.1 mi",
             life:"Battery is sealed — 7 to 10 years, then the whole sensor" },
      brakes:{ label:"Brakes", sub:"Brembo · front 6-pot, rear 4-pot", img:"/twin-stage/parts/part-caliper.webp", kids:["frontBrakes","rearBrakes","brakeFluid"], group:true,
               partNo:"—", where:"Behind each wheel", spec:"Front 390 mm 6-piston · rear 350 mm 4-piston", price:"—" },
      frontBrakes:{ label:"Front Brakes", sub:"6-piston · 390 mm", img:"/twin-stage/parts/part-caliper.webp", kids:["caliper","rotor","pads"], group:true,
               partNo:"—", where:"Front axle, both sides", spec:"Brembo 6-piston fixed · 390 mm two-piece rotor", price:"—",
               life:"The end that does 70% of the stopping — and wears like it" },
      rearBrakes:{ label:"Rear Brakes", sub:"4-piston · 350 mm", img:"/twin-stage/parts/part-caliper.webp", kids:["caliperR","rotorR","padsR"], group:true,
               partNo:"—", where:"Rear axle, both sides", spec:"Brembo 4-piston fixed · 350 mm vented rotor", price:"—",
               life:"Rears typically go two front sets before they need anything" },
      brakeFluid:{ label:"Brake Fluid", sub:"DOT 4 · full system", img:"/twin-stage/parts/part-brake-fluid.webp", kids:[], riskAt:62000,
                partNo:"68218067AB", brand:"Mopar DOT 4 · 12 oz", where:"Master cylinder reservoir, driver side firewall", spec:"DOT 4 only · 1.0 qt for a full flush · dry boiling point 509 °F", price:"$9.79 / 12 oz", stock:"NAPA · 1.7 mi",
                life:"Flush every 2 years or 30,000 mi — it absorbs water whether you drive or not",
                dueNote:"Never logged on this car.", issue:"Old fluid boils under repeated hard stops and the pedal goes long right when you need it — the cheapest brake job on the list." },
      caliper:{ label:"Front Caliper", sub:"6-piston fixed, red", img:"/twin-stage/parts/part-caliper.webp", kids:[],
                partNo:"68249074AA", brand:"Brembo 6-piston fixed", where:"Front, bolted to the knuckle", spec:"Bracket bolts 100 ft-lb · pistons 2×36 / 2×40 / 2×44 mm", price:"$689.00 reman", stock:"RockAuto · core charge $120",
                life:"Rebuild or replace when a piston sticks or a boot tears" },
      rotor:{ label:"Front Rotor", sub:"390 mm slotted two-piece", img:"/twin-stage/parts/part-rotor.webp", kids:[], riskAt:70000,
              partNo:"68184587AB → 68184587AE", brand:"Genuine Mopar two-piece slotted rotor", where:"Front axle, under the 6-piston caliper", spec:"390 × 34 mm · SRT 392 six-piston Brembo branch · replace as an axle pair", price:"$932.80 ea when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-rotor-brake~68184587ae.html",
              life:"Resurface once, then replace — most 392 owners replace in pairs",
              issue:"Front rotors on the 392 warp early if the car sees hard street stops. Watch for steering-wheel shudder at 55–65 mph braking.",
              alt:"StopTech 126.63066SR slotted · $214.99 ea" },
      pads:{ label:"Front Pads", sub:"Front axle set · 6-pot", img:"/twin-stage/parts/part-pads.webp", kids:[], riskAt:45000,
             partNo:"68144213AA → 68144213AC", brand:"Genuine Mopar front disc brake pad kit", where:"Front axle set · 4 pads", spec:"BR4 six-piston SRT 392 branch · not interchangeable with the rears", price:"$153.00 set when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-front-disc-brake~68144213ac.html",
             life:"30k–45k on a 392 driven the way a 392 gets driven",
             dueNote:"20,000 mi past a typical front set.", issue:"Pad slap and a low pedal are the tells on this car long before the wear sensor squeals.",
             alt:"Hawk HPS 5.0 HB726B.582 · $148.00 set" },
      caliperR:{ label:"Rear Caliper", sub:"4-piston fixed, red", img:"/twin-stage/parts/part-caliper.webp", kids:[],
                partNo:"68249076AA", brand:"Brembo 4-piston fixed", where:"Rear, bolted to the knuckle", spec:"Bracket bolts 85 ft-lb · pistons 4×38 mm", price:"$472.00 reman", stock:"RockAuto · core charge $95",
                life:"Rears seize before they wear — exercise the slides at every pad change" },
      rotorR:{ label:"Rear Rotor", sub:"350 mm vented", img:"/twin-stage/parts/part-rotor.webp", kids:[], riskAt:95000,
              partNo:"5290538AC → 5290538AE", brand:"Genuine Mopar rear brake rotor", where:"Rear axle, under the 4-piston caliper", spec:"350 mm SRT rear-brake branch · replace as an axle pair", price:"$158.63 ea when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-rotor-brake~5290538ae.html",
              life:"Usually outlives two front sets — replace in pairs when they do go" },
      padsR:{ label:"Rear Pads", sub:"Rear axle set · 4-pot", img:"/twin-stage/parts/part-pads.webp", kids:[], riskAt:80000,
             partNo:"68144223AA → 68144223AD", brand:"Genuine Mopar rear disc brake pad kit", where:"Rear axle set · 4 pads", spec:"BR4 four-piston SRT rear branch · not interchangeable with the fronts", price:"$156.38 set when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-rear-disc-brake~68144223ad.html",
             life:"60k–80k — roughly twice a front set" },
    },
  },
  oil: {
    label:"Oil Change", short:"Oil change", root:"oil",
    nodes:{
      oil:{ label:"Oil Change", sub:"6.4L HEMI · 7.0 qt", img:"/twin-stage/parts/part-oil-filter.webp", kids:["oilFluid","oilFilter","oilPlug"], group:true,
            partNo:"—", where:"Under the car, driver side", spec:"Every 6,000 mi on a 392", price:"—" },
      oilFluid:{ label:"Engine Oil", sub:"SAE 0W-40 · MS-12633", img:"/twin-stage/parts/part-oil.webp", kids:[], riskAt:65000,
                 partNo:"550045214", brand:"Pennzoil Ultra Platinum 0W-40", where:"7.0 qt with a filter change", spec:"Full synthetic, MS-12633 required — not 5W-20", price:"$10.97 / 1 qt when reviewed", stock:"Walmart · in stock when reviewed", buyUrl:"https://www.walmart.com/ip/44981487",
                 life:"6,000 mi or 6 months, whichever lands first",
                 dueNote:"Due now.", issue:"The 392 is one of the few HEMIs that genuinely needs 0W-40 — a quick-lube 5W-20 fill is how lifters start ticking." },
      oilFilter:{ label:"Oil Filter", sub:"Spin-on · full-flow", img:"/twin-stage/parts/part-oil-filter.webp", kids:[], riskAt:65000,
                  partNo:"04884899AB → 04884899AC / MO-899", brand:"Genuine Mopar engine oil filter", where:"Lower engine oil-filter mounting point", spec:"6.4L HEMI fitment · lubricate the gasket and follow the filter installation instructions", price:"$6.99 when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/oem-2015-dodge-challenger-oil_filter.html",
                  life:"Every oil change, no exceptions" },
      oilPlug:{ label:"Drain Plug & Gasket", sub:"M14 plug · crush washer", img:"/twin-stage/parts/part-drain-plug.webp", kids:[],
                partNo:"6506305AA", brand:"Mopar crush washer", where:"Oil pan drain plug", spec:"Plug torque 20 ft-lb", price:"$1.35", stock:"Dealer · in stock",
                life:"One-time use — replace with every drain" },
    },
  },
  wipers: {
    label:"Windshield Wipers", short:"Wipers", root:"wip",
    nodes:{
      wip:{ label:"Windshield Wipers", sub:"Front pair · 22\" / 20\"", img:"/twin-stage/parts/part-wipers.webp", kids:["wipL","wipR","wipFluid"], group:true,
            partNo:"—", where:"Base of the windshield", spec:"Hook-style arm", price:"—" },
      wipL:{ label:"Driver Blade", sub:"22 inch", img:"/twin-stage/parts/part-wiper-driver.webp", kids:[], riskAt:60000,
             partNo:"22-4", brand:"Rain-X Latitude 22\"", where:"Driver side arm", spec:"Hook J-arm · beam blade", price:"$18.97", stock:"AutoZone · 0.9 mi",
             life:"6 to 12 months",
             issue:"Chattering and streaking on the driver side is the most common wiper complaint on this car — the arm spring weakens before the rubber goes." },
      wipR:{ label:"Passenger Blade", sub:"20 inch", img:"/twin-stage/parts/part-wiper-pass.webp", kids:[], riskAt:60000,
             partNo:"20-4", brand:"Rain-X Latitude 20\"", where:"Passenger side arm", spec:"Hook J-arm · beam blade", price:"$17.47", stock:"AutoZone · 0.9 mi",
             life:"Replace as a pair with the driver blade" },
      wipFluid:{ label:"Washer Fluid", sub:"Reservoir · 4.7 qt", img:"/twin-stage/parts/part-washer-fluid.webp", kids:[],
                 partNo:"—", brand:"De-icer rated to −20 °F", where:"Reservoir neck, passenger front corner", spec:"Do not use plain water — the pump freezes", price:"$4.29 gal", stock:"Any parts store",
                 life:"Top off every oil change" },
    },
  },
};

/* the radiator known issue's fix — one object, shared by the part and its option node */
const TT_RAD_UPGRADE = { label:"Mishimoto MMRAD-SRT-15", tag:"All-aluminium direct fit", img:"/twin-stage/parts/part-radiator-alum.webp",
  fixes:"Retires the failure mode instead of resetting the clock — TIG-welded aluminium end tanks in place of the crimped plastic ones, lifetime warranty.",
  price:"$826.00", stock:"Amazon · 2-day", gain:"Reliability +18", confidence:"35 owner reports · fitment reviewed",
  fit:"6.4L 392 / Scat Pack / SRT (2011–2021). The 5.7L R/T takes MMRAD-SRT-09 — confirm by VIN.", buyUrl:"https://www.amazon.com/s?k=Mishimoto%20MMRAD-SRT-15&tag=au7o-20",
  node:{ sub:"All-aluminium · welded tanks", img:"/twin-stage/parts/part-radiator-alum.webp", partNo:"MMRAD-SRT-15", brand:"Mishimoto all-aluminium direct fit", price:"$826.00", stock:"Amazon · 2-day",
         spec:"2-row aluminium core · TIG-welded end tanks · cap 16 psi", life:"Lifetime warranty — the OEM tank failure no longer applies to this car", riskAt:null, issue:null, buyUrl:"https://www.amazon.com/s?k=Mishimoto%20MMRAD-SRT-15&tag=au7o-20",
         resolved:"Known issue cleared — the plastic end tanks that fail on this platform are gone." } };

/* Engine — holds the oil change, the two filters, and the radiator/cooling group */
TT_TREES.engine = {
  label:"Engine", short:"Engine", root:"eng",
  nodes: Object.assign({
    eng:{ label:"Engine", sub:"6.4L V8 HEMI · 485 hp", img:"/twin-stage/parts/part-engine.webp", kids:["oil","airFilter","cabinFilter","rad"], group:true,
          partNo:"—", where:"Under the hood", spec:"6.4L 392 HEMI · naturally aspirated", price:"—",
          life:"Oil, filters and coolant are the whole maintenance story on this engine" },
    airFilter:{ label:"Engine Air Filter", sub:"Panel · dry media", img:"/twin-stage/parts/part-air-filter.webp", kids:[], riskAt:60000,
          partNo:"4861746AB → 68646405AA", brand:"Genuine Mopar air filter", where:"Engine air-cleaner housing", spec:"6.4L SRT HEMI branch · dry replacement element · do not wash or oil", price:"$28.89 when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-filter-air~4861746ab.html",
          life:"Every 30,000 mi, sooner on dirt roads",
          dueNote:"Past due.", issue:"A loaded filter on a 392 shows up as a lazy top end long before any code sets." },
    cabinFilter:{ label:"Cabin Air Filter", sub:"Fresh-air inlet element", img:"/twin-stage/parts/part-cabin-filter.webp", kids:[], riskAt:55000,
          partNo:"68071668AA → 68535614AA", brand:"Genuine Mopar cabin air filter", where:"Fresh-air inlet below the cowl access cover", spec:"2015 Challenger all-engine branch · install in the airflow direction shown on the element", price:"$25.63 when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/oem-2015-dodge-challenger-cabin_air_filter.html",
          life:"Every 20,000 mi or a year",
          dueNote:"Overdue by a wide margin.", issue:"This is the one people notice — weak vents and a musty smell on first start." },
    rad:{ label:"Radiator & Coolant", sub:"Cooling system", img:"/twin-stage/parts/part-radiator.webp", kids:["radCore","coolant"], group:true,
          partNo:"—", where:"Front of the engine bay", spec:"14.5 qt system capacity", price:"—" },
    radCore:{ label:"Radiator", sub:"Aluminium core · plastic tanks", img:"/twin-stage/parts/part-radiator.webp", kids:["radOem","radAlum"], riskAt:90000,
          issue:"2011–2021 Challenger, all trims — the crimped plastic end tanks split at the seams and weep, typically between 60,000 and 100,000 mi and sooner on a 392 driven hard or in heat. Symptoms start as a seam leak, low-coolant warnings and steam under load.",
          issueRef:"OEM radiator premature failure · 2011–2021 · all trims · 35 owner reports",
          upgrade:TT_RAD_UPGRADE,
          partNo:"5170742AA", brand:"Genuine Mopar engine-cooling radiator", where:"Front of the engine bay, behind the grille", spec:"6.4L SRT HEMI branch · verify VIN and severe-duty cooling configuration", price:"$284.33 when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-radiator-engine-cooling~5170742aa.html",
          life:"Inspect the tank seams at every coolant change — the plastic end tanks are what fail, not the core" },
    radOem:{ label:"OEM · plastic end tanks", sub:"Genuine Mopar · $284.33", img:"/twin-stage/parts/part-radiator.webp", kids:[], fitFor:"radCore", fitWhen:false,
          partNo:"5170742AA", brand:"Genuine Mopar engine-cooling radiator", where:"Front of the engine bay, behind the grille", spec:"6.4L SRT HEMI branch · aluminium core with crimped plastic tanks", price:"$284.33 when reviewed", stock:"MoparPartsGiant · add-to-cart live when reviewed", buyUrl:"https://www.moparpartsgiant.com/parts/mopar-radiator-engine-cooling~5170742aa.html",
          life:"60,000–100,000 mi before the tank seams weep — then you do this job again",
          issue:"This is the part the known issue is written about. A like-for-like replacement resets the clock but keeps the failure mode.",
          issueRef:"OEM radiator premature failure · 2011–2021 · all trims" },
    radAlum:{ label:"Mishimoto MMRAD-SRT-15", sub:"All-aluminium · welded tanks · $826.00", img:"/twin-stage/parts/part-radiator-alum.webp", kids:[], fitFor:"radCore", fitWhen:true, upgrade:TT_RAD_UPGRADE,
          partNo:"MMRAD-SRT-15", brand:"Mishimoto all-aluminium direct fit", where:"Same mounts as the OEM unit — direct fit, no bracket work", spec:"2-row aluminium core · TIG-welded end tanks · cap 16 psi", price:"$826.00", stock:"Amazon · 2-day", buyUrl:"https://www.amazon.com/s?k=Mishimoto%20MMRAD-SRT-15&tag=au7o-20",
          life:"Lifetime warranty — the plastic-tank failure mode no longer applies",
          resolved:"Fitting this clears the 2011–2021 radiator known issue on your car." },
    coolant:{ label:"Antifreeze", sub:"OAT · MS-12106", img:"/twin-stage/parts/part-antifreeze.webp", kids:[], riskAt:60000,
          partNo:"68163849AB", brand:"Mopar 10-year OAT, purple", where:"Reservoir on the passenger side of the radiator", spec:"50/50 premix · do not mix with green or orange HOAT", price:"$24.95 gal when reviewed", stock:"RockAuto · exact-part search", buyUrl:"https://www.rockauto.com/en/partsearch/?partnum=68163849AB",
          life:"10 years or 150,000 mi from new, then every 5 years",
          dueNote:"Due for its first change.", issue:"Mixing coolant types on a HEMI drops the pack out of suspension and clogs the heater core — use OAT purple only." },
  }, TT_TREES.oil.nodes),
};

/* Transmission — the public demo uses the automatic 8HP70 branch. Live owner
   trees replace it with the exact automatic/manual branch captured during
   reservation; trim alone is not enough on the SRT 392. */
TT_TREES.trans = {
  label:"Transmission", short:"Transmission", root:"trx",
  nodes:{
    trx:{ label:"Transmission", sub:"ZF 8HP70 · 8-speed automatic", img:"/twin-stage/parts/part-transmission.webp", kids:["transFluid","transPan","transPlug"], group:true,
          partNo:"—", where:"Behind the engine, under the tunnel", spec:"ZF 8HP70 · confirm transmission before ordering", price:"—",
          life:"Fluid and the integrated pan filter are the service items — there is no dipstick" },
    transFluid:{ label:"Transmission Fluid", sub:"ZF LifeguardFluid 8", img:"/twin-stage/parts/part-transmission-fluid.webp", kids:[], riskAt:60000,
          partNo:"68218925AA", brand:"Mopar 8 & 9 Speed ATF / ZF LifeguardFluid 8", where:"Fill plug on the driver side of the pan — filled from underneath", spec:"Set the level using the exact temperature procedure · never substitute ATF+4", price:"Verify current price", stock:"Confirm by VIN before ordering",
          life:"60,000 mi for this owner-facing plan; shorten for track or tow use",
          dueNote:"5,000 mi past due — never logged on this demo car." },
    transPan:{ label:"Pan & Filter", sub:"Filter integrated into pan", img:"/twin-stage/parts/part-oil-filter.webp", kids:[], riskAt:60000,
          partNo:"68225344AA", brand:"Mopar pan-with-filter assembly", where:"Bottom of the transmission", spec:"Pan, filter and gasket are serviced as one assembly · automatic 8HP70 only; confirm VIN", price:"Verify current price", stock:"RockAuto · exact-part search", buyUrl:"https://www.rockauto.com/en/partsearch/?partnum=68225344AA",
          life:"Replace with a full automatic-transmission fluid service" },
    transPlug:{ label:"Fill Plug Seal", sub:"One-time-use seal", img:"/twin-stage/parts/part-drain-plug.webp", kids:[],
          partNo:"Verify by VIN", brand:"Mopar / ZF service seal", where:"Fill plug on the transmission pan", spec:"Use the exact service procedure and torque for the installed transmission", price:"Verify current price", stock:"Confirm by VIN before ordering",
          life:"Replace whenever the fill plug is removed" },
  },
};

/* The level above the categories: the car itself. Holds every category's nodes, so a
   filter like "maintenance due" can span the whole vehicle instead of one branch. */
TT_TREES.car = {
  label:"2015 Dodge Challenger SRT 392", short:"Your car", root:"car", isCar:true,
  nodes: Object.assign({
    car:{ label:"2015 Challenger SRT 392", sub:"6.4L V8 HEMI · 65,000 mi", img:"/twin-stage/challenger/base-granite-crystal.webp", kids:["wtb","eng","trx","wip"], group:true,
          partNo:"VIN 2C3CDZ...", where:"Your garage", spec:"Every system Au7o tracks on this car", price:"—",
          life:"Four systems tracked · parts due across all of them" },
  }, TT_TREES.wheel.nodes, TT_TREES.engine.nodes, TT_TREES.trans.nodes, TT_TREES.wipers.nodes),
};

const TT_BRANCH_ORDER = ["car", "wheel", "engine", "trans", "wipers"];
const TT_CATEGORY_OF = { wtb:"wheel", eng:"engine", trx:"trans", wip:"wipers" };

const TT_BRANCH_FOR_HOTSPOT = { wheel:"wheel", hood:"engine", glass:"wipers", rad:"engine", rearwheel:"wheel", trans:"trans" };
const TT_NODE_FOR_HOTSPOT = { rad:"radCore", hood:"oil", rearwheel:"tire" };

/* ── Equipped upgrades — one store the hub, tree and phone all read ── */
const TT_UP_HEX = "#8B5CF6";
const TT_NO_EQUIP = {};
const TT_EQUIP = { map:{}, subs:new Set(), bump(){ TT_EQUIP.subs.forEach(f => f()); }, set(id, on){ TT_EQUIP.map = { ...TT_EQUIP.map, [id]:!!on }; TT_EQUIP.bump(); } };
/* Wheel finish — the one mod that shows on the car itself, so the hub photo has to follow it.
   One bronze wheel layer, tinted per finish — no extra renders. */
const TT_FINISHES = [
  { id:"oem",      label:"Satin Black",  swatch:"#2B2F36", sub:"20 × 9.5 forged · Satin Black",  price:"On the car", filter:null },
  { id:"bronze",   label:"Satin Bronze", swatch:"#A0703A", sub:"20 × 9.5 forged · Satin Bronze", price:"$1,480 / set", filter:"none" },
  { id:"silver",   label:"Brushed",      swatch:"#C4C9D1", sub:"20 × 9.5 forged · Brushed",      price:"$1,480 / set", filter:"saturate(.12) brightness(1.6)" },
  { id:"gunmetal", label:"Gunmetal",     swatch:"#565C66", sub:"20 × 9.5 forged · Gunmetal",     price:"$1,480 / set", filter:"saturate(.16) brightness(.82)" },
];
TT_EQUIP.finish = "oem";
TT_EQUIP.setFinish = id => { TT_EQUIP.finish = id; TT_EQUIP.bump(); };
const ttFinish = () => TT_FINISHES.find(f => f.id === TT_EQUIP.finish) || TT_FINISHES[0];

/* service log — marking a part done resets its clock from the odometer reading of the day */
const ttMarkDone = (node, miles) => { node.servicedAt = miles; TT_EQUIP.bump(); };
const ttUndoDone = node => { delete node.servicedAt; TT_EQUIP.bump(); };
const ttNextDue = node => node.servicedAt != null && node.riskAt ? node.servicedAt + node.riskAt : null;
function useEquipped() {
  const [, bump] = React.useState(0);
  React.useEffect(() => { const f = () => bump(v => v + 1); TT_EQUIP.subs.add(f); return () => TT_EQUIP.subs.delete(f); }, []);
  return [TT_EQUIP.map, TT_EQUIP.set];
}
/* nodes as the owner sees them today — equipped upgrades replace the OEM part in place */
const ttViewNodes = (nodes, eq, finish = null) => {
  const fin = finish || ttFinish();
  const equipmentKnown = eq !== TT_NO_EQUIP;
  const ids = Object.keys(nodes).filter(id => (nodes[id].upgrade && eq[id]) || (equipmentKnown && nodes[id].fitFor) || (nodes[id].finishes && fin.id !== "oem"));
  if (!ids.length) return nodes;
  const out = { ...nodes };
  ids.forEach(id => {
    const n = nodes[id];
    let v = n;
    if (n.upgrade && eq[id]) {
      v = { ...v, ...n.upgrade.node, upgraded:true };
      // A resolved issue disappears only when persisted equipment evidence
      // reached the owner context. Demo/local toggles use the same view rule.
      if (v.resolved) delete v.knownIssue;
    }
    if (equipmentKnown && n.fitFor) v = { ...v, fitted: !!eq[n.fitFor] === !!n.fitWhen };
    if (n.finishes && fin.id !== "oem") v = { ...v, sub: fin.sub, img:"/twin-stage/parts/part-wheel-bronze.webp" };
    out[id] = v;
  });
  return out;
};
const ttUpState = node => !node ? null
  : node.fitFor ? (node.fitted ? "equipped" : node.upgrade ? "available" : null)
  : node.upgrade ? (node.upgraded ? "equipped" : "available") : null;
/* does any part under these ids have an upgrade the owner hasn't equipped? */
const ttHasUpgrade = (nodes, ids, eq) => ids.some(id => nodes[id] && nodes[id].upgrade && !nodes[id].fitFor && !eq[id]);

function ttRisk(node, miles) {
  if (typeof miles !== "number") return null;
  if (node.unlogged) {
    if (node.firstServiceDeadline && (node.overdueByDate === true || (typeof node.dueMileage === "number" && node.dueMileage < miles))) return "critical";
    return null;
  }
  if (node.overdueByDate === true) return "critical";
  if (typeof node.dueMileage === "number") {
    const remaining = node.dueMileage - miles;
    if (remaining < 0) return "critical";
    if (typeof node.riskAt === "number" && remaining <= node.riskAt * 0.2) return "watch";
    return null;
  }
  if (!node.riskAt) return null;
  if (node.servicedAt != null) {
    /* Serviced: risk is how far through the INTERVAL we are. The old code
       compared the odometer against an absolute due figure, so the 80%
       "watch" band was measured from zero miles — on a 155,000 mi car every
       part sat above 80% of its due number forever, and an oil change done
       this morning still read as amber. Only visible once real service
       history exists, which is why the demo never showed it. */
    const elapsed = miles - node.servicedAt;
    if (elapsed >= node.riskAt) return "critical";
    if (elapsed >= node.riskAt * 0.8) return "watch";
    return null;
  }
  /* Never serviced: fall back to treating riskAt as an absolute mileage,
     which is how the demo car is authored. */
  if (miles >= node.riskAt) return "critical";
  if (miles >= node.riskAt * 0.8) return "watch";
  return null;
}

function ttRiskLabel(node, miles, risk = ttRisk(node, miles)) {
  if (!risk) return null;
  if (risk === "watch") return "Watch — approaching its service window";
  const sources = [];
  if (node.overdueByDate === true && node.dueDate) {
    const date = new Date(node.dueDate);
    if (Number.isFinite(date.getTime())) {
      sources.push(`Past due by date (${date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric", timeZone:"UTC" })})`);
    }
  }
  const dueMileage = typeof node.dueMileage === "number"
    ? node.dueMileage
    : (typeof node.servicedAt === "number" && typeof node.riskAt === "number" ? node.servicedAt + node.riskAt : null);
  if (dueMileage != null && typeof miles === "number" && dueMileage < miles) {
    sources.push(`Past due by mileage (${dueMileage.toLocaleString()} mi deadline)`);
  }
  return sources.length ? sources.join(" · ") : "Service deadline passed";
}

/* ── Layout: layered left→right, leaves stack vertically ── */
function ttLayout(nodes, rootId, expanded, allow, row, col) {
  const COL = col || 258, ROW = row || 90;
  const pos = {};
  let slot = 0;
  const walk = (id, depth) => {
    const n = nodes[id];
    const kids = (expanded[id] ? (n.kids || []) : []).filter(k => !allow || allow[k]);
    if (!kids.length) { const y = slot * ROW; slot++; pos[id] = { x: depth * COL, y }; return y; }
    const ys = kids.map(k => walk(k, depth + 1));
    const y = (ys[0] + ys[ys.length - 1]) / 2;
    pos[id] = { x: depth * COL, y };
    return y;
  };
  walk(rootId, 0);
  return pos;
}

function ttVisible(nodes, rootId, expanded, allow) {
  const out = [];
  const walk = id => { if (allow && !allow[id]) return; out.push(id); if (expanded[id]) (nodes[id].kids || []).forEach(walk); };
  walk(rootId);
  return out;
}

/* ── Node ── */
/* ── Top-down layout — same tree as the desktop graph, rotated: generations stack downward,
   siblings sit side by side. The phone layout. ── */
function ttLayoutV(nodes, rootId, expanded, allow, ROW, COL) {
  const pos = {};
  let slot = 0;
  const walk = (id, depth) => {
    const kids = (expanded[id] ? (nodes[id].kids || []) : []).filter(k => !allow || allow[k]);
    if (!kids.length) { const x = slot * COL; slot++; pos[id] = { x, y: depth * ROW, depth }; return x; }
    const xs = kids.map(k => walk(k, depth + 1));
    const x = (xs[0] + xs[xs.length - 1]) / 2;
    pos[id] = { x, y: depth * ROW, depth };
    return x;
  };
  walk(rootId, 0);
  return pos;
}
/* how many leaves are on screen decides how wide a sibling can be */
const ttLeafCount = (nodes, vis, expanded, allow) =>
  Math.max(1, vis.filter(id => !(expanded[id] ? (nodes[id].kids || []) : []).filter(k => !allow || allow[k]).length).length);

/* ── Vertical node — a column-shaped chip. Degrades: card → chip → icon-only as siblings crowd. ── */
function TTNodeV({ id, node, pos, col, mode, selected, risk, up, expanded, hasKids, kidCount, onSelect, onToggle }) {
  const ring = risk === "critical" ? "#E5484D" : node.knownIssue?.id ? TT_UP_HEX : risk === "watch" ? "#D9822B" : null;
  const thumb = mode === "card" ? 46 : mode === "chip" ? 40 : 36;
  const tap = e => { e.stopPropagation(); onSelect(id); if (hasKids && !expanded) onToggle(id); };
  return (
    <div onClick={tap} title={node.label} style={{ position:"absolute", left:pos.x, top:pos.y, width:col, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", touchAction:"pan-y" }}>
      <span style={{ position:"relative", width:thumb, height:thumb, flexShrink:0, borderRadius: mode === "icon" ? "50%" : 13, overflow:"hidden", background: node.img ? "#0d1017" : "var(--ki-page)", display:"grid", placeItems:"center",
        border:`${selected ? 2 : 1.5}px solid ${selected ? "var(--ink)" : ring || "var(--ki-line)"}`,
        boxShadow: selected ? "0 0 0 4px color-mix(in oklab, var(--ink) 14%, transparent)" : ring ? `0 0 10px color-mix(in oklab, ${ring} 45%, transparent)` : "var(--shadow-1)" }}>
        {node.img
          ? <img src={ttThumb(node.img)} alt="" draggable="false" style={{ width:"124%", height:"124%", objectFit:"contain", filter:"brightness(1.55) contrast(1.1)" }}/>
          : <Icon name="wrench" size={15} style={{ color:"var(--slate-400)" }}/>}
        {node.knownIssue?.id
          ? <span title="Known issue on record" style={{ position:"absolute", top:-5, right:-5, width:18, height:18, borderRadius:"50%", display:"grid", placeItems:"center", background:TT_UP_HEX, color:"white", border:"1.5px solid var(--ki-card)" }}><Icon name="shield-alert" size={10}/></span>
          : ring && (
            <span style={{ position:"absolute", top:-2, right:-2, width:9, height:9, borderRadius:"50%", background:ring, border:"1.5px solid var(--ki-card)" }}/>
          )}
      </span>
      {mode !== "icon" && (
        <span style={{ fontSize: mode === "card" ? 10 : 9, lineHeight:1.15, fontWeight:600, letterSpacing:"-0.01em", textAlign:"center", color:"var(--ink)", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", maxWidth:"100%" }}>{node.label}</span>
      )}
      {hasKids && (
        <button type="button" className="mono" aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`} onClick={e=>{ e.stopPropagation(); onToggle(id); }} style={{ minWidth:22, minHeight:20, fontSize:8.5, fontWeight:700, padding:"1px 5px", borderRadius:999, background:"var(--ki-page)", border:"1px solid var(--ki-line)", color:"var(--slate-500)", cursor:"pointer" }}>{expanded ? "−" : `+${kidCount}`}</button>
      )}
    </div>
  );
}

function TTNode({ id, node, pos, style, selected, risk, intent, expanded, hasKids, onSelect, onToggle, onContext, onDrag, zoom = 1, dense = false, width = TT_NODE_W }) {
  const sh = TT_SHAPES.find(s => s.id === style.shape) || TT_SHAPES[1];
  const col = TT_COLORS.find(c => c.id === style.color) || TT_COLORS[0];
  const flagged = intent === "issues" ? !!node.knownIssue?.id : intent === "maint" ? !!node.riskAt : false;
  const up = ttUpState(node);
  const ring = risk === "critical" ? "#E5484D" : node.knownIssue?.id ? TT_UP_HEX : risk === "watch" ? "#D9822B" : null;
  const down = e => {
    if (e.button === 2) return;
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, o = { ...pos };
    let moved = false;
    const mv = ev => { if (Math.abs(ev.clientX-sx) + Math.abs(ev.clientY-sy) > 3) moved = true; if (onDrag) onDrag(id, o.x + (ev.clientX-sx)/zoom, o.y + (ev.clientY-sy)/zoom); };
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); if (!moved) onSelect(id); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  return (
    <div onPointerDown={down} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContext(id, e.clientX, e.clientY); }}
      className={ring === "#E5484D" ? "tt-node tt-glow-crit" : ring ? "tt-node tt-glow-watch" : "tt-node"}
      style={{ position:"absolute", left:pos.x, top:pos.y, width, cursor: onDrag ? "grab" : "pointer", touchAction: onDrag ? "none" : "pan-y",
        display:"flex", alignItems:"center", gap: dense ? 8 : 10, padding: dense ? "6px 10px" : "9px 11px",
        background:"var(--ki-card)", color:"var(--ink)",
        border:`${selected ? 2 : 1.5}px solid ${selected ? col.hex : ring || "var(--ki-line)"}`,
        borderRadius: sh.radius, clipPath: sh.cut ? "polygon(11px 0,100% 0,100% calc(100% - 11px),calc(100% - 11px) 100%,0 100%,0 11px)" : "none",
        boxShadow: selected ? `0 0 0 4px color-mix(in oklab, ${col.hex} 18%, transparent), var(--shadow-2)` : "var(--shadow-1)",
        outline: flagged && !ring ? `2px dashed color-mix(in oklab, ${col.hex} 55%, transparent)` : "none", outlineOffset:2 }}>
      <span style={{ width: dense ? 30 : 38, height: dense ? 30 : 38, flexShrink:0, borderRadius: sh.id === "pill" ? "50%" : 9, overflow:"hidden", background: node.img ? "#0d1017" : "var(--ki-page)", border: node.img ? `1px solid ${col.hex === "var(--ink)" ? "var(--ki-line)" : col.hex}` : "1px dashed var(--ki-line)", color:"var(--slate-400)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {node.img
          ? <img src={ttThumb(node.img)} alt="" draggable="false" style={{ width:"126%", height:"126%", objectFit:"contain", filter:"brightness(1.55) contrast(1.1)" }}/>
          : <Icon name={node.icon || "settings"} size={16}/>}
      </span>
      <div style={{ minWidth:0, flex:1 }}>
        <div style={{ fontSize: dense ? 12 : 12.5, fontWeight:600, letterSpacing:"-0.01em", lineHeight:1.25, color: col.hex === "var(--ink)" ? "var(--ink)" : col.hex }}>{node.label}</div>
        {!dense && <div style={{ fontSize:10, color:"var(--slate-500)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>{node.sub}</div>}
      </div>
      {node.knownIssue?.id && (
        <span title="Known issue on record" style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0, padding:"3px 6px", borderRadius:999, background:"color-mix(in oklab, " + TT_UP_HEX + " 16%, transparent)", color:TT_UP_HEX, fontSize:9.5, fontWeight:700, letterSpacing:"0.04em" }}>
          <Icon name="shield-alert" size={9} stroke={2.2}/>ISSUE
        </span>
      )}
      {(up === "equipped" || (node.servicedAt != null && !risk)) && (
        <span title={node.servicedAt != null ? "Logged as done" : "Upgrade equipped"} style={{ display:"flex", alignItems:"center", flexShrink:0, width:16, height:16, borderRadius:999, background:"var(--ki-ok-bg)", color:"var(--ki-ok-ink)", justifyContent:"center" }}>
          <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1.6 5.2l2.2 2.2L8.4 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </span>
      )}
      {ring && !node.knownIssue?.id && (
        <span style={{ width:7, height:7, borderRadius:"50%", background:ring, flexShrink:0 }}/>
      )}
      {hasKids && <span role="button" tabIndex={0} aria-label={expanded ? "Collapse" : "Expand"} onPointerDown={e => { e.stopPropagation(); e.preventDefault(); }} onClick={e => { e.stopPropagation(); onToggle(id); }} style={{ flexShrink:0, width: dense ? 22 : 24, height: dense ? 22 : 24, borderRadius:7, background:"var(--ki-page)", border:"1px solid var(--ki-line)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)", fontSize:12, lineHeight:1, fontWeight:700, cursor:"pointer" }}>{expanded ? "−" : "+"}</span>}
    </div>
  );
}

/* ── Right-click styling menu ── */
function TTStyleMenu({ menu, style, onShape, onColor, onClose }) {
  if (!menu) return null;
  return (
    <div onPointerDown={e => e.stopPropagation()} style={{ position:"fixed", left:Math.min(menu.x, (typeof window==="undefined"?1200:window.innerWidth)-180), top:Math.min(menu.y, (typeof window==="undefined"?800:window.innerHeight)-150), zIndex:60, width:170, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:12, boxShadow:"var(--shadow-2)", padding:9 }}>
      <div className="eyebrow" style={{ fontSize:9.5, marginBottom:6 }}>Shape</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
        {TT_SHAPES.map(s => (
          <button key={s.id} onClick={()=>onShape(s.id)} title={s.label} style={{ height:26, cursor:"pointer", background: style.shape===s.id ? "var(--ink)" : "var(--ki-page)", border:`1px solid ${style.shape===s.id ? "var(--ink)" : "var(--ki-line)"}`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
            <span style={{ width:15, height:11, background: style.shape===s.id ? "var(--ki-page)" : "var(--slate-400)", borderRadius:s.radius===999?999:Math.min(s.radius,5), clipPath: s.cut ? "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" : "none" }}/>
          </button>
        ))}
      </div>
      <div className="eyebrow" style={{ fontSize:9.5, margin:"10px 0 6px" }}>Colour</div>
      <div style={{ display:"flex", gap:6 }}>
        {TT_COLORS.map(c => (
          <button key={c.id} onClick={()=>onColor(c.id)} title={c.label} style={{ width:22, height:22, borderRadius:"50%", cursor:"pointer", background:c.hex, border: style.color===c.id ? "2px solid var(--au7o-blue)" : "1px solid var(--ki-line)", boxShadow: style.color===c.id ? "0 0 0 2px var(--ki-card) inset" : "none", padding:0 }}/>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop:10, width:"100%", background:"transparent", border:"none", color:"var(--slate-500)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Close</button>
    </div>
  );
}

/* ── Detail drawer ── */
/* ── Service log row — "I did this" for anything with a mileage clock ── */
function TTServiceRow({ node, miles, dense }) {
  const live = useTwinLive();
  const ownerActions = useTwinOwnerActions();
  const [logging, setLogging] = React.useState(false);
  const hasMileageInterval = typeof node.serviceIntervalMiles === "number" && node.serviceIntervalMiles > 0;
  const hasTimeInterval = typeof node.serviceIntervalMonths === "number" && node.serviceIntervalMonths > 0;
  if (!node.maintenanceType) return null;
  const done = node.servicedAt != null;
  if (live) return (
    <div style={{ marginTop:12, padding: dense ? "10px 11px" : "11px 12px", borderRadius:12, background:"var(--ki-page)", border:"1px solid var(--ki-line)", fontSize:11, color:"var(--slate-500)", lineHeight:1.4 }}>
      {logging ? (
        <MaintenanceLogFlow
          vehicleId={ownerActions.vehicleId}
          currentMileage={miles}
          service={{ typeId:node.maintenanceType, label:node.serviceLabel || node.label, intervalMiles:hasMileageInterval?node.serviceIntervalMiles:null, intervalMonths:hasTimeInterval?node.serviceIntervalMonths:null }}
          accent="#2563EB"
          onLogged={ownerActions.refresh}
        />
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ minWidth:0, flex:1 }}>{done ? <>Last logged at <span className="mono">{node.servicedAt.toLocaleString()} mi</span>.</> : node.firstServiceDeadline && ((typeof node.dueMileage === "number" && miles > node.dueMileage) || node.overdueByDate === true) ? <>Required service is <strong style={{color:"var(--ki-crit)"}}>overdue</strong>{typeof node.dueMileage === "number" ? <> · first mileage deadline was <span className="mono">{node.dueMileage.toLocaleString()} mi</span>.</> : node.dueDate ? <> · first date deadline was <span className="mono">{new Date(node.dueDate).toLocaleDateString()}</span>.</> : "."}</> : node.firstServiceDeadline ? <>Not logged yet · first service {typeof node.dueMileage === "number" ? <>at <span className="mono">{node.dueMileage.toLocaleString()} mi</span></> : node.dueDate ? <>by <span className="mono">{new Date(node.dueDate).toLocaleDateString()}</span></> : <>every <span className="mono">{node.serviceIntervalMonths} months</span></>}.</> : !hasMileageInterval&&!hasTimeInterval ? <>Not logged yet · this is condition-based, so logging records the work without inventing a deadline.</> : <>Not logged yet · log service when performed to reset the {hasMileageInterval&&hasTimeInterval?"mileage and calendar":hasTimeInterval?"calendar":"mileage"} interval.</>}</div>
          <button type="button" onClick={()=>setLogging(true)} style={{ flexShrink:0, padding:"8px 12px", borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>{done ? "Log again" : "Log service"}</button>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ marginTop:12, padding: dense ? "10px 11px" : "11px 12px", borderRadius:12, background: done ? "var(--ki-ok-bg)" : "var(--ki-page)", border:`1px solid ${done ? "color-mix(in oklab, var(--ki-ok-ink) 26%, transparent)" : "var(--ki-line)"}` }}>
      {done ? (
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ display:"grid", placeItems:"center", width:18, height:18, borderRadius:999, background:"var(--ki-ok-ink)", color:"var(--ki-card)", flexShrink:0 }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.6 5.2l2.2 2.2L8.4 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          </span>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:"var(--ki-ok-ink)" }}>Done at <span className="mono">{node.servicedAt.toLocaleString()} mi</span></div>
            <div style={{ fontSize:10.5, color:"var(--slate-500)", marginTop:1 }}>{hasMileageInterval ? <>Next around <span className="mono">{ttNextDue(node).toLocaleString()} mi</span></> : hasTimeInterval ? <>The next date follows the documented calendar interval.</> : <>Condition-based item · no mileage deadline is invented.</>}</div>
          </div>
          <button onClick={()=>ttUndoDone(node)} style={{ flexShrink:0, background:"transparent", border:"none", color:"var(--slate-500)", fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, cursor:"pointer", padding:0 }}>Undo</button>
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ minWidth:0, flex:1, fontSize:11, color:"var(--slate-500)", lineHeight:1.4 }}>{hasMileageInterval||hasTimeInterval?"Already serviced this? Log it and Au7o resets the documented clock.":"Already inspected or serviced this? Log the work without inventing a deadline."}</div>
          <button onClick={()=>ttMarkDone(node, miles)} style={{ flexShrink:0, padding:"8px 12px", borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>Mark as done</button>
        </div>
      )}
    </div>
  );
}

function TTOwnerEvidence({ node, nodeId, dense, miles }) {
  const live = useTwinLive();
  const actions = useTwinOwnerActions();
  const [mode, setMode] = React.useState(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [part, setPart] = React.useState({ name:"", brand:"", partNumber:"", cost:"", lifespanMiles:"", installedAtMileage:String(Number.isFinite(miles)?miles:""), fitmentConfirmed:false });
  const [note, setNote] = React.useState("");
  if (!live || !actions) return null;
  const savePart = async (event) => {
    event.preventDefault();
    if (!part.name.trim() || !part.fitmentConfirmed) return;
    if (part.installedAtMileage !== "" && Number(part.installedAtMileage) > miles) { setError("Installed mileage cannot be greater than the current vehicle mileage."); return; }
    setPending(true); setError("");
    try {
      await actions.saveInstalledPart({ nodeId, part:{
        category:node.equipmentCategory || (String(node.label).toLowerCase().includes("tire") ? "tires" : "other"),
        name:part.name.trim(), brand:part.brand.trim() || null, partNumber:part.partNumber.trim() || null,
        cost:part.cost === "" ? null : Number(part.cost), lifespanMiles:part.lifespanMiles === "" ? null : Number(part.lifespanMiles), installedAtMileage:part.installedAtMileage === "" ? null : Number(part.installedAtMileage),
        description:`Installed equipment for ${node.label}`, fitmentConfirmed:part.fitmentConfirmed,
      }});
      setMode(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save installed part."); }
    finally { setPending(false); }
  };
  const saveNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setPending(true); setError("");
    try { await actions.annotateIssue({nodeId,note:note.trim()}); setMode(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save issue note."); }
    finally { setPending(false); }
  };
  const fieldStyle = {width:"100%",minWidth:0,minHeight:40,border:"1px solid var(--ki-line)",borderRadius:9,background:"var(--ki-card)",color:"var(--ink)",padding:"8px 10px",fontFamily:"var(--font-sans)",fontSize:12};
  const labelStyle = {display:"grid",gap:5,minWidth:0,fontSize:10.5,fontWeight:650,color:"var(--slate-600)"};
  const primaryStyle = {minHeight:40,padding:"0 14px",border:0,borderRadius:9,background:"#2563EB",color:"#fff",fontFamily:"var(--font-sans)",fontSize:12,fontWeight:650,cursor:"pointer"};
  const secondaryStyle = {minHeight:40,padding:"0 14px",border:"1px solid var(--ki-line)",borderRadius:9,background:"var(--ki-card)",color:"var(--ink)",fontFamily:"var(--font-sans)",fontSize:12,fontWeight:650,cursor:"pointer"};
  return <div id={`owner-${nodeId}`} style={{marginTop:12,padding:dense?"12px":"13px",borderRadius:12,background:"var(--ki-page)",border:"1px solid var(--ki-line)"}}>
    {Array.isArray(node.installedParts) && node.installedParts.map((installed,index)=><div key={`${installed.partNumber||installed.name}-${index}`} style={{fontSize:11.5,lineHeight:1.45,marginBottom:6}}><strong>Installed:</strong> {installed.brand ? `${installed.brand} ` : ""}{installed.name}{installed.partNumber ? ` · ${installed.partNumber}` : ""}{Number.isFinite(installed.cost) ? ` · $${installed.cost.toFixed(2)}` : ""}{Number.isFinite(installed.installedAtMileage) ? ` · at ${installed.installedAtMileage.toLocaleString()} mi` : ""}{Number.isFinite(installed.lifespanMiles) ? ` · ${installed.lifespanMiles.toLocaleString()} mi expected life` : ""}</div>)}
    {Array.isArray(node.userIssueNotes) && node.userIssueNotes.map((entry,index)=><div key={index} style={{fontSize:11.5,lineHeight:1.45,color:TT_UP_HEX,marginBottom:6}}><Icon name="shield-alert" size={11}/> {entry}</div>)}
    {!mode && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(138px,1fr))",gap:8}}><button type="button" onClick={()=>setMode("part")} style={{...secondaryStyle,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon name="settings" size={13}/>Change installed part</button><button type="button" onClick={()=>setMode("issue")} style={{...secondaryStyle,display:"flex",alignItems:"center",justifyContent:"center",gap:7,color:TT_UP_HEX,borderColor:"rgba(167,139,250,.4)",background:"rgba(139,92,246,.07)"}}><Icon name="shield-alert" size={13}/>I have an issue</button></div>}
    {mode==="part" && <form onSubmit={savePart} style={{display:"grid",gap:12,minWidth:0}}>
      <div style={{paddingBottom:9,borderBottom:"1px solid var(--ki-line)"}}><div style={{fontSize:13,fontWeight:700}}>Installed part details</div><div style={{marginTop:2,fontSize:10.5,lineHeight:1.4,color:"var(--slate-500)"}}>Record the exact item fitted to this vehicle.</div></div>
      <label style={labelStyle}>Part or tire name<input required style={fieldStyle} placeholder="e.g. Michelin Pilot Sport 4S" value={part.name} onChange={e=>setPart({...part,name:e.target.value})}/></label>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}><label style={labelStyle}>Brand<input style={fieldStyle} placeholder="Manufacturer" value={part.brand} onChange={e=>setPart({...part,brand:e.target.value})}/></label><label style={labelStyle}>Part number<input style={fieldStyle} placeholder="Exact number" value={part.partNumber} onChange={e=>setPart({...part,partNumber:e.target.value})}/></label></div>
      <div style={{paddingTop:2,borderTop:"1px solid var(--ki-line)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(118px,1fr))",gap:10}}><label style={{...labelStyle,marginTop:9}}>Price paid<input style={fieldStyle} type="number" min="0" step="0.01" placeholder="$0.00" value={part.cost} onChange={e=>setPart({...part,cost:e.target.value})}/></label><label style={{...labelStyle,marginTop:9}}>Expected life (mi)<input style={fieldStyle} type="number" min="1" placeholder="Mileage" value={part.lifespanMiles} onChange={e=>setPart({...part,lifespanMiles:e.target.value})}/></label><label style={{...labelStyle,marginTop:9}}>Installed at (mi)<input style={fieldStyle} type="number" min="0" max={Number.isFinite(miles)?miles:undefined} placeholder="Odometer" value={part.installedAtMileage} onChange={e=>setPart({...part,installedAtMileage:e.target.value})}/></label></div>
      <label style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 10px",borderRadius:9,background:"var(--ki-card)",border:"1px solid var(--ki-line)",fontSize:10.5,lineHeight:1.4,color:"var(--slate-600)"}}><input required type="checkbox" style={{marginTop:2,flexShrink:0}} checked={part.fitmentConfirmed} onChange={e=>setPart({...part,fitmentConfirmed:e.target.checked})}/> I confirm this is the part currently fitted to this vehicle.</label>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" onClick={()=>setMode(null)} style={secondaryStyle}>Cancel</button><button disabled={pending || !part.fitmentConfirmed} type="submit" style={{...primaryStyle,opacity:pending || !part.fitmentConfirmed ? .65 : 1}}>{pending?"Saving…":"Save installed part"}</button></div>
    </form>}
    {mode==="issue" && <form onSubmit={saveNote} style={{display:"grid",gap:10}}><label style={labelStyle}>What are you noticing?<textarea required rows={4} style={{...fieldStyle,resize:"vertical",lineHeight:1.45}} placeholder={`Describe what happens with ${node.label}, and when.`} value={note} onChange={e=>setNote(e.target.value)}/></label><div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" onClick={()=>setMode(null)} style={secondaryStyle}>Cancel</button><button disabled={pending} type="submit" style={primaryStyle}>{pending?"Saving…":"Add issue note"}</button></div></form>}
    {error && <div role="alert" style={{marginTop:7,color:"var(--ki-crit)",fontSize:10.5}}>{error}</div>}
  </div>;
}

function TTFactValue({ label, value, node }) {
  const wrapStyle = {minWidth:0,overflowWrap:"anywhere",wordBreak:"break-word"};
  if (label === "Part number" && node.buyUrl && value && value !== "—") return <a className="mono" href={node.buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={{...wrapStyle,fontSize:12.5,lineHeight:1.45,color:"#2563EB",textDecoration:"underline",textUnderlineOffset:2,fontWeight:650}}>{value}</a>;
  return <span className={label === "Part number" ? "mono" : ""} style={{...wrapStyle,fontSize:12.5,lineHeight:1.45,fontWeight:label === "Part number" ? 600 : 400}}>{value}</span>;
}

/* ── Finish picker — changing it repaints the wheels on the car photo, not just this card ── */
function TTFinishRow({ dense }) {
  const live = useTwinLive();
  const cur = ttFinish();
  if (live) return (
    <div style={{ marginTop:12, padding: dense ? "10px 11px" : "11px 12px", borderRadius:12, background:"var(--ki-page)", border:"1px solid var(--ki-line)", fontSize:11, color:"var(--slate-500)", lineHeight:1.4 }}>
      Wheel finishes are a visual preview until a saved modification is added to this vehicle.
    </div>
  );
  return (
    <div style={{ marginTop:12, padding: dense ? "10px 11px" : "11px 12px", borderRadius:12, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>
      <div className="eyebrow" style={{ fontSize:9.5 }}>Finish</div>
      <div style={{ display:"flex", gap:7, marginTop:8, flexWrap:"wrap" }}>
        {TT_FINISHES.map(f => (
          <button key={f.id} onClick={()=>TT_EQUIP.setFinish(f.id)} title={f.label} aria-label={f.label} aria-pressed={cur.id===f.id}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 9px 5px 6px", borderRadius:999, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600,
              background: cur.id===f.id ? "var(--ki-card)" : "transparent", color: cur.id===f.id ? "var(--ink)" : "var(--slate-500)",
              border:`1.5px solid ${cur.id===f.id ? "var(--ink)" : "var(--ki-line)"}` }}>
            <span style={{ width:16, height:16, borderRadius:"50%", background:f.swatch, border:"1px solid rgba(0,0,0,.25)", flexShrink:0 }}/>{f.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize:10.5, color:"var(--slate-500)", marginTop:8, lineHeight:1.4 }}>{cur.id === "oem" ? "What's on the car today. Pick another and it changes on the photo above." : `${cur.price} · fitted on the car above.`}</div>
    </div>
  );
}

/* ── Upgrade card — the known issue's fix, one tap from equipped ── */
function TTUpgradeCard({ node, nodeId, onEquip, dense }) {
  const live = useTwinLive();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [recorded, setRecorded] = React.useState(false);
  const state = ttUpState(node);
  const fit = node && node.fitFor;
  if (!state && !fit) return null;
  const on = recorded || (fit ? !!node.fitted : state === "equipped");
  const target = fit ? node.fitFor : nodeId;
  const val = fit ? (on ? !node.fitWhen : !!node.fitWhen) : !on;
  const persist = async () => {
    if (!onEquip || pending || on) return;
    setPending(true); setError("");
    try {
      const saved = await onEquip(target, val, node.upgrade);
      if (saved !== false) setRecorded(true);
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this fitted part."); }
    finally { setPending(false); }
  };
  if (fit && !node.upgrade) return (
    <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:9, padding:"10px 12px", borderRadius:12, background: on ? "var(--ki-ok-bg)" : "var(--ki-page)", border:`1px solid ${on ? "color-mix(in oklab, var(--ki-ok-ink) 28%, transparent)" : "var(--ki-line)"}` }}>
      <span style={{ minWidth:0, flex:1, fontSize:11.5, fontWeight:600, color: on ? "var(--ki-ok-ink)" : "var(--slate-700)" }}>{on ? "Fitted on your car" : "Not what's on your car"}</span>
      {!live && !on && <button onClick={()=>onEquip && onEquip(target, val)} style={{ flexShrink:0, padding:"7px 11px", borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600, cursor:"pointer" }}>This one is fitted</button>}
      {live && <span style={{ flexShrink:0, fontSize:10.5, color:"var(--slate-500)" }}>Not confirmed</span>}
    </div>
  );
  const u = node.upgrade;
  return (
    <div style={{ marginTop:12, borderRadius:13, overflow:"hidden", border:`1px solid ${on ? "color-mix(in oklab, var(--ki-ok-ink) 30%, transparent)" : "color-mix(in oklab, " + TT_UP_HEX + " 38%, transparent)"}`, background: on ? "var(--ki-ok-bg)" : "color-mix(in oklab, " + TT_UP_HEX + " 7%, var(--ki-card))" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", background: on ? "transparent" : "color-mix(in oklab, " + TT_UP_HEX + " 13%, transparent)" }}>
        <span className="eyebrow" style={{ fontSize:9.5, color: on ? "var(--ki-ok-ink)" : TT_UP_HEX }}>{on ? "Equipped on your car" : fit ? "Upgrade — not fitted yet" : "Upgrade available"}</span>
        <span className="mono" style={{ marginLeft:"auto", fontSize:9.5, fontWeight:700, color: on ? "var(--ki-ok-ink)" : TT_UP_HEX }}>{u.gain}</span>
      </div>
      <div style={{ display:"flex", gap:10, padding:"10px 11px 0" }}>
        <span style={{ width: dense ? 48 : 58, height: dense ? 48 : 58, flexShrink:0, borderRadius:10, background:"#0d1017", border:"1px solid var(--ki-line)", display:"grid", placeItems:"center", overflow:"hidden", padding:4 }}>
          <img src={u.img} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", filter:"brightness(1.35)" }}/>
        </span>
        <span style={{ minWidth:0, flex:1 }}>
          <span style={{ display:"block", fontSize:12.5, fontWeight:600, letterSpacing:"-0.01em" }}>{u.label}</span>
          <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)", marginTop:1 }}>{u.tag} · <span className="mono">{u.price}</span></span>
          <span style={{ display:"block", fontSize:11.5, lineHeight:1.45, marginTop:5, textWrap:"pretty" }}>{u.fixes}</span>
        </span>
      </div>
      <div style={{ padding:"9px 11px 11px" }}>
        <div style={{ fontSize:10.5, color:"var(--slate-500)", lineHeight:1.45, marginBottom:9 }}>{u.confidence} · {u.fit}</div>
        {u.buyUrl && !on && <a href={u.buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ width:"100%", minHeight:38, marginBottom:8, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--ki-card)", color:"#2563EB", border:"1px solid color-mix(in oklab, #2563EB 35%, var(--ki-line))", fontSize:11.5, fontWeight:650, textDecoration:"none" }}>Order this upgrade</a>}
        {!live && <button onClick={()=>onEquip && onEquip(target, val)} style={{ width:"100%", minHeight:38, borderRadius:10, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
          background: on ? "var(--ki-card)" : TT_UP_HEX, color: on ? "var(--slate-700)" : "#fff", border: on ? "1px solid var(--ki-line)" : "none" }}>
          {on ? "Swap back to the OEM radiator" : <React.Fragment><svg width="12" height="12" viewBox="0 0 10 10"><path d="M5 8.5V1.8M5 1.8L2 4.8M5 1.8l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none"/></svg>I have this — equip it</React.Fragment>}
        </button>}
        {live && (on ? <div style={{ width:"100%", minHeight:38, borderRadius:10, display:"grid", placeItems:"center", background:"var(--ki-ok-bg)", border:"1px solid var(--ki-line)", color:"var(--ki-ok-ink)", fontSize:11.5, fontWeight:600 }}>Recorded as fitted on this vehicle</div> : <button type="button" onClick={persist} disabled={pending || !onEquip} style={{ width:"100%", minHeight:38, borderRadius:10, border:0, background:TT_UP_HEX, color:"#fff", fontSize:11.5, fontWeight:600, cursor:pending ? "wait" : "pointer", opacity:pending || !onEquip ? .65 : 1 }}>{pending ? "Saving…" : "I have this — record it as fitted"}</button>)}
        {error && <div role="alert" style={{ marginTop:7, color:"var(--ki-crit)", fontSize:10.5 }}>{error}</div>}
      </div>
    </div>
  );
}

function TTDetail({ node, nodeId, onEquip, risk, miles, onClose, onAsk, sheet, narrow }) {
  const vehicle = useTwinVehicle();
  const [partHelp, setPartHelp] = React.useState("");
  React.useEffect(()=>setPartHelp(""),[nodeId]);
  if (!node) return null;
  const isDemoUnsourced = node.partNo === "Not sourced for this demo";
  const hasQuotedPrice = !isDemoUnsourced && node.price && node.price !== "—";
  const canBuy = !isDemoUnsourced && Boolean(node.buyUrl);
  const rows = [["Part number", node.partNo], ["Price", isDemoUnsourced ? node.price : null], ["Part", node.brand], ["Where to find it", node.where], ["Spec", node.spec], ["Service life", node.life]].filter(r => r[1]);
  const canAsk = Boolean(node.maintenanceType || node.partNo || node.spec || node.knownIssue?.id || node.installedParts?.length);
  const askPart = () => {
    const context = buildPartHelpContext(node, vehicle);
    setPartHelp(onAsk ? "Question loaded in the hub chat for you to review." : context);
    onAsk?.(node, context);
  };
  if (sheet) return (
    <div style={{ position:"absolute", inset:0, zIndex:20, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(11,18,32,.42)" }}/>
      <div className="tt-rise" style={{ position:"relative", maxHeight:"78%", margin:"0 10px 10px", background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:22, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 -18px 44px rgba(11,18,32,.26)" }}>
        <div style={{ flexShrink:0, display:"grid", placeItems:"center", padding:"9px 0 3px" }}><span style={{ width:38, height:4, borderRadius:999, background:"var(--ki-line)" }}/></div>
        <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>
          {node.img && (
            <div style={{ margin:"4px 14px 0", height:118, background:"#0d1017", borderRadius:16, border:"1px solid var(--ki-line)", display:"grid", placeItems:"center", overflow:"hidden", padding:14 }}>
              <img src={node.img} alt="" style={{ width:"100%", height:"100%", minWidth:0, minHeight:0, objectFit:"contain", filter:"brightness(1.45)" }}/>
            </div>
          )}
          <div style={{ padding:"13px 16px 12px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:17.5, fontWeight:600, letterSpacing:"-0.02em" }}>{node.label}</div>
                <div style={{ fontSize:12.5, color:"var(--slate-500)", marginTop:2 }}>{node.sub}</div>
              </div>
              {risk && <span className="mono" style={{ flexShrink:0, fontSize:10, fontWeight:700, padding:"4px 9px", borderRadius:999, background: risk==="critical" ? "var(--ki-crit-bg)" : "var(--ki-mod-bg)", color: risk==="critical" ? "var(--ki-crit)" : "var(--ki-mod-ink)" }}>{ttRiskLabel(node, miles, risk)}</span>}
            </div>
            {isDemoUnsourced && <div style={{ marginTop:12 }}><FitmentBadge node={node}/></div>}
            {hasQuotedPrice && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"stretch", gap:8, marginTop:12, padding:"11px 12px", borderRadius:12, background:"var(--ki-page)", border:"1px solid var(--ki-line)", minWidth:0 }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div className="mono" style={{ fontSize:15.5, fontWeight:600, overflowWrap:"anywhere" }}>{node.price}</div>
                  {node.stock && <div style={{ fontSize:10.5, color:"var(--slate-500)", marginTop:3, lineHeight:1.4, overflowWrap:"anywhere" }}>{node.stock}</div>}
                </div>
                <span style={{alignSelf:"flex-start",maxWidth:"100%"}}><FitmentBadge node={node}/></span>
              </div>
            )}
            {canBuy && (
              <a href={node.buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ marginTop:10, minHeight:44, borderRadius:12, background:"#2563EB", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:650, textDecoration:"none" }}>
                {node.buyLabel || "Order this part"}
              </a>
            )}
            <div style={{ marginTop:13, display:"flex", flexDirection:"column", gap:9 }}>
              {rows.map(([k,v]) => (
                <div key={k} style={{ display:"grid", gridTemplateColumns:"minmax(70px,86px) minmax(0,1fr)", gap:11, alignItems:"flex-start" }}>
                  <span style={{ minWidth:0, fontSize:10, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--slate-500)", paddingTop:2, overflowWrap:"anywhere" }}>{k}</span>
                  <TTFactValue label={k} value={v} node={node}/>
                </div>
              ))}
            </div>
            {node.sourceUrl && <a href={node.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",maxWidth:"100%",marginTop:10,color:"#2563EB",fontSize:11.5,fontWeight:650,textDecoration:"underline",textUnderlineOffset:2,overflowWrap:"anywhere",wordBreak:"break-word"}}>Service source: {node.sourceLabel || "manufacturer documentation"}</a>}
            {node.dueNote && (
              <div style={{ marginTop:13, display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:12, background: risk === "critical" ? "var(--ki-crit-bg)" : risk === "watch" ? "var(--ki-mod-bg)" : "var(--ki-page)", color: risk === "critical" ? "var(--ki-crit)" : risk === "watch" ? "var(--ki-mod-ink)" : "var(--slate-600)", fontSize:12, fontWeight:600 }}>
                <Icon name={risk ? "alert" : "clock"} size={12} stroke={2.2}/>{node.dueNote}
              </div>
            )}
            <TTKnownIssueCard node={node} dense/>
            {node.resolved && (node.upgraded || node.fitted) && (
              <div style={{ marginTop:13, padding:"11px 12px", borderRadius:12, background:"var(--ki-ok-bg)" }}>
                <div className="eyebrow" style={{ fontSize:9.5, color:"var(--ki-ok-ink)" }}>Known issue resolved</div>
                <div style={{ fontSize:12.5, lineHeight:1.5, marginTop:5, textWrap:"pretty" }}>{node.resolved}</div>
              </div>
            )}
            {node.finishes && <TTFinishRow dense/>}
            <TTUpgradeCard node={node} nodeId={nodeId} onEquip={onEquip} dense/>
            <TTServiceRow node={node} miles={miles} dense/>
            <TTOwnerEvidence node={node} nodeId={nodeId} dense miles={miles}/>
            {node.alt && (
              <div style={{ marginTop:9, padding:"11px 12px", borderRadius:12, background:"var(--ki-ok-bg)" }}>
                <div className="eyebrow" style={{ fontSize:9.5, color:"var(--ki-ok-ink)" }}>Aftermarket that fits</div>
                <div style={{ fontSize:12.5, lineHeight:1.5, marginTop:5, fontWeight:500 }}>{node.alt}</div>
              </div>
            )}
            {partHelp && <div role="status" style={{marginTop:12,padding:"10px 11px",borderRadius:10,border:"1px solid color-mix(in oklab, var(--au7o-blue) 30%, var(--ki-line))",background:"color-mix(in oklab, var(--au7o-blue) 7%, var(--ki-card))",fontSize:11.5,lineHeight:1.5,color:"var(--slate-700)"}}>{partHelp}</div>}
          </div>
        </div>
        <div style={{ flexShrink:0, borderTop:"1px solid var(--ki-line)", padding:"11px 14px 13px", display:"flex", gap:8, flexWrap:"wrap" }}>
          {canAsk&&<button type="button" onClick={askPart} style={{ flex:"1 1 165px", minHeight:46, background:"#2563EB", border:0, borderRadius:12, fontSize:12.5, fontWeight:650, cursor:"pointer", fontFamily:"var(--font-sans)", color:"#fff" }}>Ask Au7o about this part</button>}
          <button onClick={onClose} style={{ flex:"1 1 90px", minHeight:46, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)", color:"var(--ink)" }}>Close</button>
        </div>
      </div>
    </div>
  );
  return (
    <aside style={{ width: narrow ? 262 : 308, flex: narrow ? "0 0 262px" : "0 0 308px", borderLeft:"1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", flexDirection:"column", minHeight:0 }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--ki-line)", display:"flex", alignItems:"center", gap:9, background:"var(--ki-band)" }}>
        <span className="eyebrow" style={{ fontSize:10, color:"var(--ki-band-ink)" }}>Part detail</span>
        <button onClick={onClose} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", display:"flex", padding:2 }}><Icon name="x" size={14}/></button>
      </div>
      <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>
        <div style={{ height:132, background: node.img ? "#0d1017" : "var(--ki-page)", borderBottom: node.img ? "none" : "1px dashed var(--ki-line)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7, color:"var(--slate-400)" }}>
          {node.img
            ? <img src={node.img} alt="" style={{ width:"82%", height:"82%", objectFit:"contain", filter:"brightness(1.45)" }}/>
            : <React.Fragment><Icon name={node.icon || "settings"} size={26}/><span style={{ fontSize:10.5 }}>Part photo not loaded yet</span></React.Fragment>}
        </div>
        <div style={{ padding:"13px 15px" }}>
          <div style={{ fontSize:16.5, fontWeight:600, letterSpacing:"-0.02em" }}>{node.label}</div>
          <div style={{ fontSize:12, color:"var(--slate-500)", marginTop:2 }}>{node.sub}</div>
          {risk && <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:9, background: risk==="critical" ? "var(--ki-crit-bg)" : "var(--ki-mod-bg)", color: risk==="critical" ? "var(--ki-crit)" : "var(--ki-mod-ink)", fontSize:11.5, fontWeight:600 }}>
            <Icon name="alert" size={12} stroke={2.2}/>{ttRiskLabel(node, miles, risk)}
          </div>}
          {isDemoUnsourced && <div style={{ marginTop:12 }}><FitmentBadge node={node}/></div>}
          {hasQuotedPrice && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", alignItems:"stretch", gap:8, padding:"10px 12px", borderRadius:11, background:"var(--ki-page)", border:"1px solid var(--ki-line)", minWidth:0 }}>
              <div style={{ minWidth:0, flex:1 }}>
                <div className="mono" style={{ fontSize:14.5, fontWeight:600, overflowWrap:"anywhere" }}>{node.price}</div>
                {node.stock && <div style={{ fontSize:10.5, color:"var(--slate-500)", marginTop:1, lineHeight:1.4, overflowWrap:"anywhere" }}>{node.stock}</div>}
              </div>
              <span style={{alignSelf:"flex-start",maxWidth:"100%"}}><FitmentBadge node={node}/></span>
            </div>
          )}
          {canBuy && (
            <a href={node.buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ marginTop:10, minHeight:42, borderRadius:11, background:"#2563EB", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12.5, fontWeight:650, textDecoration:"none" }}>
              {node.buyLabel || "Order this part"}
            </a>
          )}
          <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:9 }}>
            {rows.map(([k,v]) => (
              <div key={k} style={{ display:"grid", gridTemplateColumns:"minmax(72px,96px) minmax(0,1fr)", gap:10, alignItems:"flex-start" }}>
                <span style={{ minWidth:0, fontSize:10.5, color:"var(--slate-500)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600, paddingTop:1, overflowWrap:"anywhere" }}>{k}</span>
                <TTFactValue label={k} value={v} node={node}/>
              </div>
            ))}
          </div>
          {node.sourceUrl && <a href={node.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",maxWidth:"100%",marginTop:10,color:"#2563EB",fontSize:11.5,fontWeight:650,textDecoration:"underline",textUnderlineOffset:2,overflowWrap:"anywhere",wordBreak:"break-word"}}>Service source: {node.sourceLabel || "manufacturer documentation"}</a>}
          {node.dueNote && (
            <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"9px 11px", borderRadius:10, background: risk === "critical" ? "var(--ki-crit-bg)" : risk === "watch" ? "var(--ki-mod-bg)" : "var(--ki-page)", color: risk === "critical" ? "var(--ki-crit)" : risk === "watch" ? "var(--ki-mod-ink)" : "var(--slate-600)", fontSize:11.5, fontWeight:600 }}>
              <Icon name={risk ? "alert" : "clock"} size={12} stroke={2.2}/>{node.dueNote}
            </div>
          )}
          <TTKnownIssueCard node={node}/>
          {node.resolved && (node.upgraded || node.fitted) && (
            <div style={{ marginTop:14, padding:"11px 12px", borderRadius:11, background:"var(--ki-ok-bg)" }}>
              <div className="eyebrow" style={{ fontSize:9.5, color:"var(--ki-ok-ink)" }}>Known issue resolved</div>
              <div style={{ fontSize:12, lineHeight:1.5, marginTop:5, textWrap:"pretty" }}>{node.resolved}</div>
            </div>
          )}
          {node.finishes && <TTFinishRow/>}
          <TTUpgradeCard node={node} nodeId={nodeId} onEquip={onEquip}/>
          <TTServiceRow node={node} miles={miles}/>
          <TTOwnerEvidence node={node} nodeId={nodeId} miles={miles}/>
          {node.alt && (
            <div style={{ marginTop:10, padding:"11px 12px", borderRadius:11, background:"var(--ki-ok-bg)" }}>
              <div className="eyebrow" style={{ fontSize:9.5, color:"var(--ki-ok-ink)" }}>Aftermarket that fits</div>
              <div style={{ fontSize:12, lineHeight:1.5, marginTop:5, fontWeight:500 }}>{node.alt}</div>
            </div>
          )}
          {partHelp && <div role="status" style={{marginTop:12,padding:"10px 11px",borderRadius:10,border:"1px solid color-mix(in oklab, var(--au7o-blue) 30%, var(--ki-line))",background:"color-mix(in oklab, var(--au7o-blue) 7%, var(--ki-card))",fontSize:11.5,lineHeight:1.5,color:"var(--slate-700)"}}>{partHelp}</div>}
        </div>
      </div>
      <div style={{ borderTop:"1px solid var(--ki-line)", padding:"10px 14px", display:"flex", gap:7 }}>
        {canAsk&&<button type="button" onClick={askPart} style={{flex:1,minHeight:38,border:0,borderRadius:10,background:"#2563EB",color:"#fff",fontSize:11.5,fontWeight:650,cursor:"pointer"}}>Ask Au7o about this part</button>}
      </div>
    </aside>
  );
}

/* ── Ask Au7o, inside the tree — the same thread as the hub composer ── */
function ttParents(nodes) {
  const p = {};
  Object.keys(nodes).forEach(id => (nodes[id].kids || []).forEach(k => p[k] = id));
  return p;
}

const TT_SUGGEST = ["Show everything due on the car", "Which of these actually fails?", "Cheaper than OEM?", "Back out to the car"];

function TTComposer({ value, setValue, onSend, reply, suggestions }) {
  return (
    <div style={{ flex:"0 0 auto", borderTop:"1px solid var(--ki-line)", background:"var(--ki-card)", padding:"10px 16px 12px" }}>
      {reply && (
        <div key={reply.key} className="hl-bubble" style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:9 }}>
          <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width:19, height:19, flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12.5, lineHeight:1.45, textWrap:"pretty" }}>{reply.text}</div>
        </div>
      )}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        {suggestions.map(s => (
          <button key={s} onClick={()=>onSend(s)} className="chip chip-sm" style={{ border:"1px solid var(--ki-line)" }}>{s}</button>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); onSend(value); }} style={{ display:"flex", alignItems:"center", gap:9, background:"var(--ki-page)", border:"1px solid var(--ki-line)", borderRadius:13, padding:"8px 9px 8px 14px" }}>
        <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Ask about any part in this tree — I'll move it, filter it, or explain it"
          style={{ flex:1, minWidth:0, background:"transparent", border:"none", outline:"none", fontSize:13, color:"var(--ink)", fontFamily:"var(--font-sans)" }}/>
        <button type="button" className="chip chip-sm" style={{ border:"1px solid var(--ki-line)" }}><Icon name="camera" size={12}/></button>
        <button type="button" className="chip chip-sm" style={{ border:"1px solid var(--ki-line)" }}><Icon name="mic" size={12}/></button>
        <button type="submit" aria-label="Send" style={{ background:"#3B82F6", border:"none", color:"#F0F4FA", width:30, height:30, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="send" size={13}/></button>
      </form>
    </div>
  );
}

/* ── The canvas ── */
const TT_INTENTS = [
  { id:"issues", label:"Known issues", line:"Opened the explicit known-issue records for this selected vehicle." },
  { id:"maint",  label:"Maintenance due", line:"Backed out to the whole car and opened the tracked maintenance items for this odometer." },
  { id:"risk",   label:"Mileage risk", line:"Whole car. Red is due or past due at the current odometer; amber is inside 20% of its window." },
];

function ttMatchesIntent(node, intentId, miles) {
  if (intentId === "issues") return !!node.knownIssue?.id;
  if (intentId === "maint") return !!node.riskAt || !!node.unlogged || typeof node.dueMileage === "number" || !!node.dueDate;
  return !!ttRisk(node, miles);
}

/**
 * The assistant's answer for a part.
 *
 * Must be built from the VIEW node (the one ttViewNodes returns), so that after
 * an upgrade is equipped it describes the part actually on the car. It also
 * states the fitted part by name — saying "here's the radiator job" right after
 * someone equipped an aftermarket unit reads as if the swap never registered.
 */
function ttAskLine(n, tail = "") {
  const facts = [n.where && String(n.where).toLowerCase(), n.spec, n.life].filter(Boolean);
  const base = facts.length ? `Here's the ${String(n.label || "selected part").toLowerCase()} — ${facts.join(". ")}.` : `Details for ${n.label || "this selected node"} are unavailable in this mapped tree.`;
  const fitted = (n.upgraded || n.fitted) && n.brand
    ? ` You have the ${n.brand} fitted${n.resolved ? ` — ${n.resolved.charAt(0).toLowerCase()}${n.resolved.slice(1)}` : ""}`
    : "";
  return base + fitted + tail;
}

export function buildPartHelpContext(node, vehicle) {
  const identity = [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.trim].filter(Boolean).join(" ") || "selected vehicle";
  const installed = Array.isArray(node?.installedParts) && node.installedParts.length
    ? ` Installed configuration: ${node.installedParts.map((part) => [part.brand, part.name, part.partNumber].filter(Boolean).join(" ")).filter(Boolean).join("; ")}.`
    : (node?.brand ? ` Mapped part: ${node.brand}${node.partNo && node.partNo !== "—" ? ` (${node.partNo})` : ""}.` : "");
  return `${identity} context loaded. ${ttAskLine(node)}${installed} Reviewed specifications and links in this card remain the source of truth; unresolved fitment must be confirmed before ordering.`;
}

export function resolveAvailableTwinBranch(branch, trees) {
  if (branch && trees?.[branch]) return branch;
  if (trees?.car) return "car";
  return Object.keys(trees || {})[0] || null;
}

function TechTree({ branch, setBranch, miles, onClose, say, onPartHelp, startNode, compact = false, detailMode = null, vertical = false }) {
  const sheetDetail = detailMode ? detailMode === "sheet" : compact;
  const [demoEquipped, setEquipped] = useEquipped();
  const ownerEquipped = useTwinEquipment();
  const ownerActions = useTwinOwnerActions();
  const live = useTwinLive();
  const equipped = live ? ownerEquipped : demoEquipped;
  /* Demo tree set unless a live hub supplied the owner's. */
  const trees = useTwinTrees(TT_TREES);
  const activeBranch = resolveAvailableTwinBranch(branch, trees);
  const vehicle = useTwinVehicle();
  const twinMode = useTwinMode();
  const carLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? " " + vehicle.trim : ""}`;
  const tree = React.useMemo(() => { const t = trees[activeBranch]; const n = ttViewNodes(t.nodes, equipped, live ? TT_FINISHES[0] : null); return n === t.nodes ? t : { ...t, nodes:n }; }, [trees, activeBranch, equipped, live]);
  const persistEquipment = React.useCallback((nodeId, on, upgrade) => {
    if (!live) return setEquipped(nodeId, on);
    if (!on || !upgrade) return Promise.resolve(false);
    return ownerActions?.installUpgrade({ nodeId, upgrade });
  }, [live, ownerActions, setEquipped]);
  const [selected, setSelected] = React.useState(null);
  const [intent, setIntent] = React.useState(null);
  const [menu, setMenu] = React.useState(null);
  const [offsets, setOffsets] = React.useState({});
  const [pan, setPan] = React.useState({ x:56, y:40 });
  const [styles, setStyles] = React.useState(() => { if (typeof window === "undefined") return {}; try { return JSON.parse(localStorage.getItem("au7o-tt-styles") || "{}"); } catch(e) { return {}; } });
  const [expanded, setExpanded] = React.useState(() => ({ [tree.root]: true }));
  const [draft, setDraft] = React.useState("");
  const [reply, setReply] = React.useState(null);
  const [pending, setPending] = React.useState(null);
  const [allow, setAllow] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [tall, setTall] = React.useState(false);
  const [vw, setVw] = React.useState(320);
  const [autoV, setAutoV] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const vert = vertical || autoV;
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const on = () => setTick(t => t + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  React.useEffect(() => {
    if (activeBranch !== branch) setBranch(activeBranch);
  }, [activeBranch, branch, setBranch]);
  React.useEffect(() => {
    setExpanded({ [tree.root]: true }); setSelected(null); setIntent(null); setAllow(null); setMenu(null); setOffsets({}); setPan({ x:56, y:40 });
  }, [activeBranch, tree.root, ownerActions?.vehicleId]);
  React.useEffect(() => { try { localStorage.setItem("au7o-tt-styles", JSON.stringify(styles)); } catch(e) {} }, [styles]);

  /* a hotspot can point at a node, not just a branch — open its path and select it */
  React.useEffect(() => {
    if (!startNode || !tree.nodes[startNode]) return;
    const parents = ttParents(tree.nodes);
    const next = { [tree.root]: true, [startNode]: true };
    let c = startNode;
    while (parents[c]) { next[parents[c]] = true; c = parents[c]; }
    setExpanded(next);
    setSelected(startNode);
    setAllow(null);
    setIntent(null);
  }, [activeBranch, startNode, tree.root]);

  const styleOf = id => styles[id] || { shape:"rounded", color:"ink" };
  const vis0 = ttVisible(tree.nodes, tree.root, expanded, allow);
  const dense = compact || vis0.length > 9;
  const PAD = vert ? 10 : 28;
  const rowH = dense ? 46 : 58;
  const nodeW = compact ? 150 : TT_NODE_W;
  /* siblings share the width; when they no longer fit as cards they become chips, then icons */
  const leaves = ttLeafCount(tree.nodes, vis0, expanded, allow);
  const fit = vw / leaves;
  const vMode = fit >= 92 ? "card" : fit >= 58 ? "chip" : "icon";
  const V_COL = vMode === "icon" ? 54 : fit;
  const V_ROW = vMode === "card" ? 100 : vMode === "chip" ? 88 : 66;
  const base = vert
    ? ttLayoutV(tree.nodes, tree.root, expanded, allow, V_ROW, V_COL)
    : ttLayout(tree.nodes, tree.root, expanded, allow, dense ? 62 : 90, compact ? 176 : 258);
  const vis = vis0;
  const posOf = id => { const b = base[id] || { x:0, y:0 }; const o = vert ? null : offsets[id]; return o ? { x:b.x + o.dx, y:b.y + o.dy } : b; };
  const pts = vis.map(id => posOf(id));
  const minX = vert ? 0 : Math.min(...pts.map(p => p.x)), minY = Math.min(...pts.map(p => p.y));
  const spanW = vert ? Math.max(vw, Math.max(...pts.map(p => p.x)) + V_COL) : Math.max(...pts.map(p => p.x)) + nodeW - minX;
  const spanH = Math.max(...pts.map(p => p.y)) + (vert ? V_ROW : rowH) - minY;

  const onSelect = id => setSelected(id);

  const onToggle = id => {
    const n = tree.nodes[id];
    if (!n.kids || !n.kids.length) return;
    if (allow && !expanded[id] && n.kids.some(k => !allow[k])) setAllow(null);
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  };

  /* the canvas scrolls for real; zoom only fits the WIDTH so nodes stay legible, and the
     initial scroll is pinned to the root node so a whole-car filter always opens on the car */
  React.useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    setAutoV(cw < 560);
    if (vertical || cw < 560) { setVw(Math.max(180, cw - PAD * 2)); setZoom(1); setTall(spanH + 40 > ch); return; }
    const z = Math.max(compact ? 0.66 : 0.72, Math.min(1, (cw - (compact ? 24 : 56)) / spanW));
    setZoom(z);
    setTall(spanH * z + 40 > ch);
  }, [expanded, activeBranch, allow, !!selected, vertical, tick]);

  /* pin the opening scroll to the root once the sizer has actually laid out at its new height */
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const frame = window.requestAnimationFrame(() => {
      const want = ((base[tree.root] || { y:0 }).y - minY) * zoom;
      const target = Math.max(0, Math.min(want - el.clientHeight / 2 + 30, el.scrollHeight - el.clientHeight));
      el.scrollLeft = 0;
      el.scrollTop = target;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeBranch, tree.root]);

  const doIntent = (i, tr) => {
    setIntent(i.id);
    const next = { [tr.root]: true }, keep = { [tr.root]: true };
    const match = n => ttMatchesIntent(n, i.id, miles);
    const walk = id => { const n = tr.nodes[id]; let hit = match(n); (n.kids || []).forEach(k => { if (walk(k)) hit = true; }); if (hit) { next[id] = true; keep[id] = true; } return hit; };
    walk(tr.root);
    setExpanded({ ...next, [tr.root]: true });
    setAllow(keep);
    setOffsets({});
    setSelected(null);
    const matchedLabels = Object.values(tr.nodes).filter(match).map(n => n.label).slice(0, 6);
    const line = i.id === "maint"
      ? `Backed out to the whole car and opened ${matchedLabels.length} tracked maintenance item${matchedLabels.length === 1 ? "" : "s"}${typeof miles === "number" ? ` at ${miles.toLocaleString()} mi` : ""}${matchedLabels.length ? `: ${matchedLabels.join(", ")}.` : "."}`
      : i.id === "risk"
        ? `Whole car${typeof miles === "number" ? ` at ${miles.toLocaleString()} mi` : " with mileage unavailable"}. Red is due or past due only when supported; amber is inside 20% of its window${matchedLabels.length ? `: ${matchedLabels.join(", ")}.` : "."}`
        : i.line;
    setReply({ text: line, key: Date.now() });
    if (say) say(line);
  };

  /* filters always answer for the whole car, not just the branch you happen to be in */
  const applyIntent = i => {
    if (intent === i.id) { setIntent(null); setAllow(null); setReply(null); return; }
    if (activeBranch !== "car") { setPending(i); setBranch("car"); return; }
    doIntent(i, tree);
  };

  React.useEffect(() => {
    if (pending && activeBranch === "car") { doIntent(pending, trees.car); setPending(null); }
  }, [activeBranch, pending]);

  const panDown = e => {
    if (e.button === 2) return;
    setMenu(null);
    const el = canvasRef.current;
    if (!el) return;
    const sx = e.clientX, sy = e.clientY, sl = el.scrollLeft, st = el.scrollTop;
    const mv = ev => { el.scrollLeft = sl - (ev.clientX - sx); el.scrollTop = st - (ev.clientY - sy); };
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };

  /* the hub's assistant, working on the tree itself */
  const answer = raw => {
    const q = (raw || "").trim();
    if (!q) return;
    setDraft("");
    const t = q.toLowerCase();
    const parents = ttParents(tree.nodes);
    const reveal = id => { const next = { ...expanded, [tree.root]:true }; let c = id; while (parents[c]) { next[parents[c]] = true; c = parents[c]; } setExpanded(next); setAllow(null); setIntent(null); };
    const say2 = text => { setReply({ text, key: Date.now() }); if (say) say(text); };

    const hit = Object.keys(tree.nodes).filter(id => id !== tree.root).find(id => {
      const words = tree.nodes[id].label.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);
      return words.some(w => t.includes(w)) || (id === "lugs" && /lug|nut/.test(t)) || (id === "padsR" && /rear pad/.test(t)) || (id === "pads" && /pad/.test(t)) || (id === "rotorR" && /rear (rotor|disc)/.test(t)) || (id === "rotor" && /rotor|disc|shudder|shake/.test(t)) || (id === "oilFluid" && /\b0w|5w|weight/.test(t));
    });

    if (/cheap|aftermarket|budget|instead of oem|alternative/.test(t)) {
      const alts = Object.keys(tree.nodes).filter(id => tree.nodes[id].alt);
      alts.forEach(id => reveal(id));
      setIntent("issues");
      say2(alts.length
        ? `Three parts in this tree have a verified-fit aftermarket option: ${alts.map(id => `${tree.nodes[id].label} — ${tree.nodes[id].alt}`).join(" · ")}. I've opened them for you.`
        : "Nothing in this branch has a cheaper verified-fit option worth recommending yet.");
      return;
    }
    if (/back out|whole car|all systems|everything|other (system|categor)|zoom out|top level/.test(t)) { setBranch("car"); say2("Backed out to the car. All three systems are here — click one to drill in."); return; }
    if (/only|just|filter|hide|show/.test(t) && /due|overdue|need|maintenance|service/.test(t)) { applyIntent(TT_INTENTS[1]); return; }
    if (/fail|fails|breaks|weak (point|spot)/.test(t) && tree.nodes.radCore) {
      reveal("radAlum");
      setSelected("radCore");
      say2("The documented one on this platform is the radiator. The 2011–2021 OEM unit runs crimped plastic end tanks that split at the seams — typically 60,000–100,000 mi, sooner on a 392, 35 owner reports. Your car still has the OEM part. I've opened both options under it: the Mopar replacement, which resets the clock, and the Mishimoto MMRAD-SRT-15, which welds the tanks in aluminium and retires the failure.");
      return;
    }
    if (/known issue|fail|break|breaks|problem|recall/.test(t)) { applyIntent(TT_INTENTS[0]); return; }
    if (/mileage|65|risk|glow/.test(t)) { applyIntent(TT_INTENTS[2]); return; }
    if (/tidy|reset|arrange|clean up|re-?arrange|straighten/.test(t)) { setOffsets({}); setPan({ x:56, y:40 }); say2("Straightened the tree back out and put every node back on its branch."); return; }
    if (/top|first|front|move|reorder|bring/.test(t) && hit) {
      reveal(hit);
      setSelected(hit);
      const topY = Math.min(...ttVisible(tree.nodes, tree.root, { ...expanded, [tree.root]:true }).map(id => (base[id] || { y:0 }).y));
      setOffsets(o => ({ ...o, [hit]: { dx:0, dy: (topY - 90) - (base[hit] ? base[hit].y : 0) } }));
      setPan(p => ({ ...p, y: Math.max(p.y, 24 - (topY - 90)) }));
      say2(`Moved ${tree.nodes[hit].label} to the top of the tree and opened its detail.`);
      return;
    }
    if (hit) {
      const n = tree.nodes[hit];
      reveal(hit);
      setSelected(hit);
      say2(ttAskLine(n));
      return;
    }
    say2(`I couldn't tie that to a supported field in the ${vehicle.model} tree. Try one of the visible node names or switch branches.`);
  };

  const edges = [];
  vis.forEach(id => { if (expanded[id]) (tree.nodes[id].kids || []).filter(k => base[k] && (!allow || allow[k])).forEach(k => edges.push([id, k])); });
  const sel = selected ? tree.nodes[selected] : null;
  const criticalCount = Object.keys(tree.nodes).filter(k => ttRisk(tree.nodes[k], miles) === "critical").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, background:"var(--ki-page)" }}>
      <div style={{ padding: compact ? "9px 12px" : "12px 16px", borderBottom:"1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", alignItems:"center", gap: compact ? 8 : 11, flexWrap:"wrap" }}>
        {!compact && <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width:28, height:28, objectFit:"contain", flexShrink:0 }}/>}
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
            {activeBranch !== "car" && (
              <React.Fragment>
                <button onClick={()=>setBranch("car")} style={{ background:"transparent", border:"none", padding:0, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:15.5, fontWeight:500, letterSpacing:"-0.02em", color:"var(--slate-400)" }}>{twinMode === "owner" ? "Your car" : "Demo car"}</button>
                <Icon name="chevron" size={11} style={{ color:"var(--slate-400)", flexShrink:0 }}/>
              </React.Fragment>
            )}
            <span style={{ fontSize: compact ? 14 : 15.5, fontWeight:600, letterSpacing:"-0.02em" }}>{activeBranch === "car" ? carLabel : tree.label}</span>
          </div>
          {!compact && <div style={{ fontSize:11, color:"var(--slate-500)" }}>{activeBranch === "car" ? "All systems" : "Tech tree"} · {carLabel} · <span className="mono">{typeof miles === "number" ? `${miles.toLocaleString()} mi` : "Mileage unavailable"}</span></div>}
        </div>
        {/* "N at risk" chip removed — the risk is already legible from the red
            nodes, and on a phone it crowded the close button. */}
        <button onClick={onClose} title="Close tech tree" style={{ marginLeft:"auto", width:30, height:30, borderRadius:9, background:"var(--ki-card)", border:"1px solid var(--ki-line)", color:"var(--slate-500)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="x" size={15}/></button>
      </div>


      <div style={{ display:"flex", flex:1, minHeight:0 }}>
        <div style={{ flex:1, minWidth:0, position:"relative", display:"flex", minHeight:0 }}>
        <div ref={canvasRef} onPointerDown={panDown} onContextMenu={e=>e.preventDefault()} className="dotted-grid web-scroll" style={{ flex:1, minWidth:0, position:"relative", overflow:"auto", overscrollBehavior:"contain", cursor:"grab", background:"var(--ki-page)" }}>
          <div style={{ position:"relative", width: spanW * zoom + PAD * 2, height: spanH * zoom + PAD * 2 + (vert ? 40 : 0) }}>
          <div style={{ position:"absolute", left:PAD, top:PAD, transform:`scale(${zoom})`, transformOrigin:"0 0" }}>
            <svg style={{ position:"absolute", left:0, top:0, width:Math.max(1, spanW), height:Math.max(1, spanH), pointerEvents:"none", overflow:"visible" }}>
              <g transform={`translate(${-minX},${-minY})`}>
                {edges.map(([a,b]) => {
                  const pa = posOf(a), pb = posOf(b);
                  const risk = ttRisk(tree.nodes[b], miles);
                  const sw = risk === "critical" ? 2 : 1.5;
                  const col = risk === "critical" ? "#E5484D" : risk === "watch" ? "#D9822B" : "var(--ki-line)";
                  if (vert) {
                    const hx = V_COL / 2, thumbH = vMode === "card" ? 48 : vMode === "chip" ? 42 : 38;
                    const x1 = pa.x + hx, y1 = pa.y + thumbH, x2 = pb.x + hx, y2 = pb.y - 2;
                    const cd = Math.max(12, (y2 - y1) / 2);
                    return <path key={a+b} d={`M${x1} ${y1} C ${x1} ${y1+cd}, ${x2} ${y2-cd}, ${x2} ${y2}`} fill="none" strokeWidth={sw} stroke={col}/>;
                  }
                  const x1 = pa.x + nodeW, y1 = pa.y + (dense ? 23 : 28), x2 = pb.x, y2 = pb.y + (dense ? 23 : 28);
                  const cd = Math.max(16, (x2 - x1) / 2);
                  return <path key={a+b} d={`M${x1} ${y1} C ${x1+cd} ${y1}, ${x2-cd} ${y2}, ${x2} ${y2}`} fill="none" strokeWidth={sw} stroke={col}/>;
                })}
              </g>
            </svg>
            {vert && vis.map(id => {
              const kids = (expanded[id] ? (tree.nodes[id].kids || []) : []).filter(k => !allow || allow[k]);
              const all = (tree.nodes[id].kids || []).filter(k => !allow || allow[k]);
              return (
                <TTNodeV key={id} id={id} node={tree.nodes[id]} pos={{ x: posOf(id).x - minX, y: posOf(id).y - minY }} col={V_COL} mode={vMode}
                  selected={selected===id} risk={ttRisk(tree.nodes[id], miles)} up={ttUpState(tree.nodes[id])}
                  expanded={!!kids.length} hasKids={!!all.length} kidCount={all.length}
                  onSelect={onSelect} onToggle={onToggle}/>
              );
            })}
            {!vert && vis.map(id => (
              <TTNode key={id} id={id} node={tree.nodes[id]} pos={{ x: posOf(id).x - minX, y: posOf(id).y - minY }} style={styleOf(id)} selected={selected===id} zoom={zoom} dense={dense} width={nodeW}
                risk={ttRisk(tree.nodes[id], miles)} intent={intent} expanded={!!expanded[id]} hasKids={!!(tree.nodes[id].kids || []).length}
                onSelect={onSelect} onToggle={onToggle} onContext={(nid,x,y)=>setMenu({ id:nid, x, y })}
                onDrag={vert ? null : ((nid,x,y)=>setOffsets(o => ({ ...o, [nid]: { dx: x + minX - (base[nid]||{x:0}).x, dy: y + minY - (base[nid]||{y:0}).y } })))}/>
            ))}
          </div>
          </div>
        </div>
          <div style={{ position:"absolute", left:14, right:14, bottom:12, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8, flexWrap:"wrap-reverse", pointerEvents:"none" }}>
          <div style={{ display:"flex", gap:9, alignItems:"center", flexWrap:"wrap", padding:"6px 11px", borderRadius:999, background:"var(--ki-glass)", border:"1px solid var(--ki-line)", backdropFilter:"blur(10px)", fontSize:10.5, color:"var(--slate-500)", pointerEvents:"auto" }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Icon name="alert" size={11} stroke={2} style={{ color:"#E5484D" }}/> Overdue on service deadline</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Icon name="check" size={11} stroke={2.6} style={{ color:"#12A87A" }}/> On track</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Icon name="shield-alert" size={11} stroke={2} style={{ color:TT_UP_HEX }}/> Known issue on record</span>
            <button onClick={()=>{ setOffsets({}); setAllow(null); setIntent(null); if (canvasRef.current) { canvasRef.current.scrollTop = 0; canvasRef.current.scrollLeft = 0; } }} style={{ background:"transparent", border:"none", color:"var(--au7o-blue)", fontSize:10.5, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)", padding:0 }}>Tidy up</button>
          </div>
          {tall && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:999, background:"var(--ki-glass)", border:"1px solid var(--ki-line)", backdropFilter:"blur(10px)", fontSize:10.5, color:"var(--slate-500)" }}>
              <Icon name="chevron" size={11} style={{ transform:"rotate(90deg)" }}/> Scroll for the rest of the car
            </div>
          )}
          </div>
          {sheetDetail && sel && <TTDetail node={sel} nodeId={selected} onEquip={persistEquipment} miles={miles} risk={ttRisk(sel, miles)} sheet onClose={()=>setSelected(null)} onAsk={(n, context) => onPartHelp ? onPartHelp(context, n) : say && say(ttAskLine(n))}/>}
        </div>
        {!sheetDetail && sel && <TTDetail node={sel} nodeId={selected} onEquip={persistEquipment} miles={miles} risk={ttRisk(sel, miles)} narrow={compact} onClose={()=>setSelected(null)} onAsk={(n, context) => onPartHelp ? onPartHelp(context, n) : say && say(ttAskLine(n, " I'll keep the tree open beside you."))}/>}
      </div>
      <TTComposer value={draft} setValue={setDraft} onSend={answer} reply={reply} suggestions={compact ? [TT_SUGGEST[0], TT_SUGGEST[2]] : TT_SUGGEST}/>
      <TTStyleMenu menu={menu} style={menu ? styleOf(menu.id) : {}}
        onShape={s => setStyles(v => ({ ...v, [menu.id]: { ...styleOf(menu.id), shape:s } }))}
        onColor={c => setStyles(v => ({ ...v, [menu.id]: { ...styleOf(menu.id), color:c } }))}
        onClose={()=>setMenu(null)}/>
    </div>
  );
}

/* removed: the standalone bundle exported via window; this module uses real exports (see bottom). */
export { TechTree, TTDetail, TT_TREES, TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT, ttRisk, ttRiskLabel, ttMatchesIntent, ttHasUpgrade, ttFinish, ttThumb, useEquipped };
