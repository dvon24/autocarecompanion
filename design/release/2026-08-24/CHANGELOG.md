# Au7o — release 2026-08-24

Everything changed on August 24, 2026. Paths are relative to the project root; the copies in
this folder mirror that structure, so they drop back in place as-is.

## Hub tech tree
`src/web/hub-techtree.jsx` · `src/web/hub-minimal.jsx` · `src/web/tech-tree.jsx` · `src/web/tt-schedule.jsx` · `Au7o Hub Tech Tree.html`

- **Next-service life bars.** The sidebar card lists three parts with a bar that drains as the
  maintenance window runs down — green while healthy, orange under 50% remaining, red under 22%,
  a short red sliver once the window is spent. Each row states its source: the car's oil-life
  monitor where one exists, the odometer reading otherwise. The list always keeps one still-open
  window so the gauge reads as a gauge.
- **Transmission branch** beside Engine: transmission fluid (ATF+8 / ZF Lifeguard 8, $199.50 fill),
  pan & filter (bonded unit, $184.00), fill plug seal — all past due at 60,000 mi on a 65,000 mi car.
  Reached from the sidebar and the system rail. No car marker: there is no glow render for it.
- **"Everything to order"** — one parts list across the whole car (every stop the odometer has
  passed plus the next one), deduped, with part numbers, vendors, have-it checkboxes, copy-list and
  open-all-links. Entry points: the next-service card and a pill in the schedule view.
- New asset: `assets/part-transmission.png` (+ thumb).

## Survey emails — one per twin
`Au7o Survey Email - Camaro ZL1.html` · `- Lincoln Nautilus.html` · `- Nissan Murano.html` · `- Volvo XC90.html`

Each carries its own hero render, paint name, mileage and masthead tag. Camaro uses Summit White —
the Riverside render has a teal patch on the hood.

**Before sending:** upload the hero image to your email tool's library and replace the local `src`.
A project path 404s for every recipient.

## Hero loops — recordable GIF sources
`Au7o Email Loop - Camaro ZL1.html` · `- Lincoln Nautilus.html` · `- Nissan Murano.html` · `- Volvo XC90.html`

The Challenger email's animation, rebuilt per car at that car's own marker positions: cursor lands
on the front wheel, the wheel lights, the tech tree slides in. Screen-record one cycle and export at
520 px wide; each email's HTML comment names the GIF filename to drop in.

## Homepage hero
`src/web/hero-twins.jsx` (new) · `src/web/home-hero.jsx` · `Au7o Homepage Hero.html`

- The Split layout's stage now rotates through the twins — Challenger, Nautilus, Murano — with dots
  and arrows underneath. Auto-advances every 9s until you steer it, then stops.
- The Challenger frame is unchanged: same six hotspots, same clicks into the tech tree. The other
  twins hover-highlight their own parts and say the trees are in progress rather than opening
  Challenger data under another body.
- Frame sides fade, so renders cropped differently car to car show no cut edge.
- Camaro and XC90 are held out of the rotation, commented in place, pending render QC.

## Admin
`Au7o Admin.html`

Part glows in the twin cards and the live stage are masked to a pool around their own marker, so a
glow render whose backdrop doesn't match its base can't reveal its own frame edge. X-ray layers
(radiator, cabin filter, airbox) are excluded — those are meant to replace the whole frame.

## Fix worth noting
The first version of that mask used `radial-gradient(circle 24% …)`. A `circle` radius may not be a
percentage, so browsers dropped the declaration silently and the mask did nothing. It is now
per-axis `ellipse`, sized off each twin's aspect ratio (36% on the 3:2 renders, 43% on 16:9) so the
pool stays round.

## Still open
- "See the full hub" always lands on the Challenger. A twin-preview state (`?car=…` → that car's
  photo with "mapping in progress" per system) is designed but unbuilt.
- Front-wheel glow coverage on the Camaro is 4 of 11 colorways; the other seven need renders.
- Real part trees for the four non-Challenger twins are a data job, not a layout one.
