/**
 * Turn the demo tree into a real one.
 *
 * The tree's PART data was never the fake part — the part numbers, torques and
 * fitment in TT_TREES are genuinely a 2015 Challenger SRT 392's (Mopar MO-899,
 * 0W-40 MS-12633, Brembo 6-piston, the swollen-lug-nut failure). What was
 * invented is the service STATE, and it was invented twice over:
 *
 *   1. `riskAt` was used as an ABSOLUTE odometer reading (oil "riskAt: 65000"
 *      on a 65,000 mi demo car) so everything would light up at once. But
 *      ttRisk() treats riskAt as an INTERVAL the moment a part has a
 *      servicedAt. Feed it a real service history and the demo numbers become
 *      nonsense — a 6,000 mi oil change would read as a 65,000 mi one.
 *   2. `dueNote` strings were hand-written to match the demo's odometer
 *      ("20,000 mi past a typical front set"). On a real car they are simply
 *      false, so they are recomputed here and dropped when unknown.
 *
 * So this module replaces riskAt with the real interval — taken from the `life`
 * copy already written on each node, so the number and the prose agree — and
 * seeds servicedAt from the owner's actual MaintenanceRecord rows.
 *
 * Nodes are rebuilt as SHARED objects across trees, exactly as the demo builds
 * them (TT_TREES.car merges the other trees' node objects by reference). That
 * sharing is load-bearing: ttMarkDone() mutates a node in place, and marking a
 * part done inside the engine tree has to show up in the whole-car tree too.
 */
import { TT_TREES } from "./twin-tree-data";
import { ebayAffiliate } from "@/lib/ebay-affiliate";
import { nextRoutineMileage } from "./maintenance-schedule";

const AUTO_FLUID_URL = "https://www.ebay.com/itm/152808690128";
const MANUAL_FLUID_URL = "https://store.mopar.com/oem-parts/mopar-mopar-atf-4-transmission-fluid-68218057ac";

const MANUAL_TRANSMISSION_TREE = {
  label:"Transmission", short:"Transmission", root:"trx",
  nodes:{
    trx:{ label:"Transmission", sub:"Tremec TR-6060 · 6-speed manual", img:"/twin-stage/parts/part-transmission.webp", kids:["transFluid","transPlug"], group:true,
      partNo:"—", where:"Behind the engine, under the tunnel", spec:"Tremec TR-6060 · 6-speed manual", price:"—",
      life:"ATF+4 is the factory-specified lubricant even though this is a manual gearbox" },
    transFluid:{ label:"Manual Transmission Fluid", sub:"Mopar ATF+4 · MS-9602", img:"/twin-stage/parts/part-transmission-fluid.webp", kids:[], riskAt:60000,
      partNo:"68218057AC", brand:"Genuine Mopar ATF+4", where:"Manual-transmission fill plug", spec:"2015 Challenger 6.4L TR-6060 requires ATF+4. Approx. 3.4 US qt dry capacity; use the exact service procedure and fill 1/4 in below the fill-plug hole. The listing sells six one-quart bottles; do not pour the complete pack into the gearbox.", price:"$51.78 / six 1-qt bottles when reviewed", stock:"Mopar eStore · pack of six · add-to-cart available when reviewed",
      componentRole:"manual-transmission-fluid",soldQuarts:6,purchaseQuantity:1,reviewedAt:"2026-09-08",fitmentReviewed:true,
      sourceUrl:"https://starparts.chrysler.com/Fluids/2015LA_Fluids.html",sourceLabel:"2015 Challenger TechCONNECT fluid chart · 6.4L TR-6060",
      life:"Inspect per the owner schedule; owner-facing service plan uses 60,000 mi",
      buyUrl:MANUAL_FLUID_URL, buyLabel:"Buy six-quart Mopar ATF+4 pack" },
    transPlug:{ label:"Fill Plug Seal", sub:"Confirm the service hardware", img:"/twin-stage/parts/part-drain-plug.webp", kids:[],
      partNo:"Verify by VIN", brand:"Mopar service hardware", where:"Fill plug on the manual transmission", spec:"Use the exact service procedure and torque for the installed TR-6060", price:"Verify current price", stock:"Confirm by VIN before ordering",
      life:"Replace one-time-use hardware whenever specified by the service procedure" },
  },
};

