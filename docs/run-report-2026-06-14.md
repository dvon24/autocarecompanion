# Multi-day autonomous run — report (through 2026-06-14)

## Known issues published (all via verify → URL-liveness gate)
| Wave | Models | Published |
|---|---|---|
| Toyota Supra MK3/MK4 | 1 | 20 |
| Underserved wave-2 | Buick/Pontiac/Lincoln/Mercury/Nissan/Chrysler/Dodge/Mitsubishi/Suzuki/Skoda/Renault | 50 |
| Iconic classics | C4 Corvette, Skyline R32-34, 3000GT, RX-7 FC, Celica All-Trac, MR2, 300ZX, Eclipse | 57 |
| French + India | Clio/Mégane/Captur/206/208/308/3008/C3/C4 + i20/Creta | 63 |
| Brazil best-sellers | Gol/Polo/Strada/Onix/HB20/Sandero/Kwid/Uno/Palio/Ka/Toro/City/Etios | 74 |
| US thin models | Firebird/GTO/Bonneville/Grand Am/Aztek/Vibe/LeSabre/Town Car/Cougar/Eldorado/Blazer S-10/Intrepid | 83 |
| Korea + Opel | Grandeur/Casper/Morning/Ray + Corsa/Astra/Insignia | 40 |
| **Total** | | **~387** |

First-ever coverage added: C4 Corvette, Nissan Skyline, 12 Brazil models, Hyundai i20/Creta/Grandeur/Casper, Kia Morning/Ray. Many recall-backed criticals (Brazil + Korea markets).

## SEO / content infra
- **98 symptom pages** (was 70; +28 high-intent: car-dies-then-restarts, limp mode, coolant-reservoir-bubbling, stuck-in-park, shifter-bushings, etc.)
- **15 new DTC reference pages** (P0421, P20E8, P2459, P0337, P0560, P1516, P0748, P2723, P1702, P2413, P15B3, P3055, P3056, C1608, C1041)
- **GSC indexing fix deployed** — phantom DTC 404 links eliminated (see `gsc-not-indexed-diagnosis-2026-06-14.md`)

## Languages (your "available in their language" directive)
- **/fr**: +10 French-brand models (85 issues) — was 12 models, now 22
- **/pt-br**: +14 Brazil models (80 issues) — now 29 models
- **/es**: +9 LatAm/Spain models (61 issues) — now 24 models
- Persist script now MERGES (won't wipe existing translations)
- Still pending (weekly limit): **/ko** (Grandeur/Casper/Morning/Ray) + **/de** (Polo, Opel Corsa/Astra/Insignia)

## Features built
- **Phase 0.2** — sample↔issue embedding matcher (IssueEmbedding table, vector persistence/reuse, match-samples-to-issues.js with research-candidate report). Committed, schema pushed.
- **Reddit lead scanner** (`scripts/reddit-scan-leads.js`) — read-only, finds photo/video car-problem posts → drafts disclosed replies → `data/reddit-leads.json`. Posting stays human (anti-spam). Needs your 2 Reddit app keys.
- **/about founder story** — veteran + car-lover "Why I Built Au7o" section (E-E-A-T). Personalize when you can.

## ⚠️ YOUR ACTION ITEMS (`! node ...` — classifier blocks me running these)
```
! node scripts/_archive-wave2-dupes.js          # archive 19 wave-2 duplicates (older report-backed rows kept)
! node scripts/_fix-blazer-attribution.js       # move 7 classic S-10 issues off the 2019+ Blazer page
! node scripts/_clean-dtc-arrays.js             # strip prose from 18 issues' dtcCodes arrays
! node scripts/compute-issue-embeddings.js      # ~$0.50 once — backfills + persists issue vectors
! node scripts/match-samples-to-issues.js       # matches diagnosis photos → issues + research queue
```
Env (whenever): `CLARITY_API_TOKEN`, `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` in `.env.local`.

## Decision waiting on you
**Year-variant SEO strategy** — strong evidence it's causing the not-indexed bloat. See `gsc-not-indexed-diagnosis-2026-06-14.md`. My rec: collapse variants to base canonical. ~30-min change on your OK.

## Deferred (weekly workflow limit, resets 8pm Berlin)
- /ko + /de translations (#217)
- Audi re-audit #114
- GSC adversarial confirm workflow (optional — direct evidence already sufficient)
- 1 GTO + a few Insignia/Morning verifies dropped mid-run (resumable)

## Deploy
Commits `8b271c3 → e396eee` pushed to main (Phase 0.2, fr/pt-br/es translations, symptom+DTC pages, about story, GSC fix). Build validated locally before push.
