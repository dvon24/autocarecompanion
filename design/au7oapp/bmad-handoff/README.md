# Au7o · Design Handoff

Source for the Au7o web + mobile screens shown in the BMAD handoff bundle. Drop these files into your codebase as the starting point for production work.

---

## Newest in this drop — snap-first diagnosis (`14-SnapDiagnosis.jsx`)

The Cal-AI-style funnel: **button → camera in ONE tap**, photo/video → processing → an annotated result drawn **on the real photo**. Self-contained file (no other screen required); pair the result with the hub or use it standalone.

```
  Mobile:  CaptureCamera ──▶ CaptureProcessing ──▶ AnnotatedDiagnosis (result)
  Desktop: upload-first ──▶ DesktopYmmtPrompt (YMMT optional, AFTER the photo) ──▶ result
```

- **`CaptureCamera({ mode, knownCar, scansLeft })`** — dark viewfinder over the live image. Center **vehicle badge** (pre-filled when `knownCar`, else “Add your car”), a **Diagnosis | Parts** mode toggle above the shutter, a **separate** “Browse 4,500 known issues” entry (browse ≠ capture), a **scans-left** pill (free tier = 1/month), gallery+plus, and a shutter that is *tap = photo, hold = video (15s)*. `mode="parts"` switches the hint + active toggle.
- **`CaptureProcessing({ ymmt })`** — captured frame + sweeping scan-line + live “thinking” logs (*matching 4,500 known issues… cross-referencing TSBs…*). When `ymmt` (cold/anon user, vehicle unknown) the **YMMT sheet slides up as productive waiting** — year scroll-strip, big Make/Model targets, optional Trim — so the form resolves in the gap *before* the expensive AI call, not as an upfront gate. Pass `ymmt={false}` when the car is already known (from a Known-Issues URL or the user’s garage) to show just the thinking logs.
- **`AnnotatedDiagnosis({ embedded })`** — the result: a full-bleed real photo with **pulsing detection pins** and a **floating frosted callout** (title · finding · SKU · status badge) tethered to the active pin by a connector line, then the part chips, Au7o’s analysis, and the **Job Kit** (priced to the one aging item). `embedded` drops the back-header when you render it as a turn inside the hub.
- **`AU7O_DETECTIONS`** — the per-photo detection array (the demo uses the Challenger photo). Each entry: `x/y` = pin position (image %), `card`/`anchor` = callout + tether position, plus `status` (ok/warn/info), `title`, `finding`, `desc`, `sku`, `badge`. **Swap this with your vision model’s bounding-box output** — it is the visual contract for what the API returns, not real fitment data.
- **`DesktopYmmtPrompt()`** — desktop is upload-first; this light prompt offers to lock the vehicle **after** the photo is in, with a **Skip — diagnose anyway** (YMMT is optional on desktop). Wire “Diagnose” into the same flow as every other entry point.
- **Still to design:** the **paywall-intercept** for the 2nd+ free scan (fires *before* the AI spend: snap → paywall → pay → YMMT-if-unknown → diagnose) and the **permission-denied / not-a-part / offline** fallbacks. Ask when you want them.
- Depends only on `Icon` + `brand/challenger-wheel.jpg` + `brand/au7o-mascot.png`.

---

## New in this drop — home, onboarding, the full diagnosis flow & pricing

**How a new user travels through the product (the integration target):**

```
  Home ──▶ "Try a photo diagnosis" ──▶ enter vehicle (YMMT) ──▶ capture/upload ──▶ HUB (diagnosis lands inline)
   │                                                                                    ▲
   └────────── "Browse known issues" (free, no account) ──▶ Known Issues ───────────────┘
  New user ──▶ Onboarding ──▶ HUB
```

The **hub is the destination** for every path. Mobile = `MobileA3Hub` (05), desktop = `DirectionA3Hub` (02). Don't build a separate "diagnosis result" page — the diagnosis is a turn *inside* the hub conversation (see below).

