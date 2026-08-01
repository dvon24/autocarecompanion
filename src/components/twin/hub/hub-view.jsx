"use client";
/**
 * Shared "which hub view am I in" channel.
 *
 * Exists purely to keep the imports one-way: HubMinimal imports chrome from
 * Hub, so Hub must NOT import HubMinimal. HubRoot owns the state and both
 * views read the toggle from this context instead.
 */
import React from "react";

export const HubViewCtx = React.createContext({ enterMinimal: null });

export function useHubView() {
  return React.useContext(HubViewCtx);
}
