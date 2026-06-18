# Overnight run report — morning of 2026-06-19

## TL;DR
A big photo/video session + the standing overnight drill. Everything below is **deployed** (`ca96cec` on main). Two research waves were heavily **subscription-rate-limited mid-verify**, so yields are partial — but every published row is fully verified (persist scripts are AI-free).

---

## 1. Coolant bug — FIXED end-to-end (your test)
Your "is this the right coolant?" failure had **3 compounding causes**, all fixed (`cbac796`):
- The model's `searchQuery` was dropped before the vendor resolver (a "side channel" never wired up) → links fell back to bare part name. Now threaded through.
- No FLUIDS playbook in the prompt → model punted ("what's the part number?"). Added: read the label, return it as a buyable part **by spec**, never ask for a part number.
- Coolant/brake/trans fluid specs were never injected into the prompt → now they are, so "is this right?" can be answered.
- The **hub** capture sheet had no caption box (only /diagnose did) → you literally couldn't ask the question from the hub. Added an optional caption, threaded through both hub handlers.

## 2. Photo/video audit — 9 more verified fixes shipped (`cbac796`)
From a 6-dimension adversarial audit (25 verified findings). Shipped the high-confidence set: mobile error-screen dead-end fixed (was a black screen on any failure), urgency↔condition consistency, wrong-vehicle parts lose buy-buttons, non-car photos no longer render a shoppable card, video audio-decode timeout + length cap, burst-429 shape, TPMS routing, sticky capture CTA, condition-synonym normalization.
**Deferred (your call):** multi-photo from the hub, related-issue dead-link hrefs, OpenAI transient-retry, hub keepPhoto consent, non-Amazon affiliate tags (no IDs yet).

## 3. Cross-link bug you caught — FIXED (`ca96cec`)
Hemi/MDS tick showing "also affects: Acura MDX, Acura TL, Audi Q7" (none have a Hemi). Cause: cross-links kept on a shared **generic DTC** (P0300) or a fuzzy embedding match (MD**S**≈MD**X**). Now a **cross-make** "also affects" requires a **specific shared engine family** (hemi/ea888/b58…); same-make spread unchanged; real cross-brand platforms still link.
**Still open (you said "others could be wrong"):** the render is fixed, but the stored `relatedIssueIds` in the DB still hold the bad pairs. A deeper fix = re-run embeddings with a stricter structural pre-filter + an audit workflow to flag platform-mismatched cross-links and any mis-attributed issues. Logged in memory.

## 4. Camera spike — BUILT, try it on your phone (`ca96cec`)
**https://au7o.io/camera-spike** (noindex). Live rear camera → on-device object detection (MediaPipe, runs on your phone, image never leaves it) → box + label on the live feed + "move closer / hold steady / framed ✓" coaching + a shutter that goes green when the shot's good. Falls back to a sharpness/framing coach if the model can't load on your device. This is the foundation of the **Live AI Mechanic** direction.

## 5. Overnight drill (known-issues + DTC, paired)
- **+9 known issues published** (100% URL-gate pass, 0 dupes): Ford Explorer SYNC3 (TSB), Ford Escape PTU failure, Subaru Outback A/C condenser, **6× Hyundai Tucson** (incl. 2 fire recalls + phantom braking).
- **+4 new DTC reference codes** (P0107, P0108, P0113, P0705); 17 others already existed.
- Both waves hit the subscription rate-limit mid-verify (the known limiter issue) → partial yield. Re-running on a fresh limit window would recover the dropped ~50 Toyota/Honda/Jeep/Nissan/Chevy candidates.

## 6. Depth investigation — plan ready
Confirmed the cheap path: **Phase 1 = scale-reference prompt** (coin/card → real metric tread/gap, **no GPU**, ~$0, ships in an afternoon). It explicitly warns AGAINST feeding depth-maps as images (measured to *hurt* accuracy). Full phased plan saved to the task output; folds into the Live AI Mechanic roadmap.

---

## Suggested next moves
1. **Try /camera-spike on your phone** — decide if the live-guidance feel is worth the full build.
2. **Re-run the two research waves** on a fresh rate-limit window (recover the ~50 dropped candidates).
3. **Cross-link deeper audit** — re-embed with structural pre-filter + flag other impossible matches.
4. **Depth Phase 1** — the coin/card scale-reference prompt (cheap metric unlock).