- **Home pages (08 + 10).** `MobileHome` (08) and `HomePageMerged` (10) replace au7o.io's home. They lead with the photo-diagnosis hero **and keep the vehicle-picker / known-issues tool** as the primary free utility — don't drop the picker, it's the SEO + anonymous-value front door. Desktop primary CTA is **"Upload a photo to diagnose"** (no camera on desktop); mobile is **"Try a photo diagnosis."**
- **Onboarding (09).** First-run intro. `MobileOnboarding` takes a `step` prop (1 Welcome · 2 How it works · 3 Add your car); `DesktopOnboarding` is a welcome modal rendered over a dimmed home. **After onboarding, route the user into the hub** (`MobileA3Hub` / `DirectionA3Hub`). Every step offers a no-account "just browse" escape.
- **The diagnosis lands IN the hub, not on a result page.** `MobileA3Hub` (05) and `DesktopHubChat` (11) take a `diagnose` / `analyzing` prop. On mobile, pass `diagnose="analyzing"` then `diagnose="result"` to `MobileA3Hub` — it appends `MobileA3DiagnoseTurn` (photo bubble → inline analyzing checklist → match card) to the bottom of the *existing* conversation, and the result references the user's real maintenance schedule ("bundle it with your overdue brake fluid above"). This is the canonical pattern: the analysis is a conversation turn, so the user can keep chatting.
- **Mobile capture vs. desktop upload (07 + 11).** Mobile flow: `DiagnoseVehicleEntry` (YMMT) → `DiagnoseCamera` → land in `MobileA3Hub` with `diagnose`. Desktop flow: `DesktopUploadDiagnose` (YMMT + drag-drop upload, `uploaded` prop) → `DesktopHubChat` (`analyzing` prop). Both end in the hub with the photo analyzed inline.
- **Pricing + Stripe (12).** Three tiers live in one array — **`AU7O_TIERS`** (Free $0 / Plus $14.99 / Pro $24.99). Edit that array to change names/prices/features everywhere. `PricingTiers` (desktop grid, `onSelect(tier)` callback) and `MobilePricing` (stacked) render it; selecting a paid tier opens **`StripeCheckout tier={…}`** — the Stripe-styled checkout sheet (dark order summary + card form). Wire `onSelect` to your real Stripe Checkout / Payment Element; the sheet is the visual contract, not a live integration.
- **Promote diagnosis on Known Issues (03).** KI pages are organic-search landings — users arrive mid-intent and miss the homepage, so the diagnose feature is surfaced *there*. `KIRevisedIndex` now has a **"By photo" tab** (`PhotoDiagnosePanel`, marked NEW) accepting an `initialTab` prop; `KIRevisedIssueDetail` opens with an inline **`ConfirmWithPhotoCTA`** at the peak "is this my problem?" moment; **`KIDiagnoseBanner`** is a lighter dismissible alternative. Ship the tab + CTA together. All three are drop-in — point their upload/CTA at the same hub diagnose flow as every other entry point.
- **Account page (13).** `AccountPage` (desktop) + `MobileAccount` (mobile) match the real au7o.io/account: a **Beta** read-only notice, **My Garage** (nicknamed vehicles), **Recent Diagnoses** (empty state), **Recent Chats** (typed photo/video/text rows), **Subscription** (Free + upgrade to Plus/Pro, driven by `AU7O_TIERS`), **Emails**, **Privacy & Data** (GDPR: AI-processing toggle, export, delete), and a **site map** footer. Loads after `11` (DeskNav) and `12` (AU7O_TIERS). Subscription upgrade → open `StripeCheckout`; Manage/Change/privacy buttons are stubs for your backend. (Emoji from the live page were swapped for monochrome icons to match the system.)

---

## What's in here