/**
 * Real service intervals, in miles. Each one matches the `life` string already
 * written on that node so the badge and the prose can never disagree.
 * Nodes absent here keep whatever the base tree said.
 */
export const TWIN_INTERVALS = {
  // "6,000 mi or 6 months, whichever lands first"
  oilFluid: 6000,
  oilFilter: 6000,
  // "Every 30,000 mi, sooner on dirt roads"
  airFilter: 30000,
  // "Every 20,000 mi or a year"
  cabinFilter: 20000,
  // "Flush every 2 years or 30,000 mi"
  brakeFluid: 30000,
  // "10 years or 150,000 mi from new, then every 5 years"
  coolant: 150000,
  // "6 to 12 months" — call it 12,000 mi
  wipL: 12000,
  wipR: 12000,
  // Wear items: the demo's numbers were already sane as intervals.
  // Tire replacement has no rotation-derived life. Saved owner deadlines and
  // installed-tire lifespan can supply a separate, explicit replacement clock.
  tire: null,
  pads: 45000,
  rotor: 70000,
  padsR: 80000,
  rotorR: 95000,
  lugs: 60000,
  tpms: 70000,
  radCore: 90000,
  transFluid: 60000,
  transPan: 60000,
  diffFluid: 50000,
};

/**
 * Which tree nodes a logged maintenance type actually resets.
 *
 * Only jobs that REPLACE a part reset its clock. Inspections and rotations are
 * deliberately absent: logging a brake inspection tells us the pads were
 * looked at, not that they are new, and claiming otherwise would hide a worn
 * set behind a green badge. Same reasoning as the recall-first render guard —
 * when the data does not support the claim, do not make the claim.
 */
export const TWIN_MAINT_NODES = {
  oil_change: ["oilFluid", "oilFilter", "oilPlug"],
  air_filter: ["airFilter"],
  cabin_filter: ["cabinFilter"],
  brake_fluid: ["brakeFluid"],
  wiper_blades: ["wipL", "wipR"],
  coolant_flush: ["coolant"],
  // Rotation is history, not evidence that a worn tire was replaced.
  tire_rotation: [],
  tire_replacement: ["tire"],
  // Generic/partial work cannot identify replacement of every component.
  brake_service: [],
  cooling_system_service: [],
  front_brake_pads: ["pads"],
  rear_brake_pads: ["padsR"],
  front_brake_rotors: ["rotor"],
  rear_brake_rotors: ["rotorR"],
  radiator_replacement: ["radCore"],
  other_service: [],
  differential_fluid: ["diffFluid"],
};

/** Persistable maintenance action shown by each actionable tree node. */
export const TWIN_NODE_SERVICE = {
  oilFluid:{type:"oil_change", label:"Oil change"},
  oilFilter:{type:"oil_change", label:"Oil change"},
  airFilter:{type:"air_filter", label:"Engine air filter"},
  cabinFilter:{type:"cabin_filter", label:"Cabin air filter"},
  brakeFluid:{type:"brake_fluid", label:"Brake fluid"},
  coolant:{type:"coolant_flush", label:"Coolant service"},
  wipL:{type:"wiper_blades", label:"Wiper blades"},
  wipR:{type:"wiper_blades", label:"Wiper blades"},
  tire:{type:"tire_replacement", label:"Tire replacement"},
  pads:{type:"front_brake_pads", label:"Front brake pads replaced"},
  rotor:{type:"front_brake_rotors", label:"Front brake rotors replaced"},
  padsR:{type:"rear_brake_pads", label:"Rear brake pads replaced"},
  rotorR:{type:"rear_brake_rotors", label:"Rear brake rotors replaced"},
  radCore:{type:"radiator_replacement", label:"Radiator replaced"},
  diffFluid:{type:"differential_fluid", label:"Rear differential fluid service"},
};

export const TWIN_SUPPORTED_MAINTENANCE_TYPES = [
  ...Object.keys(TWIN_MAINT_NODES),
  "transmission_fluid",
  "transmission_fluid_auto",
  "transmission_fluid_manual",
];

export const TWIN_TIME_INTERVALS = {
  oilFluid:{months:6},
  oilFilter:{months:6},
  brakeFluid:{years:2},
  coolant:{years:5},
  wipL:{years:1},
  wipR:{years:1},
};

