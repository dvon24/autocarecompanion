# Nissan NATS bounded release review — September 12, 2026

Scope: P1610/Nissan and P1614/Nissan; one shared 2003–2009 350Z issue with eight diagnostic steps. Two code-reference descriptions are corrected for consistency. All other pending research stays pending. User approved review and deployment; no account, billing, customer email or subscription launch action is included.

## Evidence and corrections

Canonical offline bundle SHA-256: aa8142d590fb2443bf716ce76c45557d9d2a659c7bd28f971d47043fa0ca4887. Its historical publication-disabled flags and all original source files remain unchanged. The separate publication manifest carries the newly reviewed slice.

- Nissan's [2008 owner manual](https://owners.nissanusa.com/content/techpub/ManualsAndGuides/ZCoupe/2008/2008-ZCoupe-owner-manual.pdf), pages 2-19/2-20: interference checks and security-light state. Official PDF opened fresh.
- [2008 Nissan factory manual mirror](https://www.350z.se/fsm/coupe/2008_Coupe%2BRoadster/BL.pdf), BL-134–146: P1610 lock mode differs from P1614 key-ID reception. No pinouts or reconstructed ambiguous flowchart are published. Earlier/later year evidence remains recorded in the canonical NATS v4 candidate; public prose requires exact-year service information.
- [Nissan NTB10-107 reprint](https://charm.li/Nissan-Datsun/2006/350Z%20V6-3.5L%20%28VQ35DE%29/Repair%20and%20Diagnosis/Starting%20and%20Charging/Technical%20Service%20Bulletins/By%20Symptom/Customer%20Interest/Antitheft%20System%20-%20Engine%20No%20Start%2FDTC%20P1610%20Set/) opened in the browser: battery-service branch applies to 2005–2008 no-start with P1610 as the only NATS code; includes exit to non-NATS diagnosis when the indicator is off. Not a blanket battery-replacement instruction.
- [Interstate MTP-35](https://www.interstatebatteries.com/products/mtp-35) opened fresh in the browser: Group 35 flooded battery, 640 CCA, $224.95 suggested retail USD; manufacturer application list includes each 2005–2008 350Z year. No store selected, so no stock, collection date or final local price claimed. One supplied commerce occurrence / one unique product URL, kept with conditional scope. MTP-35 is aftermarket, not a Nissan OEM part number.

Replaced two unsupported legacy citations with actual manuals/bulletin. Removed unsupported generic starter/relay suggestions and the unsubstantiated $300–$1,900 overall repair range; the verified battery SRP remains. Preserve stable issue ID, years, code membership, report count, source and human-approval flag. Mechanical key-turning symptoms are not proof of an immobilizer component failure. No basic OBD reader substituted for Nissan diagnostic/registration equipment.

## Validation

- Fresh read-only full snapshot matched all retained canonical issue/triage fields. Only this published car issue is associated with these two codes.
- Actual-source renderer: both parent and make pages show eight steps and the exact product URL. Aftermarket labeling corrected following independent review.
- Explicit battery scope assertions plus selected-vehicle renders cover 2003–2009 with matching, missing and wrong engine values. Only 2005–2008/3.5L passes.
- 11 commerce tests and 13 public DTC regression tests pass.
- Production build passes (1,564 static pages); existing Sentry/Next workspace warnings only.
- Independent review checked exact URL boundary, fitment, labeling and the transactional release path. Both content/test findings corrected; no remaining blockers.

The publisher locks and compares all five target rows with the saved full snapshot, checks the exact tested manifest digest and fixed field allowlist, updates within one serializable transaction, and verifies values before commit. nissan-before.json is the rollback evidence; nissan-publication-intent.json and nissan-published.json distinguish intent from acknowledged commit. Rerunning publication against changed/published records fails closed. Live verification follows deployment.
