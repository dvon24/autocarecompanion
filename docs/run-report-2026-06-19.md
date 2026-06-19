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

## 5. Overnight drill — known-issues (BIG night: +110 published)
- **Wave 1: +9** (rate-limited mid-verify): Ford Explorer SYNC3, Escape PTU, Subaru Outback A/C condenser, 6× Hyundai Tucson (2 fire recalls).
- **Wave 2: +65** (ran clean) across 12 models: Honda Pilot/Odyssey, Toyota Highlander/Sienna, Ford F-150, Silverado, Jeep Grand Cherokee, Mazda CX-5, Hyundai Santa Fe, Subaru Forester, Nissan Sentra, Kia Sportage.
- **Wave 3: +36** (rate-limited again, partial): Honda Civic (A/C warranty ext, infotainment TSB, EPB recall 16V-725, sticky-steering recall 24V-744), Hyundai Elantra (theft vuln, pretensioner recall, phantom AEB), Kia Sorento (3 fire/headlight recalls), Chevy Traverse, Ram 1500, Nissan Rogue. 1 held by dead-URL gate (Ram uConnect) — left pending_review.
- All citation-backed, URL-gate enforced, `engines` populated so the new cross-link gate links them correctly.
- **+4 new DTC reference codes** (P0107/P0108/P0113/P0705).
- **New running total: ~5,896 published known issues.**
- ⚠️ **Duplicates to archive** (popular models re-found existing issues — the known dedupe-gate gap):
  - `chevrolet-silverado-1500-6-2l-l87-v8-connecting-rod-crankshaft-failure` (dupes existing L87 recall)
  - `hyundai-santa-fe-theta-ii-gdi-connecting-rod-bearing-failure-engine-seizure` (dupes `…theta-ii-seizure-2010`)
  - `honda-civic-c-condenser-compressor-refrigerant-leak` (dupes 2 existing Civic A/C issues)
  - `chevrolet-traverse-9-speed-automatic-torque-converter-shudder-low-speed-shifts` (dupes `…9speed-shudder-2018`)
  - Borderline (probably keep): `chevrolet-traverse-excessive-oil-consumption-3-6l-lfy`, `nissan-rogue-cvt-overheating…` — more specific root-cause framings of existing general issues.
  - **Process note:** deepening already-covered *popular* models has hit diminishing returns + dupes. Next waves should target genuinely thin/underserved models or the DTC half, not popular re-deepening.

## 6. Depth Phase 1 — SHIPPED (prompt half)
The investigation confirmed the cheap path and I shipped it (`265411e`): a **SCALE REFERENCE** block in the vision prompt — a coin/card in frame becomes a real pixel-per-mm ruler for in-plane sizes (panel gap, rust hole, pad height) + an in-app penny/quarter tread pass-fail. **Inert until a reference is actually in frame**, so zero behavior change on normal photos, and it keeps the honesty guardrails. The **"tell users to add a coin" UX nudge is deliberately NOT shipped** — it changes the capture flow, your call. Investigation also confirmed: do NOT feed depth-maps as images (measured to *hurt* accuracy).

---

## Suggested next moves (your calls)
1. **Try /camera-spike on your phone** — decide if the live-guidance feel is worth the full Live AI Mechanic build.
2. **Approve the cross-link DB clean** — `node scripts/_audit-clean-crosslinks.js --apply` strips the 4,702 impossible pairs from the DB (render already hides them; this cleans the source). One word and I'll run it.
3. **Archive the 2 exact-dupe issues** (slugs above) — quick cleanup.
4. **Scale-reference UX nudge** — add the "drop a coin in the groove for a real reading" hint to the capture sheet to actually activate Depth Phase 1.
5. **Wave 3 research** — the pipeline's humming again; more models any night.
