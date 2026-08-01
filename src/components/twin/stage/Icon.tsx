"use client";
import React from "react";

/**
 * Au7o Icon set
 * --------------------------------------------------------------------------
 * Single-source icon component. All glyphs are 24×24 stroke icons sharing
 * the same stroke-width / linecap so they composite cleanly at any size.
 *
 * Usage:
 *   <Icon name="alert" size={14} />
 *   <Icon name="map" size={18} stroke={1.4} style={{ color: "var(--au7o-blue)" }} />
 *
 * Props:
 *   name    — one of IconName below (required)
 *   size    — px, applied to width + height (default 18)
 *   stroke  — stroke-width (default 1.6)
 *   style   — passes through; use to set `color` (icons inherit currentColor)
 *
 * To add a new icon: extend IconName, add a case to the switch.
 */

export type IconName =
  | "alert"
  // Added for the twin stage: "shield-alert" is the known-issue marker in the
  // status triad (overdue / on track / known issue), "x" closes the tree.
  | "shield-alert"
  | "x"
  | "wrench"
  | "search"
  | "map"
  | "list"
  | "spark"
  | "send"
  | "mic"
  | "car"
  | "chat"
  | "book"
  | "plus"
  | "chevron"
  | "chevron-down"
  | "chevron-up"
  | "settings"
  | "check"
  | "spark2"
  | "pin"
  | "coffee"
  | "fuel"
  | "swap"
  | "users"
  | "info"
  | "more"
  | "user"
  | "calendar"
  | "dollar"
  | "clock"
  | "camera"
  | "paperclip";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 18, stroke = 1.6, style }: IconProps) {
  const s: React.CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    flex: "0 0 auto",
    ...style,
  };
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "alert":
      return <svg style={s} {...common}><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>;
    case "shield-alert":
      return <svg style={s} {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4M12 16h.01"/></svg>;
    case "x":
      return <svg style={s} {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "wrench":
      return <svg style={s} {...common}><path d="M14.7 6.3a4 4 0 0 1 5.66 5.66l-1.42 1.41-5.66-5.66 1.42-1.41Z"/><path d="m13.29 7.71-9.5 9.5a2 2 0 1 0 2.83 2.83l9.5-9.5"/></svg>;
    case "search":
      return <svg style={s} {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "map":
      return <svg style={s} {...common}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>;
    case "list":
      return <svg style={s} {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "spark":
      return <svg style={s} {...common}><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>;
    case "send":
      return <svg style={s} {...common}><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>;
    case "mic":
      return <svg style={s} {...common}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>;
    case "car":
      return <svg style={s} {...common}><path d="M5 17h14M5 17v-4l2-5h10l2 5v4M5 17v2M19 17v2M8 13h8"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>;
    case "chat":
      return <svg style={s} {...common}><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4Z"/></svg>;
    case "book":
      return <svg style={s} {...common}><path d="M4 4v16a2 2 0 0 0 2 2h14V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
    case "plus":
      return <svg style={s} {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "chevron":
      return <svg style={s} {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-down":
      return <svg style={s} {...common}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-up":
      return <svg style={s} {...common}><path d="m6 15 6-6 6 6"/></svg>;
    case "settings":
      return <svg style={s} {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case "check":
      return <svg style={s} {...common}><path d="M20 6 9 17l-5-5"/></svg>;
    case "spark2":
      return <svg style={s} {...common}><path d="M12 3 13.5 9.5 20 11 13.5 12.5 12 19 10.5 12.5 4 11 10.5 9.5 12 3Z"/></svg>;
    case "pin":
      return <svg style={s} {...common}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case "coffee":
      return <svg style={s} {...common}><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8ZM17 8h2a3 3 0 0 1 0 6h-2"/></svg>;
    case "fuel":
      return <svg style={s} {...common}><path d="M3 21h12V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16ZM3 10h12"/><path d="M15 10v2a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2"/></svg>;
    case "swap":
      return <svg style={s} {...common}><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></svg>;
    case "users":
      return <svg style={s} {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "info":
      return <svg style={s} {...common}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case "more":
      return <svg style={s} {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    case "user":
      return <svg style={s} {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "calendar":
      return <svg style={s} {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "dollar":
      return <svg style={s} {...common}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case "clock":
      return <svg style={s} {...common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "camera":
      return <svg style={s} {...common}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "paperclip":
      return <svg style={s} {...common}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
    default:
      return null;
  }
}

/* If you don't use TypeScript, the same file works as plain JSX —
   delete the `type IconName` and `interface IconProps` blocks and
   strip the `: IconProps` annotation. */
