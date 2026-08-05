# Toyota Camry held-record adjudication — 2026-08-05

Status: proposal only. This document authorizes no production write.

## Frozen inputs

- Toyota hold review packet: `data/_toyota-hold-review-packet.json`
  - SHA-256: `3e5cde0a2d1b30abb7cde144e4427afbf33187553b8bfaf3804085d987c1d956`
- Opus diagnostic buckets: `data/_toyota-classified.json`
  - SHA-256: `1823d426d55c20df272456a837a482a5de4f7be91559b51944507542c9d832dd`
- Scope: all 49 Camry rows in the 91-row Toyota hold packet.

## Decision summary

| Disposition | Rows |
|---|---:|
| Keep the corrected replacement | 2 |
| Rewrite first, then publish after independent approval | 16 |
| Keep archived and relate to a canonical record | 3 |
| Keep archived | 28 |
| **Total** | **49** |

The two corrected water-pump records remain published. The 16 recoverable rows
must be rewritten from evidence before publication; restoring their July 17
content is prohibited. The remaining 31 archived rows are either duplicates,
uncited aggregations, false or unrelated citations, generic DTC-to-part rules,
normal behavior, ordinary wear without a Camry-specific pattern, or unsafe
diagnosis-free commerce.

## Governing policy

- Owner reports are valid evidence of an owner-reported pattern when the record
  says exactly that and does not convert anecdotes into prevalence or an OEM
  defect finding.
- A missing OEM bulletin is not, by itself, grounds for removal.
- Recall, TSB, engine, year, trim and VIN scope must be exact.
- DTCs are diagnostic results, not part diagnoses.
- Parts and costs remain absent unless exact application and evidence are
  independently verified.
- Existing IDs remain stable. Any title change requires a reviewed identity
  exception because the production gate now blocks silent title substitution.
- Archived duplicates must name their canonical record. Do not leave an
  unexplained dead duplicate.

## Adversarial findings

- The audit repeatedly used the absence of an OEM bulletin as a proxy for the
  absence of an owner-reported pattern; that is incompatible with the product
  policy and unnecessarily darkens useful search intent.
- The 2018 transmission record cited an unrelated FCA water-leak document, but
  the audit stopped after exposing that error and missed Toyota
  `T-SB-0330-17`, which directly covers shift shock on startup and delay/shock
  on reacceleration for VIN-gated 2018 Camrys.
- Several records combine more model years, generations, engines or trims than
  their sources can support. Narrowing is required; deletion is not the only
  valid response.
- Multiple forum-supported cosmetic, NVH and wear concerns were judged as if
  they claimed an OEM defect. They can survive as explicitly owner-reported
  observations with low or medium confidence.
- Several titles state a failed component before diagnosis. Rewrites must use
  symptom-led titles where the evidence does not establish the component.
- Fabricated mileage bands, prevalence rankings and report counts occur across
  the old text and cannot be retained merely because the underlying symptom is
  plausible.
- Generic cost ranges were not tied to labor region, exact configuration or a
  cited estimating source. Rewrites keep cost fields null.
- DTC-to-part shortcuts appear in catalyst, lean-code, sensor, coil and hybrid
  cooling records. These remain archived unless a model-specific condition can
  be expressed without treating a code as a component verdict.
- Generic Amazon, eBay and RockAuto searches are not deep links and cannot be
  restored as commerce evidence.
- Some part numbers span incompatible engines, doors, banks, emissions
  certifications or model generations. No part survives without exact
  fitment.
- Three duplicate records were archived without a complete SEO/canonical plan.
  Their canonical relationships must be explicit before cleanup is considered
  complete.
- Prefixing titles with `Archived -` is operational metadata leaking into
  content. Publication status, not title mutation, should control visibility.
- The prior audit supplied no field-level safe rewrite for most removals, which
  made deletion appear to be the only deployable outcome.
- Safety records need a higher evidentiary bar for cause and remedy, but reports
  should still preserve immediate safety guidance when the event is real.
- The old process did not require an exact before hash on every proposed rewrite;
  the production apply must reject drift rather than overwrite newer work.

## Keep corrected replacements (2)

| ID | Decision |
|---|---|
| `toyota-camry-2ar-fe-2-5l-belt-driven-water-pump-leak-bearing-failure` | Keep the current Toyota-bulletin-based active-leak/bearing diagnosis and VIN-conditional pump page. |
| `toyota-camry-2gr-fe-v6-water-pump-failure-coolant-leak-from-weep-hole` | Keep the current Toyota-bulletin-based active-leak/bearing diagnosis and VIN-conditional pump page. |

## Rewrite first, then publish (16)

All rows in this section keep commerce empty unless a later, separate fitment
review approves an exact product page.

