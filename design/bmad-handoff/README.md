# Au7o · Design Handoff

Source for the Au7o web + mobile screens shown in the BMAD handoff bundle. Drop these files into your codebase as the starting point for production work.

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
    ├── 01-WebHubAnonymous.jsx       ← DirectionAHub
    ├── 02-WebHubSignedIn.jsx        ← DirectionA3Hub  (+ MaintenanceSchedule, MaintenanceTile)
    ├── 03-WebKnownIssues.jsx        ← KIRevisedIndex / KIRevisedBMWPage / KIRevisedIssueDetail
    ├── 04-MobileHubAnonymous.jsx    ← MobileA2Hub
    ├── 05-MobileHubSignedIn.jsx     ← MobileA3Hub  (+ MobileA3MaintenanceCard)
    └── 06-MobileExtras.jsx          ← MobileKIIndex, MobileKIMake, MobileKnownIssues, MobileDrive, MobileDriveExpanded, MobileBottomDock
```

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
<script type="text/babel" src="screens/_shared.jsx"></script>     <!-- WEB_VEHICLE, Au7oMark, etc. -->

<!-- 4. Whichever screens you need -->
<script type="text/babel" src="screens/01-WebHubAnonymous.jsx"></script>
<script type="text/babel" src="screens/02-WebHubSignedIn.jsx"></script>
```

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
