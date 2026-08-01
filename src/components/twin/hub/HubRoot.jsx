"use client";
/* eslint-disable */
/**
 * Hub entry point. Owns the one piece of state the two hub designs share:
 * whether we're in the normal hub or the full-screen "minimal" view from
 * `design/au7o (11)`.
 *
 * The full-screen control inside the normal hub's stage calls enterMinimal();
 * the collapse icon in the minimal view's top bar calls back out. Both designs
 * stay mounted-on-demand rather than one being a CSS treatment of the other,
 * because the minimal view fits the car to a measured box — a stretched version
 * of the normal stage would slide the hotspots off the car.
 */
import React from "react";
import { HubTechTree } from "./Hub";
import { HubMinimal } from "./HubMinimal";
import { useTheme } from "./hub-shared";
import { HubViewCtx } from "./hub-view";

export function HubRoot() {
  const [mobile, setMobile] = React.useState(() => (typeof window === "undefined" ? false : window.innerWidth < 860));
  const [minimal, setMinimal] = React.useState(false);
  const tc = useTheme();

  React.useEffect(() => {
    const on = () => setMobile(window.innerWidth < 860);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const ctx = React.useMemo(() => ({ enterMinimal: () => setMinimal(true) }), []);

  return (
    <HubViewCtx.Provider value={ctx}>
      {minimal
        ? <HubMinimal tc={tc} mobile={mobile} onExit={() => setMinimal(false)} />
        : <HubTechTree />}
    </HubViewCtx.Provider>
  );
}