| ID | Required rewrite scope |
|---|---|
| `toyota-camry-power-window-regulator-motor-failure` | Owner-reported 1990s Camry window operation symptoms; do not rank regulator, motor, switch or wiring without door-specific diagnosis. |
| `toyota-camry-rear-subframe-suspension-crossmember-rust-through` | Owner-reported corrosion on aged, salt-exposed cars; preserve urgent structural inspection guidance without prevalence or guaranteed-failure language. |
| `toyota-camry-rear-suspension-clunk-from-worn-strut-mounts-strut-rod-bushi` | Symptom-led owner report; list possible sources as diagnostic branches, not a replacement sequence. |
| `toyota-camry-sagging-drooping-headliner-from-degraded-adhesive-foam` | Owner-reported headliner detachment; remove model-wide prevalence, single-cause and universal adhesive claims. |
| `toyota-camry-stripped-aluminum-oil-pan-drain-plug-threads-causing-oil-lea` | Service-related drain-thread damage reports; require inspection of plug, washer, sealing face, pan material and threads before repair selection. |
| `toyota-camry-throttle-body-carbon-buildup-causing-rough-high-idle-stallin` | Owner-reported throttle-cleaning outcome framed as one diagnostic possibility; no faster-than-normal buildup or cleaning-interval claim. |
| `toyota-camry-transmission-2018` | Replace the false citation with Toyota `T-SB-0330-17`; limit to qualifying 2018 A25A-FKS vehicles and the bulletin's startup/reacceleration condition and VIN gates. |
| `toyota-camry-v6-active-control-hydraulic-engine-mount-failure-causing-idl` | Narrow to owner-reported 2007 V6 in-gear vibration/mount inspection; do not combine four-cylinder or multi-generation mount designs. |
| `toyota-camry-warped-front-brake-rotors-causing-steering-wheel-shudder-pul` | Owner-reported brake pulsation/shudder; use measurement-led language and avoid calling every case thermal warping. |
| `toyota-camry-wind-noise-2018` | Owner-reported 2018 highway wind noise; no six-year defect, source assumption, door adjustment or added-seal prescription. |
| `toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure` | Owner-reported 3VZ-FE Camry overheating/head-gasket cases; explicitly state that Toyota campaign V06 covers 3VZ-E trucks/SUVs and is not a Camry remedy. |
| `toyota-camry-c-compressor-seizure-internal-failure-causing-loss-cooling-b` | Symptom-led owner report for the exact cited configuration; no cross-generation defect, contamination assumption, oil quantity or parts bundle. |
| `toyota-camry-driver-assist-braking-faults-ecb-smart-stop-system-malfuncti` | Split the complaint bundle into a conservative owner-reported warning/unexpected-deceleration record; preserve stop-driving/dealer-diagnosis guidance and remove shared-cause/update claims. |
| `toyota-camry-engine-mount-wear-5s-fe-idle-vibration` | Owner-reported 5S-FE idle-in-gear vibration; mounts are an inspection branch, not a confirmed model defect or universal repair. |
| `toyota-camry-infotainment-touchscreen-delamination-bubbling-unresponsive` | Owner-reported screen bubbling/unresponsive touch; narrow hardware generations and remove unsupported digitizer/head-unit interchange and goodwill claims. |
| `toyota-camry-leather-softex-seat-cracking-peeling-driver-s-seat-bottom-bo` | Owner-reported upholstery cracking/peeling; identify material/trim uncertainty and remove cold-weather cause, warranty-outcome and universal repair-kit claims. |

