"use client";
/**
 * One channel that decides whose car the twin is showing.
 *
 * The twin hub was built as a no-account demo: a 2015 Challenger SRT 392 at
 * 65,000 miles, with every part's service state invented so the screen would
 * look interesting. Devon actually owns that exact car, so the art, the part
 * numbers and the fitment are already right for him — the only thing that was
 * ever fake is the STATE (his odometer, what he has actually serviced, and
 * which known issues apply at his mileage).
 *
 * Rather than fork the hub into demo and live copies, both read from here:
 *
 *   • no provider  -> useTwinCtx() is null, every hook falls back to the demo
 *                     constants below, and /demo/hub behaves exactly as before.
 *   • provider     -> the live hub supplies a real vehicle, a real odometer and
 *                     trees whose servicedAt came from real MaintenanceRecord
 *                     rows, so the same components render the owner's car.
 *
 * This file deliberately imports nothing from the stage or the hub. Those
 * modules import it, so anything flowing the other way would be a cycle.
 */
import React from "react";

/** The demo car. Lives here, not in TwinStage, so the fallback has no cycle. */
export const TWIN_DEMO_MILES = 65000;
export const TWIN_DEMO_VEHICLE = {
  year: 2015, make: "Dodge", model: "Challenger", trim: "SRT 392", engine: "6.4L V8 HEMI",
};

export const TwinDataCtx = React.createContext(null);

export function useTwinCtx() {
  return React.useContext(TwinDataCtx);
}

/** True when a real owner's data is driving the screen. */
export function useTwinLive() {
  return !!React.useContext(TwinDataCtx);
}

export function useTwinVehicle() {
  const ctx = React.useContext(TwinDataCtx);
  return (ctx && ctx.vehicle) || TWIN_DEMO_VEHICLE;
}

export function useTwinMiles() {
  const ctx = React.useContext(TwinDataCtx);
  return ctx && typeof ctx.miles === "number" ? ctx.miles : TWIN_DEMO_MILES;
}

/**
 * The tree set to render. `fallback` is the module-level TT_TREES that the
 * caller already imported — passed in rather than imported here to keep this
 * module a leaf.
 */
export function useTwinTrees(fallback) {
  const ctx = React.useContext(TwinDataCtx);
  return (ctx && ctx.trees) || fallback;
}

/** Real known issues for this vehicle, newest-first. Empty in the demo. */
export function useTwinIssues() {
  const ctx = React.useContext(TwinDataCtx);
  return (ctx && ctx.issues) || [];
}

/** The next service actually coming due, or null. Demo renders its own card. */
export function useTwinNextService() {
  const ctx = React.useContext(TwinDataCtx);
  return (ctx && ctx.nextService) || null;
}

/** Real recent chat threads. Empty in the demo, which renders its own sample. */
export function useTwinRecent() {
  const ctx = React.useContext(TwinDataCtx);
  return (ctx && ctx.recent) || null;
}

/** "Good morning/afternoon/evening" — the hub greets by time of day. */
export function greetingFor(date) {
  const h = (date || new Date()).getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
