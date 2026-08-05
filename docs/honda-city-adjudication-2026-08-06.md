# Honda City known-issue adjudication - 2026-08-06

Status: proposal only; independent approval required before any database write, cache purge, deployment or production promotion.

## Result

- Frozen Honda City baseline: 6 published records.
- Same-identity rewrite proposals: 1.
- Published records held byte-for-byte unchanged: 5.
- Archive, delete, unpublish, redirect or slug changes: 0.
- Commerce additions: 0.
- The rewritten row keeps `trims` and `engines` empty, so guessed applicability labels cannot hide it from a trim or engine filter.

Packet: `data/known-issue-honda-city-adjudication-2026-08-06.json`

- Packet SHA-256 (LF-normalized): `00b4b4162eb0bbe59f9456f5fea4d98539f319e05a754f932fc72767ecd4234d`
- Frozen Honda snapshot SHA-256 (LF-normalized): `671de2660f31c07e01610e26c13382b6d59b293fb74ecc3e3abc02d248d6dd5e`
- Frozen snapshot internal hash: `fcd155f1e269b1d8c691655699cc2e18f6029c3ee54c650b88df00004025729a`

## Proposed Takata correction

The existing page identity is retained: Honda City airbag-inflator rupture and metal-fragment risk across model years 2010-2014. The proposal removes unsupported worldwide fatality/completion figures and separates the VIN-specific evidence instead of implying one universal campaign:

- 2010-2011 passenger inflator: [Brazilian Senacon recall alert archived by MPMG](https://www.mpmg.mp.br/data/files/34/90/F7/5C/0A44A7109CEB34A7760849A8/20.06.2016%20-%20Ve_culos%20Honda%20Fit_%20City_%20Civic_%20CR-V%20e%20Accord.pdf), including City chassis AZ100032 through BZ213443, rupture/fragment risk and a free remedy.
- 2012-2014 driver inflator: [Senacon technical note 8/2016](https://central3.to.gov.br/arquivo/280299/), including City chassis C*209151 through E*307830 and inflator replacement.
- Driver-campaign continuity: [Honda campaign report published by MPCE](https://mpce.mp.br/wp-content/uploads/2018/01/Dados-Campanhas_HAB_2019_02_PROCON.pdf), identifying protocol 08012.000409/2016-74 as the Fit/City driver-inflator campaign, factory codes 6ZV/6ZZ.
- Certain 2012 passenger inflators: [Honda Brazil technical report](https://goias.gov.br/procon/wp-content/uploads/sites/19/2017/01/relatorio-tecnico-honda-automoveis.pdf), including City chassis CZ200001 through CZ214820, rupture/fragment risk and free replacement.
- Current eligibility and scheduling: [Honda Brazil recall lookup](https://www.honda.com.br/automoveis/recall). The proposal directs owners to check every open campaign by VIN or plate and not assume a driver-side repair closes a passenger-side campaign.

Campaign 08012.001804/2015-93 is removed from the proposed Takata citations. Honda's recall guide and the linked government record identify that campaign as a fuel-level-sensor recall, not an airbag campaign.

## Five byte-equivalent holds

- CVT judder/failure: the generic NHTSA datasets page does not substantiate this non-US-market aggregation.
- High-pressure fuel pump/P0087: the current PROCON-SP citation is a fuel-level-sensor recall. Secondary sources refer to Honda technical tips 010/22 and 004/23, but neither primary document was located; no rewrite is proposed.
- Hood rust/paint blistering: the generic NHTSA datasets page does not substantiate the claimed Brazil-market pattern.
- Starter brush-holder failure: the current SENACON citation concerns airbags, not a starter motor; no rewrite is proposed.
- Steering-rack noise/play: the generic NHTSA datasets page does not substantiate the two-generation aggregation.

These mismatches are documented for independent review. They are not treated as permission to archive, remove or silently replace an indexed page.

## Gates

- Packet validator: 6/6 rows reconciled; 0 errors.
- Unit tests: 6/6 passed.
- Automated live-source gate: 5 exact proposal citations checked; the MPMG/Senacon PDF, MPCE campaign PDF, Honda technical PDF and Honda recall page verified live. The Tocantins-hosted Senacon technical note was access-blocked from the verifier with zero dead-link/content failures.
- Current search-index review independently exposed the exact 2012-2014 Senacon technical-note content for the access-blocked government source, including City scope, chassis range, driver inflator and replacement remedy.
- All three reachable official PDFs were downloaded and text-extracted. The MPMG/Senacon alert and the MPCE driver-campaign table were visually inspected; the 17-page Honda report was visually inspected at its cover and City applicability table.

The packet has no apply path. It can become a production mutation only through a separately reviewed, guarded apply step.