Primary evidence newly found for the transmission rewrite:
[Toyota T-SB-0330-17](https://static.nhtsa.gov/odi/tsbs/2017/MC-10140595-9999.pdf).

## Keep archived and relate to canonical content (3)

| ID | Canonical relationship |
|---|---|
| `toyota-camry-engine-sludge-oiling-failure-and-engine-seizure-fire` | Relate to `toyota-camry-1mz-fe-3-0l-v6-oil-sludge-oil-gelling-engine-failure`; the archived row mixes unrelated fire and engine-failure outcomes. |
| `toyota-camry-front-upper-dogbone-torque-strut-engine-mount-failure-causin` | Relate to the reviewed symptom-led Camry engine-mount record or, until that rewrite is approved, the Camry model page. Do not preserve the multi-engine five-part rule. |
| `toyota-camry-hybrid-brake-booster-pump-accumulator-failure-long-pedal-abs` | Relate to `toyota-camry-brake-actuator-abs-2007`; keep the exact 2012-2014 Hybrid `T-SB-0130-19` / CSP ZKK scope in the canonical record. |

## Keep archived (28)

| ID | Reason |
|---|---|
| `toyota-camry-p0174-system-too-lean-from-vacuum-leak-dirty-maf-3-5l-v6` | Generic DTC-to-cause ranking; cited owner report is for RAV4, not Camry. |
| `toyota-camry-p0420-catalytic-converter-efficiency-below-threshold-check-e` | Generic multi-engine DTC/parts card; no exact failed component or emissions fitment. |
| `toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6` | False reflash citation and code-to-converter conclusion. |
| `toyota-camry-power-door-lock-actuator-failure-buzzing-grinding-one-door-w` | Parts-site aggregation across four generations with no direct owner evidence set. |
| `toyota-camry-power-window-regulator-window-glass-failure` | Uncited electrical, mechanical and spontaneous-glass bundle with no shared cause. |
| `toyota-camry-radiator-internal-transmission-cooler-failure-contaminates-a` | Catastrophic internal-breach claim is not supported by the cited cooler-fitting discussion. |
| `toyota-camry-rear-wheel-bearing--2002` | Citation is only a forum homepage; no traceable Camry evidence. |
| `toyota-camry-starter-motor-contact-solenoid-failure-single-click-no-crank` | Generic no-crank diagnostic and non-universal contact-kit rule. |
| `toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal` | Uncited 2000 bundle misusing recalls that cover later populations. |
| `toyota-camry-tss-issues-2018` | Uncited multi-system, multi-generation driver-assistance bundle. |
| `toyota-camry-upstream-air-fuel-ratio-sensor-failure-heater-circuit-fault` | Multiple circuit/fuel-trim codes collapsed into one sensor replacement. |
| `toyota-camry-v6-knock-sensor-valley-wiring-harness-failure-causing-power` | Circuit codes and incompatible engine/application assumptions do not support shotgun replacement. |
| `toyota-camry-windshield-wiper-malfunction-ice-cold-weather-reducing-drive` | One undiagnosed complaint, normal service-position behavior mixed with alleged failure, and unsupported 2026 scope. |
| `toyota-camry-a25a-fxs-engine-droning-coarse-noise-during-hard-acceleratio` | Toyota documents the described acceleration/start-stop sounds as normal hybrid characteristics. |
| `toyota-camry-accessory-drive-belt-tensioner-bearing-failure-chirp-squeal` | Vendor/part listing does not establish a three-engine Camry defect or failed component. |
| `toyota-camry-alternator-failure-charging-warning-light-dimming-lights-dea` | Generic charging-system wear across four engines; requires vehicle-level diagnosis. |
| `toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure` | Uncited 2000 complaint bundle spanning different transaxles and unrelated causes. |
| `toyota-camry-c-condenser-puncture-from-road-debris-causing-sudden-refrige` | Event-specific external damage, not a model pattern; refrigerant and part scope are configuration-dependent. |
| `toyota-camry-evap-charcoal-canister--2002` | Complaint-index root and five DTCs do not establish one canister/vent-valve defect. |
| `toyota-camry-exterior-door-handle-breakage` | Uncited report count and four-door parts bundle. |
| `toyota-camry-hood-latch-hood-popping-open-while-driving` | Uncited two-report bundle without complaint identifiers or inspection findings. |
| `toyota-camry-hvac-blower-motor-resistor-2002` | Uncited two-generation HVAC-control aggregation without circuit/configuration evidence. |
| `toyota-camry-hybrid-inverter-coolant-pump-failure-inverter-overheat` | Generic P0A93-to-pump rule with out-of-scope parts and no Camry defect evidence. |
| `toyota-camry-hydraulic-power-steering-rack-high-pressure-hose-leak-causin` | Generic age-related multi-source leak card with no exact failed component. |
| `toyota-camry-ignition-coil-failure-causing-single-cylinder-misfire-rough` | Generic misfire-code-to-coil rule. |
| `toyota-camry-intermittent-brake-loss-poor-stopping-performance` | Uncited safety complaint bundle with six unrelated parts and no reproducible cause. |
| `toyota-camry-outer-cv-joint--2000` | Forum-homepage-only generic wear card spanning 18 model years. |
| `toyota-camry-p0171-system-too-lean-from-cracked-pcv-intake-air-hose-leaki` | Generic fuel-trim-code-to-hose/gasket/MAF rule without a Camry-specific condition. |

## Apply gate (not yet authorized)

Before any production write:

1. Opus must review the exact 49-row disposition set and every field of the 16
   rewrite records.
2. A machine manifest must prove exactly 49 unique Camry IDs and must reconcile
   with the frozen 91-row Toyota packet.
3. Every rewrite must capture and verify the current production before hash.
4. The transaction may change only approved fields, must preserve the ID and
   make/model/category identity, and must rollback on any drift.
5. The post-write restoration verifier must incorporate the approved Toyota
   content overlay instead of treating reviewed rewrites as mismatches.
6. Vercel Data Cache may be purged only after the database transaction and
   post-write gate both pass.
