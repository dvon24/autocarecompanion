"use client";
/**
 * The twin hub, driven by a real garage vehicle instead of the demo car.
 *
 * Same components as /demo/hub — this only supplies TwinDataCtx, which every
 * piece of the hub already falls back out of. Nothing here forks the UI.
 *
 * What it computes on top of the server payload:
 *   • the tree set, with each part's clock reset from real logged services
 *   • "next service", derived from that tree rather than hardcoded
 *
 * Both live here rather than on the server because the service intervals sit
 * next to the tree they annotate (twin-trees.js), so "what counts as due" has
 * exactly one definition.
 */
import React from "react";
import dynamic from "next/dynamic";
import { TwinDataCtx } from "./twin-context";
import { buildTwinTrees, servicedFromRecords } from "./twin-trees";

const HubRoot = dynamic(
  () => import("./hub/HubRoot").then((m) => ({ default: m.HubRoot })),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "var(--ki-page)", color: "var(--slate-500)", fontSize: 13 }}>
        Loading your car…
      </div>
    ),
  },
);

/**
 * The one service worth putting on the sidebar card.
 *
 * Most overdue wins; if nothing is overdue, the soonest upcoming one does. If
 * the car has nothing tracked at all this returns null and the card does not
 * render — the demo's hardcoded "Front brake pads" card was the thing being
 * replaced, so falling back to any invented job would defeat the change.
 */
function pickNextService(trees, miles) {
  const car = trees.car;
  if (!car) return null;

  let best = null;
  for (const [id, node] of Object.entries(car.nodes)) {
    if (id === car.root || node.group || !node.riskAt) continue;
    // Never logged: we know it is untracked, not that it is due. Surfacing it
    // as "overdue" would be a guess dressed as a fact.
    if (node.servicedAt == null) continue;
    const due = node.servicedAt + node.riskAt;
    const remaining = due - miles;
    const overdue = remaining <= 0;
    const cand = {
      nodeId: id,
      hot: id === "transFluid" || id === "transPan" ? "trans"
        : id === "wipL" || id === "wipR" ? "glass"
          : ["tire", "pads", "rotor", "padsR", "rotorR", "lugs", "tpms", "brakeFluid"].includes(id) ? "wheel"
            : "hood",
      label: node.label,
      note: node.dueNote || "",
      overdue,
      remaining,
      progress: Math.max(0, Math.min(1, (miles - node.servicedAt) / node.riskAt)),
    };
    if (!best) { best = cand; continue; }
    // Overdue beats upcoming; within a group, the more extreme one wins.
    if (overdue && !best.overdue) best = cand;
    else if (overdue === best.overdue && cand.remaining < best.remaining) best = cand;
  }
  if (!best) return null;
  return best;
}

export function LiveTwinHub({ data }) {
  const value = React.useMemo(() => {
    const serviced = servicedFromRecords(data.records);
    const trees = buildTwinTrees(serviced, data.miles, data.transmission);
    return {
      vehicle: data.vehicle,
      miles: data.miles,
      trees,
      nextService: pickNextService(trees, data.miles),
      recent: data.recent || [],
      issues: [],
    };
  }, [data]);

  return (
    <TwinDataCtx.Provider value={value}>
      <HubRoot />
    </TwinDataCtx.Provider>
  );
}

export { pickNextService };