```
bmad-handoff/
├── README.md                 ← you are here
├── styles/
│   ├── tokens.css            ← color, type, radii, shadow tokens
│   └── utilities.css         ← .eyebrow, .mono, .chip, .btn-outline, bubbles, etc.
├── components/
│   └── Icon.tsx              ← single-source icon set (TS-friendly; works as JSX too)
├── brand/
│   └── au7o-mascot.png       ← Au7o face (used in chat avatar slot)
└── screens/
    ├── _shared.jsx           ← WEB_VEHICLE, RECENT_THREADS, Au7oMark, AmbientBackground
    ├── _diagnose-visuals.jsx ← SHARED: HeroEngineBay, DiagnoseHeroPhone, ValueRow, DIAGNOSE_VALUE (load before 05/10/11)
    ├── 01-WebHubAnonymous.jsx        ← DirectionAHub
    ├── 02-WebHubSignedIn.jsx         ← DirectionA3Hub  (+ MaintenanceSchedule, expandable ServiceRow → ServiceDetailPanel, LogCompletionForm/Done)
    ├── 03-WebKnownIssues.jsx         ← KIRevisedIndex / KIRevisedBMWPage / KIRevisedIssueDetail  (+ PhotoDiagnosePanel, ConfirmWithPhotoCTA, KIDiagnoseBanner)
    ├── 04-MobileHubAnonymous.jsx     ← MobileA2Hub
    ├── 05-MobileHubSignedIn.jsx      ← MobileA3Hub  (+ MobileA3MaintenanceCard, MobileA3DiagnoseCard, MobileA3DiagnoseTurn)
    ├── 06-MobileExtras.jsx           ← MobileKIIndex, MobileKIMake, MobileKnownIssues, MobileDrive, MobileDriveExpanded, MobileBottomDock
    ├── 07-MobileDiagnose.jsx         ← DiagnoseVehicleEntry, DiagnoseCamera, DiagnoseAnalyzing, DiagnoseResult
    ├── 08-MobileHome.jsx             ← MobileHome
    ├── 09-Onboarding.jsx             ← MobileOnboarding, DesktopOnboarding
    ├── 10-HomepageAndFeatures.jsx    ← HomePageMerged, FeaturesPage
    ├── 11-DesktopDiagnose.jsx        ← DesktopUploadDiagnose, DesktopHubChat, DeskNav
    ├── 12-Pricing.jsx                ← AU7O_TIERS, PricingTiers, MobilePricing, StripeCheckout
    ├── 13-Account.jsx                ← AccountPage, MobileAccount  (needs DeskNav from 11 + AU7O_TIERS from 12)
    └── 14-SnapDiagnosis.jsx          ← AU7O_DETECTIONS, CaptureCamera, CaptureProcessing, AnnotatedDiagnosis, DesktopYmmtPrompt  (self-contained snap-first flow)
```

---

## Also included (earlier drops)

- **Snap-to-diagnose (`07-MobileDiagnose.jsx`).** Camera-first triage flow: `DiagnoseCamera` (dark viewfinder with live-detect chip + corner reticle, photo/video/voice-note capture) → `DiagnoseAnalyzing` (scan sweep + working-checklist bottom sheet) → `DiagnoseResult` (known-issue match card with confidence %, "what I spotted" evidence, severity/time/cost strip, recommended part + order CTA, and a "not quite right?" escalation row). Entry points: the blue **camera button** in the mobile composer and the **`MobileA3DiagnoseCard`** that now sits under the maintenance card in `05`.
- **Log a completed service — web + mobile.** On web (`02`), maintenance rows are expandable (`DirA3ServiceRow` → `ServiceDetailPanel`); the primary action opens **`LogCompletionForm`** (odometer reading defaulting to current mileage with one-tap "use current", DIY/shop toggle, date, cost, note) → **`LogCompletionDone`** with the reset next-due interval + Undo. The mobile card (`05`) mirrors this: timeline rows are tappable, expanding to **`MobileServiceDetail`** (time/DIY/shop facts, parts needed, "Mark done + log mileage") → a compact odometer form → **`MobileLogDone`** (row flips to green DONE, shows reset next-due + "Up to date"). This is the canonical pattern for marking any service complete and re-baselining its interval.

---

## Viewport targets

| Surface          | Target viewport       | Notes |
|------------------|-----------------------|-------|
| Web (desktop)    | 1440 × 900 (min 1280) | Sidebar 280px fixed; conversation column flexes |
| Web (laptop)     | 1280 × 800            | Same layout, denser |
| Mobile           | 390 × 844 (iPhone 14) | Safe-area insets handled by the device frame, not the components |
| Mobile (small)   | 375 × 812             | Same components — content scrolls |

All screens are designed mobile-first inside their viewport — they do **not** currently include cross-breakpoint responsive logic. Use the web screens for >= 768px and the mobile screens for < 768px.

