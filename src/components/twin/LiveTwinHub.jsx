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
import { useRouter } from "next/navigation";
import { TwinDataCtx } from "./twin-context";
import { buildTwinTrees, servicedFromRecords } from "./twin-trees";
import { getTwinByFulfillmentId } from "../../lib/vehicle-twin-catalog";
import { sameTwinVehicleIdentity } from "../../lib/twin-fulfillment";
import { mergeCatalogEvidenceIntoOwnerTrees, buildDemoTwinPresentation, filterTwinCatalogForTrees } from "./demo-trees";

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
function finiteTime(value) {
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : null;
}

function pickNextService(trees, miles, evaluatedAt = null) {
  const car = trees.car;
  if (!car) return null;
  const now = finiteTime(evaluatedAt);

  let best = null;
  for (const [id, node] of Object.entries(car.nodes)) {
    if (id === car.root || node.group) continue;
    // Never logged: we know it is untracked, not that it is due. Surfacing it
    // as "overdue" would be a guess dressed as a fact.
    if (node.servicedAt == null) continue;
    const dueMileage = typeof node.dueMileage === "number"
      ? node.dueMileage
      : (typeof node.riskAt === "number" ? node.servicedAt + node.riskAt : null);
    const dueDate = finiteTime(node.dueDate);
    if (dueMileage == null && dueDate == null) continue;
    const mileageRemaining = dueMileage == null ? null : dueMileage - miles;
    const dateRemaining = dueDate == null || now == null ? null : dueDate - now;
    const mileageOverdue = mileageRemaining != null && mileageRemaining <= 0;
    const dateOverdue = node.overdueByDate === true || (dateRemaining != null && dateRemaining <= 0);
    const overdue = mileageOverdue || dateOverdue;
    const mileageProgress = dueMileage != null && dueMileage > node.servicedAt
      ? (miles - node.servicedAt) / (dueMileage - node.servicedAt)
      : null;
    const servicedDate = finiteTime(node.servicedDate);
    const dateProgress = dueDate != null && now != null && servicedDate != null && dueDate > servicedDate
      ? (now - servicedDate) / (dueDate - servicedDate)
      : null;
    const progressValues = [mileageProgress, dateProgress].filter((value) => typeof value === "number" && Number.isFinite(value));
    const lateness = progressValues.length
      ? Math.max(0, Math.max(...progressValues) - 1)
      : 0;
    const progress = progressValues.length
      ? Math.max(0, Math.min(1, Math.max(...progressValues)))
      : 0;
    const dueSource = mileageOverdue && dateOverdue ? "mileage-and-date"
      : dateOverdue ? "date"
        : mileageOverdue ? "mileage"
          : dateProgress != null && (mileageProgress == null || dateProgress >= mileageProgress) ? "date"
            : "mileage";
    const cand = {
      nodeId: id,
      hot: id === "transFluid" || id === "transPan" ? "trans"
        : id === "wipL" || id === "wipR" ? "glass"
          : ["tire", "pads", "rotor", "padsR", "rotorR", "lugs", "tpms", "brakeFluid"].includes(id) ? "wheel"
            : "hood",
      label: node.label,
      note: node.dueNote || "",
      overdue,
      dueMileage,
      dueDate: node.dueDate || null,
      dueSource,
      mileageRemaining,
      dateRemaining,
      lateness,
      progress,
    };
    if (!best) { best = cand; continue; }
    // Overdue beats upcoming. Date-only jobs are ordered chronologically;
    // mileage-only jobs use miles remaining. Mixed clocks use progress so the
    // deadline closest to/past its own interval wins without comparing days to miles.
    if (overdue && !best.overdue) best = cand;
    else if (overdue === best.overdue) {
      if (overdue && cand.lateness !== best.lateness) {
        if (cand.lateness > best.lateness) best = cand;
        continue;
      }
      const bothDateOnly = cand.dueMileage == null && best.dueMileage == null && cand.dueDate && best.dueDate;
      const bothMileageOnly = cand.dueDate == null && best.dueDate == null && cand.dueMileage != null && best.dueMileage != null;
      if (bothDateOnly && cand.dueDate.localeCompare(best.dueDate) < 0) best = cand;
      else if (bothMileageOnly && cand.mileageRemaining < best.mileageRemaining) best = cand;
      else if (!bothDateOnly && !bothMileageOnly && cand.progress > best.progress) best = cand;
    }
  }
  if (!best) return null;
  return best;
}

