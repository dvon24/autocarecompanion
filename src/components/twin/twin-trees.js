"use client";
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
import { TT_TREES } from "./stage/TechTree";
import { ebayAffiliate } from "@/lib/ebay-affiliate";

const AUTO_FLUID_URL = "https://www.ebay.com/itm/152808690128";
const MANUAL_FLUID_URL = "https://www.ebay.com/itm/389013189748";

const MANUAL_TRANSMISSION_TREE = {
  label:"Transmission", short:"Transmission", root:"trx",
  nodes:{
    trx:{ label:"Transmission", sub:"Tremec TR-6060 · 6-speed manual", img:"/twin-stage/parts/part-transmission.webp", kids:["transFluid","transPlug"], group:true,
      partNo:"—", where:"Behind the engine, under the tunnel", spec:"Tremec TR-6060 · 6-speed manual", price:"—",
      life:"ATF+4 is the factory-specified lubricant even though this is a manual gearbox" },
    transFluid:{ label:"Manual Transmission Fluid", sub:"Mopar ATF+4 · MS-9602", img:"/twin-stage/parts/part-oil.webp", kids:[], riskAt:60000,
      partNo:"68218057AC", brand:"Genuine Mopar ATF+4", where:"Manual-transmission fill plug", spec:"Approx. 3.4 qt dry capacity · fill 1/4 in below the plug using the service procedure", price:"$51.85 / 6-qt set when reviewed", stock:"eBay · new · add-to-cart live when reviewed",
      life:"Inspect per the owner schedule; owner-facing service plan uses 60,000 mi",
      buyUrl:ebayAffiliate(MANUAL_FLUID_URL, "twin-challenger-manual-fluid"), buyLabel:"Order manual-transmission fluid" },
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
  tire: 40000,
  pads: 45000,
  rotor: 70000,
  padsR: 80000,
  rotorR: 95000,
  lugs: 60000,
  tpms: 70000,
  radCore: 90000,
  transFluid: 60000,
  transPan: 60000,
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
  transmission_fluid: ["transFluid", "transPan"],
  transmission_fluid_auto: ["transFluid", "transPan"],
  transmission_fluid_manual: ["transFluid"],
  // Intentionally NOT mapped (they do not replace anything):
  //   tire_rotation, brake_inspection, wheel_alignment
};

/** Humanised "where this part stands", computed instead of hand-written. */
function dueNoteFor(node, miles, interval) {
  if (!interval) return null;
  if (node.servicedAt == null) {
    return `Never logged — replace every ${interval.toLocaleString()} mi.`;
  }
  const due = node.servicedAt + interval;
  const delta = miles - due;
  if (delta >= 0) return `${Math.round(delta).toLocaleString()} mi past due.`;
  const left = Math.round(-delta);
  if (left <= interval * 0.2) return `Due in ${left.toLocaleString()} mi.`;
  return `Serviced at ${node.servicedAt.toLocaleString()} mi · next at ${due.toLocaleString()} mi.`;
}

/**
 * Build a live tree set.
 *
 * @param {Object<string, number>} serviced  node id -> odometer reading of the
 *                                           most recent replacement
 * @param {number} miles                     current odometer
 */
export function buildTwinTrees(serviced, miles, transmission) {
  const svc = serviced || {};

  // One object per node id, shared across every tree that lists it.
  const shared = {};
  for (const tree of Object.values(TT_TREES)) {
    for (const [id, base] of Object.entries(tree.nodes)) {
      if (shared[id]) continue;
      const node = { ...base };
      const interval = TWIN_INTERVALS[id] != null ? TWIN_INTERVALS[id] : base.riskAt;

      if (svc[id] != null) {
        node.servicedAt = svc[id];
        node.riskAt = interval;
      } else {
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
        if (interval) node.unlogged = true;
      }

      // The demo's hand-written notes are false on a real odometer.
      const note = dueNoteFor(node, miles, interval);
      if (note) node.dueNote = note;
      else delete node.dueNote;
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
    Object.assign(out.trans.nodes.transFluid, {
      buyUrl: ebayAffiliate(AUTO_FLUID_URL, "twin-challenger-automatic-fluid"),
      buyLabel: "Order 6-qt automatic drain-and-fill set",
      price: "$179.95 / 6-qt set when reviewed",
      stock: "eBay · new · more than 10 available when reviewed",
      spec: "4.0 qt typical pan drain-and-fill · 7.6 qt full system · use the exact temperature-level procedure · never substitute ATF+4",
    });
    out.car.nodes.car = { ...out.car.nodes.car, life:"Four verified systems tracked · automatic transmission confirmed" };
  } else if (transmission === "manual" && out.trans && out.car) {
    const automaticNodeIds = Object.keys(out.trans.nodes);
    for (const nodeId of automaticNodeIds) delete out.car.nodes[nodeId];

    const manualNodes = {};
    for (const [id, base] of Object.entries(MANUAL_TRANSMISSION_TREE.nodes)) {
      const node = { ...base };
      const interval = TWIN_INTERVALS[id] != null ? TWIN_INTERVALS[id] : base.riskAt;
      if (svc[id] != null) {
        node.servicedAt = svc[id];
        node.riskAt = interval;
      } else {
        delete node.servicedAt;
        delete node.riskAt;
        if (interval) node.unlogged = true;
      }
      const note = dueNoteFor(node, miles, interval);
      if (note) node.dueNote = note;
      else delete node.dueNote;
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
      life: "Three verified systems tracked · transmission confirmation still needed",
    };
  }
  return out;
}

/** Fold MaintenanceRecord rows into a { nodeId: mileage } map, latest wins. */
export function servicedFromRecords(records) {
  const out = {};
  for (const rec of records || []) {
    const ids = TWIN_MAINT_NODES[rec.type];
    if (!ids || typeof rec.mileage !== "number") continue;
    for (const id of ids) {
      if (out[id] == null || rec.mileage > out[id]) out[id] = rec.mileage;
    }
  }
  return out;
}