---

## Import map (suggested)

If you wire this up in a Vite/Next/CRA project, here's the order things expect:

```html
<!-- 1. Tokens FIRST, so utilities + components can reference vars -->
<link rel="stylesheet" href="styles/tokens.css">
<link rel="stylesheet" href="styles/utilities.css">

<!-- 2. React (or import via your bundler) -->
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>

<!-- 3. Icon set + shared primitives -->
<script type="text/babel" src="components/Icon.tsx"></script>     <!-- TS strip; bundler will compile -->
<script type="text/babel" src="screens/_shared.jsx"></script>            <!-- WEB_VEHICLE, Au7oMark, etc. -->
<script type="text/babel" src="screens/_diagnose-visuals.jsx"></script>  <!-- HeroEngineBay, DiagnoseHeroPhone, ValueRow — needed by 05/10/11 -->

<!-- 4. Whichever screens you need -->
<script type="text/babel" src="screens/01-WebHubAnonymous.jsx"></script>
<script type="text/babel" src="screens/02-WebHubSignedIn.jsx"></script>
```

> **Load order that matters:** `_diagnose-visuals.jsx` defines `HeroEngineBay` / `DiagnoseHeroPhone` / `ValueRow`, which `05` (the hub diagnosis turn), `10` (home + features hero), and `11` (desktop upload/result) all reference. Load it **before** those three. `12-Pricing.jsx` must load before `10` (FeaturesPage renders `PricingTiers`).

In a real codebase, convert the global `Object.assign(window, {...})` exports at the bottom of each file to ES module exports:

```js
// before (handoff form)
Object.assign(window, { DirectionA3Hub, DirA3MaintenanceSchedule });

// after (production form)
export { DirectionA3Hub, DirA3MaintenanceSchedule };
```

---

## Conventions to preserve

These are intentional, not accidents — keep them when porting:

- **Tokens, never raw colors.** Every color reference goes through `var(--paper)`, `var(--au7o-blue)`, etc. The four palettes (paper, ink, slate, semantic) cover everything.
- **Mono for numbers.** Mileage, money, IDs, time, eyebrow caps → `class="mono"`. Sans for prose. The visual rhythm of the product depends on this.
- **Eyebrow above headings.** Small-caps label identifying *what kind of content* the heading introduces. See `.eyebrow` in `utilities.css`.
- **Status dots for safety.** Three colors only: `.status-dot.ok` / `.warn` / `.crit`. Don't introduce a fourth.
- **Au7o speaks in `.bubble-au7o`, the user in `.bubble-user`.** The asymmetric border-radius is the read.
- **Cards have hairline borders, not shadows.** Use `border: 1px solid var(--paper-line)` + `--shadow-1` for subtle lift. Avoid heavy shadows except on floating composers (`--shadow-2`) and modals (`--shadow-3`).

---

## Known caveats

- **Babel-in-browser only.** The handoff bundle uses `<script type="text/babel">` for fast iteration. Real builds should run JSX through a proper bundler.
- **Icon.tsx exports a TypeScript type.** If you're plain JSX, delete the `IconName` type and `: IconProps` annotation — the file note at the bottom calls this out.
- **`_shared.jsx` defines globals (`WEB_VEHICLE`, `RECENT_THREADS`).** When converting to modules, export them and import where used (every screen file references at least `WEB_VEHICLE` and the icon set).
- **No internationalization.** All strings are inline English. Wrap with your i18n primitive on the way into production.
- **`brand/au7o-mascot.png`** is referenced by relative path (`brand/au7o-mascot.png`) inside the chat reply components. Update those paths when you move the asset to your asset pipeline.

---

## Questions during integration

- Tokens that don't fit your existing system → diff against `styles/tokens.css` and let me know which ones conflict; we'll reconcile.
- Components that need to compose with your existing button/card primitives → swap the implementation, keep the visual contract (border, radius, padding).
- Anything ambiguous in the conversation patterns (when does Au7o respond automatically vs. wait for a prompt?) → see the `02-WebHubSignedIn.jsx` greeting block + the proactive maintenance reply for the canonical pattern.