export function LiveTwinHub({ data }) {
  const router = useRouter();
  const [transmissionPending, setTransmissionPending] = React.useState(false);
  const [transmissionChoice, setTransmissionChoice] = React.useState(data.transmission || "");
  const [transmissionState, setTransmissionState] = React.useState("idle");
  const [transmissionError, setTransmissionError] = React.useState("");
  const safeData = React.useMemo(() => suppressTwinTransmissionWhilePending(data, transmissionPending && !data.transmission), [data, transmissionPending]);
  const baseValue = React.useMemo(() => buildOwnerTwinValue(safeData), [safeData]);
  const transmissionPicker = React.useMemo(() => getFounderTransmissionPickerModel(data), [data]);
  const currentTransmission = transmissionPicker?.current || null;

  React.useEffect(() => {
    setTransmissionChoice(data.transmission || "");
    setTransmissionState("idle");
    setTransmissionError("");
    setTransmissionPending(false);
  }, [data.transmission, data.vehicleId, data.vehicleRevision]);

  React.useEffect(() => {
    if (transmissionState !== "refreshing") return undefined;
    const timer = window.setTimeout(() => window.location.reload(), 10_000);
    return () => window.clearTimeout(timer);
  }, [transmissionState]);

  const installUpgrade = React.useCallback(async ({ nodeId, upgrade }) => {
    const response = await fetch(`/api/vehicles/${encodeURIComponent(data.vehicleId)}/modifications`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        category:"performance",
        name:upgrade.label,
        brand:"Mishimoto",
        partNumber:upgrade.node?.partNo || "MMRAD-SRT-15",
        description:upgrade.fixes,
        modelData:{ source:"owner-twin", nodeId },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Could not save this fitted part.");
    router.refresh();
    return true;
  }, [data.vehicleId, router]);

  const saveTransmission = React.useCallback(async () => {
    if (!transmissionChoice || transmissionChoice === currentTransmission) return false;
    return saveFounderTransmission({
      fetcher:fetch,
      vehicleId:data.vehicleId,
      vehicleRevision:data.vehicleRevision,
      choice:transmissionChoice,
      onPendingChange:setTransmissionPending,
      setState:setTransmissionState,
      setError:setTransmissionError,
      refresh:() => router.refresh(),
    });
  }, [currentTransmission, data.vehicleId, data.vehicleRevision, router, transmissionChoice]);

  const value = React.useMemo(() => baseValue ? ({
    ...baseValue,
    ownerActions:{
      vehicleId:data.vehicleId,
      refresh:() => router.refresh(),
      installUpgrade,
    },
    transmissionControl:transmissionPicker ? {
      model:transmissionPicker,
      choice:transmissionChoice,
      state:transmissionState,
      error:transmissionError,
      setChoice:setTransmissionChoice,
      save:saveTransmission,
    } : null,
  }) : null, [baseValue, data.vehicleId, installUpgrade, router, saveTransmission, transmissionChoice, transmissionError, transmissionPicker, transmissionState]);

  if (!value) {
    return (
      <div role="status" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "var(--ki-page)", color: "var(--slate-500)", fontSize: 13 }}>
        This vehicle twin is not available for owner use.
      </div>
    );
  }

  return (
    <TwinDataCtx.Provider value={value}>
      <HubRoot />
    </TwinDataCtx.Provider>
  );
}

export function suppressTwinTransmissionWhilePending(data, pending) {
  return pending ? { ...data, transmission:null } : data;
}

export function getFounderTransmissionPickerModel(data) {
  if (!data?.canSelectTransmission || !Array.isArray(data.transmissionOptions) || data.transmissionOptions.length <= 1) return null;
  return {
    current: data.transmission === "automatic" || data.transmission === "manual" ? data.transmission : null,
    options: data.transmissionOptions.filter((option) => option?.value === "automatic" || option?.value === "manual"),
  };
}

