"use client";
import React from "react";
import { createPortal } from "react-dom";
import { ServiceReview } from "../maintenance/ServiceReview";
import { useTwinOwnerActions, useTwinVehicle, useTwinMiles } from "./twin-context";

/** Separate from chat text: receipt content never enters an assistant tool turn. */
export function TwinServiceEntry({ receipt = false }) {
  const owner = useTwinOwnerActions();
  const vehicle = useTwinVehicle();
  const mileage = useTwinMiles();
  const [open, setOpen] = React.useState(false);
  const dialog = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const focusable = () => [...(dialog.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]') || [])];
    focusable()[0]?.focus();
    const contain = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
      if (event.key !== 'Tab') return;
      const items = focusable(); if (!items.length) { event.preventDefault(); return; }
      if (!dialog.current?.contains(document.activeElement) || (event.shiftKey ? document.activeElement === items[0] : document.activeElement === items.at(-1))) {
        event.preventDefault(); (event.shiftKey ? items.at(-1) : items[0])?.focus();
      }
    };
    window.addEventListener('keydown', contain, true);
    return () => { window.removeEventListener('keydown', contain, true); if (previous?.isConnected) previous.focus?.(); };
  }, [open]);
  React.useEffect(() => setOpen(false), [owner?.vehicleId]);
  if (!owner?.vehicleId) return null;
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={receipt ? "Upload service document" : "Log completed service"} style={{ minHeight: 34, padding: "6px 9px", border: "1px solid var(--ki-line)", borderRadius: 9, background: "var(--ki-card)", color: "var(--ink)", fontSize: 11, cursor: "pointer" }}>{receipt ? "Upload" : "Log service"}</button>
    {open && createPortal(<div ref={dialog} role="dialog" aria-modal="true" aria-label="Service review" onClick={event => event.stopPropagation()} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(11,18,32,.65)", overflowY: "auto", padding: "max(12px, env(safe-area-inset-top)) 12px 24px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ width: "min(680px,100%)", margin: "auto 0" }}><ServiceReview key={owner.vehicleId} vehicleId={owner.vehicleId} uploadFirst={receipt} vehicleLabel={[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ")} currentMileage={mileage} onCancel={() => setOpen(false)} onSaved={() => owner.refresh?.()} /></div>
    </div>, document.body)}
  </>;
}