/** UTC calendar arithmetic with end-of-month clamping (Jan 31 + 1 month = Feb 28/29). */
export function addCalendarInterval(value, interval) {
  const timestamp = finiteDate(value);
  if (timestamp == null || !interval) return null;
  const source = new Date(timestamp);
  const totalMonths = source.getUTCFullYear() * 12
    + source.getUTCMonth()
    + (interval.years || 0) * 12
    + (interval.months || 0);
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(
    year,
    month,
    Math.min(source.getUTCDate(), lastDay),
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds(),
  );
}

function serviceValue(value) {
  return typeof value === "number" ? { mileage:value, date:null, nextDueMileage:null, nextDueDate:null } : value || null;
}

function finiteDate(value) {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

/** Humanised "where this part stands", computed instead of hand-written. */
function dueNoteFor(node, miles, interval) {
  if (node.unlogged) return typeof node.dueMileage === "number"
    ? `Never logged · next routine service at ${node.dueMileage.toLocaleString()} mi.`
    : interval ? `Never logged — service interval ${interval.toLocaleString()} mi.` : "Never logged.";
  const notes = [];
  if (typeof node.dueMileage === "number") {
    const delta = miles - node.dueMileage;
    if (delta >= 0) notes.push(`${Math.round(delta).toLocaleString()} mi past due`);
    else notes.push(`due in ${Math.round(-delta).toLocaleString()} mi`);
  }
  if (node.dueDate) {
    const formatted = new Date(node.dueDate).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric", timeZone:"UTC" });
    notes.push(node.overdueByDate ? `time interval passed ${formatted}` : `date due ${formatted}`);
  }
  if (notes.length) return `${notes.join(" · ")}.`;
  if (node.servicedAt != null) return `Serviced at ${node.servicedAt.toLocaleString()} mi.`;
  return null;
}

function applyServiceEvidence(node, rawService, id, interval, miles, currentDate) {
  const action = TWIN_NODE_SERVICE[id];
  if (action && (interval || id === 'tire')) {
    node.maintenanceType = action.type;
    node.serviceLabel = action.label;
    node.serviceIntervalMiles = interval;
  }
  const service = serviceValue(rawService);
  if (!service) {
    delete node.servicedAt;
    delete node.riskAt;
    delete node.dueDate;
    delete node.overdueByDate;
    if (interval || TWIN_TIME_INTERVALS[id]) {
      node.unlogged = true;
      // Missing history is not proof a service was missed. Keep the first
      // manual interval for provenance, but surface the next routine milestone
      // at/after the current odometer as a neutral "Never logged" state.
      if (interval) {
        node.firstServiceDeadline = true;
        node.dueMileage = nextRoutineMileage(miles, interval, interval);
      }
    }
    const note = dueNoteFor(node, miles, interval);
    if (note) node.dueNote = note;
    return node;
  }
  const serviceDate = finiteDate(service.date);
  node.servicedAt = service.mileage;
  node.riskAt = interval;
  if (serviceDate != null) node.servicedDate = new Date(serviceDate).toISOString();
  node.dueMileage = typeof service.nextDueMileage === "number"
    ? service.nextDueMileage
    : (interval ? service.mileage + interval : null);
  const explicitDueDate = finiteDate(service.nextDueDate);
  const calendarInterval = TWIN_TIME_INTERVALS[id];
  const dueDate = explicitDueDate ?? addCalendarInterval(serviceDate, calendarInterval);
  if (dueDate != null) {
    node.dueDate = new Date(dueDate).toISOString();
    node.overdueByDate = Number.isFinite(currentDate) && dueDate <= currentDate;
  }
  const note = dueNoteFor(node, miles, interval);
  if (note) node.dueNote = note;
  return node;
}

/**
 * Build a live tree set.
 *
 * @param {Object<string, number>} serviced  node id -> odometer reading of the
 *                                           most recent replacement
 * @param {number} miles                     current odometer
 */
export function buildTwinTrees(serviced, miles, transmission, evaluatedAt = null) {
  const svc = serviced || {};
  const currentDate = finiteDate(evaluatedAt);

  // One object per node id, shared across every tree that lists it.
  const shared = {};
  for (const tree of Object.values(TT_TREES)) {
    for (const [id, base] of Object.entries(tree.nodes)) {
      if (shared[id]) continue;
      const node = { ...base };
      const interval = Object.prototype.hasOwnProperty.call(TWIN_INTERVALS,id) ? TWIN_INTERVALS[id] : base.riskAt;

      if (svc[id] == null) {
        /* NEVER LOGGED IS NOT OVERDUE.
           ttRisk treats an unserviced part as due the moment the odometer
           passes riskAt, which is right for the authored demo car and wrong
           for a real one: it would paint the tires, pads, rotors and lug
           nuts of a 155,000 mi car red purely because nobody typed them
           into the log. That is a guess rendered as a fact — the same error
           as claiming a fitment we have not verified.

           So an unlogged part carries no riskAt and gets no colour. The
           interval still reaches the owner through the note and the node's
           own `life` copy; what disappears is the false claim about THIS
           car. Log the job and the clock starts. */
        delete node.servicedAt;
        delete node.riskAt;
        // Only a part with a real interval is "unlogged" in any meaningful
        // sense. Calipers, wheels and the radiator's two option nodes are not
        // service items, so they carry no state either way.
        if (id === 'tire' || interval || TWIN_TIME_INTERVALS[id]) node.unlogged = true;
      }
      applyServiceEvidence(node, svc[id], id, interval, miles, currentDate);
      shared[id] = node;
    }
  }

  const out = {};
  for (const [key, tree] of Object.entries(TT_TREES)) {
    const nodes = {};
    for (const id of Object.keys(tree.nodes)) nodes[id] = shared[id];
    out[key] = { ...tree, nodes };
  }

  if (transmission === "automatic" && out.trans && out.car) {
    for (const id of ["transFluid", "transPan"]) {
      Object.assign(out.trans.nodes[id], {
        maintenanceType:"transmission_fluid_auto",
        serviceLabel:"Automatic transmission fluid service",
        serviceIntervalMiles:TWIN_INTERVALS[id],
      });
    }
    Object.assign(out.trans.nodes.transFluid, {
      buyUrl: ebayAffiliate(AUTO_FLUID_URL, "twin-challenger-automatic-fluid"),
      buyLabel: "Order 6-qt automatic drain-and-fill set",
      price: "$179.95 / 6-qt set when reviewed",
      stock: "eBay · new · more than 10 available when reviewed",
      spec: "2015 Challenger 6.4L / ZF 8HP70: the factory chart gives 9.0 US qt (8.5 L) for an overhaul/dry fill, not a routine drain-and-fill quantity. Actual service quantity depends on what was drained and the cooling circuit. Set the level with the exact temperature-based service procedure; never pour the dry-fill capacity into a partially filled transmission or substitute ATF+4.",
      sourceUrl: "https://starparts.chrysler.com/Fluids/2015LA_Fluids.html",
      sourceLabel: "2015 Challenger factory fluids chart — 8HP70 overhaul capacity",
    });
    out.car.nodes.car = { ...out.car.nodes.car, life:"Four verified systems tracked · automatic transmission confirmed" };
  } else if (transmission === "manual" && out.trans && out.car) {
    const automaticNodeIds = Object.keys(out.trans.nodes);
    for (const nodeId of automaticNodeIds) delete out.car.nodes[nodeId];

    const manualNodes = {};
    for (const [id, base] of Object.entries(MANUAL_TRANSMISSION_TREE.nodes)) {
      const node = { ...base };
      const interval = TWIN_INTERVALS[id] != null ? TWIN_INTERVALS[id] : base.riskAt;
      applyServiceEvidence(node, svc[id], id, interval, miles, currentDate);
      if (id === "transFluid") Object.assign(node, {
        maintenanceType:"transmission_fluid_manual",
        serviceLabel:"Manual transmission fluid service",
        serviceIntervalMiles:interval,
      });
      manualNodes[id] = node;
    }
    out.trans = { ...MANUAL_TRANSMISSION_TREE, nodes: manualNodes };
    Object.assign(out.car.nodes, manualNodes);
    out.car.nodes.car = { ...out.car.nodes.car, life:"Four verified systems tracked · manual transmission confirmed" };
  } else if (out.trans && out.car) {
    const transmissionNodeIds = Object.keys(out.trans.nodes);
    delete out.trans;
    for (const nodeId of transmissionNodeIds) delete out.car.nodes[nodeId];
    out.car.nodes.car = {
      ...out.car.nodes.car,
      kids: out.car.nodes.car.kids.filter((id) => id !== "trx"),
      life: "Three verified systems tracked",
    };
  }
  if (out.trans && out.car) {
    const manualRearAxle = transmission === "manual";
    const diffFluid = applyServiceEvidence({
      label:"Rear Differential Fluid", sub:manualRearAxle ? "230 mm limited-slip rear axle" : "230 mm rear axle", img:"/twin-stage/parts/part-differential.webp", kids:[], riskAt:TWIN_INTERVALS.diffFluid,
      partNo:manualRearAxle ? "Base oil 68232947AB → 68232947AD · modifier must be verified separately" : "68232947AB → 68232947AD",
      brand:manualRearAxle ? "Mopar OD 75W-85 base gear oil + compatible limited-slip friction modifier" : "Mopar OD Synthetic Gear Lubricant",
      where:"Rear axle differential housing",
      spec:"The factory chart distinguishes standard and limited-slip 230 mm axles; transmission type alone does not identify which is installed. Confirm the axle and its current approved lubricant by VIN. Nominal capacity is 1.16 US qt. If a separate modifier is prescribed, its volume counts toward the final fill level; bottle size is not a verified dose.",
      commerceStatus:"fitment-hold",fitmentReviewed:false,
      holdReason:"Confirm the installed axle and current approved lubricant/modifier combination and dose before ordering. The base gear oil is not presented as a complete limited-slip service kit.",
      price:manualRearAxle ? "Base oil and modifier price must be verified" : "$17.07 listed",
      stock:manualRearAxle ? "Former LSD-labelled fluid is unavailable; exact current modifier link held for review" : "MoparPartsGiant · add-to-cart live when reviewed",
      buyUrl:manualRearAxle ? null : "https://www.moparpartsgiant.com/parts/mopar-lubricant-gear~68232947ad.html",
      sourceUrl:"https://starparts.chrysler.com/Fluids/2015LA_Fluids.html", sourceLabel:"2015 Challenger TechCONNECT fluid chart",
      life:"Inspect for leaks at every service; owner plan uses 50,000 mi for street use",
    }, svc.diffFluid, "diffFluid", TWIN_INTERVALS.diffFluid, miles, currentDate);
    diffFluid.maintenanceType = "differential_fluid";
    diffFluid.serviceLabel = "Rear differential fluid service";
    diffFluid.serviceIntervalMiles = TWIN_INTERVALS.diffFluid;
    out.trans.nodes.diffFluid = diffFluid;
    if (!out.trans.nodes.trx.kids.includes("diffFluid")) out.trans.nodes.trx.kids = [...out.trans.nodes.trx.kids, "diffFluid"];
    out.car.nodes.diffFluid = diffFluid;
  }
  return out;
}

/** Fold MaintenanceRecord rows into a { nodeId: mileage } map, latest wins. */
export function servicedFromRecords(records, currentMileage = Infinity, transmission = null, evaluatedAt = null) {
  const out = {};
  const currentDate = finiteDate(evaluatedAt) ?? Infinity;
  for (const rec of records || []) {
    let ids = TWIN_MAINT_NODES[rec.type];
    // Legacy generic transmission history is deliberately unassigned. It may
    // describe a prior gearbox or an unknown fluid, so a later branch choice
    // must not reinterpret it as evidence for automatic or manual service.
    if (rec.type === "transmission_fluid") {
      ids = null;
    } else if (rec.type === "transmission_fluid_auto") {
      ids = transmission === "automatic" ? ["transFluid", "transPan"] : null;
    } else if (rec.type === "transmission_fluid_manual") {
      ids = transmission === "manual" ? ["transFluid"] : null;
    }
    const recordDate = finiteDate(rec.date);
    if (!ids || typeof rec.mileage !== "number" || rec.mileage < 0 || rec.mileage > currentMileage || (recordDate != null && recordDate > currentDate)) continue;
    const evidence = {
      mileage:rec.mileage,
      date:recordDate == null ? null : new Date(recordDate).toISOString(),
      nextDueMileage:typeof rec.nextDueMileage === "number" ? rec.nextDueMileage : null,
      nextDueDate:finiteDate(rec.nextDueDate) == null ? null : new Date(finiteDate(rec.nextDueDate)).toISOString(),
    };
    for (const id of ids) {
      const previous = out[id];
      const previousDate = finiteDate(previous?.date);
      if (!previous || (recordDate != null && (previousDate == null || recordDate > previousDate)) || (recordDate === previousDate && rec.mileage > previous.mileage)) out[id] = evidence;
    }
  }
  return out;
}