export function FounderTransmissionPickerView({ model, choice, state = "idle", error = "", onChoice = () => {}, onSave = () => {} }) {
  if (!model || model.options.length <= 1) return null;
  return (
    <div role="region" aria-label="Transmission fitment" style={{ position:"fixed", zIndex:80, top:12, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", maxWidth:"calc(100vw - 24px)", padding:"9px 12px", borderRadius:12, border:"1px solid var(--ki-line)", background:"var(--ki-card)", boxShadow:"var(--shadow-2)", color:"var(--ink)" }}>
      <label htmlFor="owner-twin-transmission" style={{ fontSize:12, fontWeight:650 }}>
        {model.current ? "Transmission" : "Choose transmission to reveal exact fluid and parts"}
      </label>
      <select id="owner-twin-transmission" value={choice} disabled={state === "saving" || state === "refreshing"} onChange={(event) => onChoice(event.target.value)} style={{ minHeight:34, borderRadius:8, border:"1px solid var(--ki-line)", background:"var(--ki-page)", color:"var(--ink)", padding:"0 28px 0 9px" }}>
        <option value="">Select…</option>
        {model.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button type="button" onClick={onSave} disabled={!choice || choice === model.current || state === "saving" || state === "refreshing"} style={{ minHeight:34, border:0, borderRadius:8, padding:"0 12px", background:"var(--ink)", color:"var(--ki-page)", fontWeight:650, opacity:!choice || choice === model.current ? .45 : 1 }}>
        {state === "saving" ? "Saving…" : state === "refreshing" ? "Refreshing…" : "Save"}
      </button>
      {error && <span role="alert" style={{ flexBasis:"100%", color:"var(--ki-crit)", fontSize:11 }}>{error}</span>}
    </div>
  );
}

/** Executable save state-machine shared by the picker and route-level tests. */
export async function saveFounderTransmission({ fetcher, vehicleId, vehicleRevision, choice, onPendingChange, setState, setError, refresh }) {
  setState("saving");
  onPendingChange(true);
  setError("");
  try {
    const response = await fetcher(`/api/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transmission: choice, expectedUpdatedAt: vehicleRevision }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Could not save the transmission choice.");
    setState("refreshing");
    refresh();
    return true;
  } catch (cause) {
    onPendingChange(false);
    setState("error");
    setError(cause instanceof Error ? cause.message : "Could not save the transmission choice.");
    return false;
  }
}

const OWNER_TWIN_TREE_BUILDERS = {
  challenger(data, catalog) {
    const serviced = servicedFromRecords(data.records, data.miles, data.transmission, data.evaluatedAt);
    const liveTrees = buildTwinTrees(serviced, data.miles, data.transmission, data.evaluatedAt);
    return mergeCatalogEvidenceIntoOwnerTrees(catalog, liveTrees, data.miles);
  },
};

function sameIdentity(catalog, vehicle) {
  return sameTwinVehicleIdentity(catalog.identity, vehicle);
}

/** Build owner context only through an explicitly registered owner builder. */
export function buildOwnerTwinValue(data) {
  const catalog = getTwinByFulfillmentId(data?.fulfillmentId);
  const builder = catalog && OWNER_TWIN_TREE_BUILDERS[catalog.treeResolver];
  if (!catalog?.ownerReady || !builder || !data?.vehicle || !sameIdentity(catalog, data.vehicle)) return null;

  const trees = builder(data, catalog);
  const applicableIssues = (data.issues || []).filter((issue) => !(
    data.transmission === "manual" && issue.id === "dodge-challenger-zf8-trans-2015"
  ));
  const issueById = new Map(applicableIssues.map((issue) => [issue.id, issue]));
  for (const tree of Object.values(trees)) {
    for (const node of Object.values(tree.nodes)) {
      const summary = node.knownIssue?.id ? issueById.get(node.knownIssue.id) : null;
      if (node.knownIssue?.id && !summary) delete node.knownIssue;
      if (!summary) continue;
      node.knownIssue = { ...node.knownIssue, ...summary };
      node.issue = summary.title;
    }
  }
    if (trees.car?.nodes?.[trees.car.root]) {
      trees.car.label = `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model} ${data.vehicle.trim}`.trim();
      trees.car.nodes[trees.car.root] = { ...trees.car.nodes[trees.car.root], label:trees.car.label, sub:"Owner garage vehicle", where:"Your garage" };
      delete trees.car.nodes[trees.car.root].partNo;
      delete trees.car.nodes[trees.car.root].spec;
    }
  const ownerCatalog = filterTwinCatalogForTrees(catalog, trees);
  const nextService = pickNextService(trees, data.miles, data.evaluatedAt);
  const mishimotoInstalled = (data.installedPartNumbers || []).some((partNumber) => partNumber.trim().toUpperCase() === "MMRAD-SRT-15");
  const issues = applicableIssues.map((issue) => issue.id === "dodge-challenger-radiator-failure" && mishimotoInstalled
    ? { ...issue, resolved:true }
    : issue);
  const presentation = buildDemoTwinPresentation(ownerCatalog, {
    trees, miles:data.miles, mode:"owner", recent:data.recent, nextService,
  });
  return {
    vehicle: data.vehicle,
    miles: data.miles,
    trees,
    nextService,
    recent: data.recent || [],
    issues,
    equipped:{ radCore:mishimotoInstalled },
    catalog:ownerCatalog,
    presentation,
    mode: "owner",
  };
}

export { pickNextService };
