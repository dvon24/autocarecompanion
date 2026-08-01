"use client";
/* eslint-disable */
/**
 * The playground: car stage ⇄ tech tree in one frame.
 *
 * Ported from HHPlayground in `design/au7o (6)`. Clicking a hotspot swaps the
 * stage for that part's tech tree; closing the tree returns to the car. This is
 * the "try it" moment the reservation is testing demand for — so it sits above
 * the reserve card, never below it.
 *
 * The design's Tweaks are frozen to their shipped defaults (hotspots entry
 * style, 65,000 mi demo Challenger).
 */
import React from "react";
import { TwinStage } from "./TwinStage";
import { TechTree, TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT } from "./TechTree";

const DEMO_MILES = 65000;

function useNarrow(bp = 760) {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return narrow;
}

export function TwinPlayground({ height = 700 }) {
  const narrow = useNarrow();
  const [branch, setBranch] = React.useState(null);
  const [startNode, setStartNode] = React.useState(null);
  const [mode, setMode] = React.useState("hotspots");
  const [note, setNote] = React.useState(null);
  const say = (text) => setNote({ text, key: String(note?.key || "") + "x" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--paper-line)",
          boxShadow: "var(--shadow-2, 0 18px 40px rgba(11,18,32,.12))",
          background: "var(--ki-page)",
        }}
      >
        {branch ? (
          <div style={{ height: `min(${height}px, 88vh)`, display: "flex", flexDirection: "column" }}>
            <TechTree
              branch={branch}
              vertical={narrow}
              compact={narrow}
              detailMode={narrow ? "sheet" : null}
              setBranch={(b) => { setBranch(b); setStartNode(null); }}
              startNode={startNode}
              miles={DEMO_MILES}
              onClose={() => { setStartNode(null); setBranch(null); }}
              say={say}
            />
          </div>
        ) : (
          <TwinStage
            mode={mode}
            setMode={setMode}
            mobile={narrow}
            hideNote
            onOpen={(hot) => {
              setStartNode(TT_NODE_FOR_HOTSPOT[hot] || null);
              setBranch(hot === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[hot]);
            }}
          />
        )}
      </div>

      {note && (
        <div
          className="hl-bubble"
          style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "11px 13px", borderRadius: 14, background: "#fff", border: "1px solid var(--paper-line)" }}
        >
          <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width: 19, height: 19, flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--ink)" }}>{note.text}</div>
        </div>
      )}
    </div>
  );
}
