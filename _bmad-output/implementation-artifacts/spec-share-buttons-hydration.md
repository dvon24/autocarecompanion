---
title: Keep native sharing hydration-safe
type: bugfix
created: '2026-09-12'
status: done
route: one-shot
---

# Keep native sharing hydration-safe

## Intent

**Problem:** Live DTC checks reproduced React error 418. Browser-only instrumentation identified a native Share button expected by the initial client render where the server had rendered the X link. This occurs on browsers exposing navigator.share, including the secure-origin mobile test. Local HTTP without that capability did not reproduce it.

**Approach:** Start with a stable false capability state, then detect a callable share API in an effect. Preserve social links, clipboard fallback and cancelled-share behavior. This is a public-page stability follow-up, not a change to enrollment, billing, consent policy or vehicle data.

## Suggested Review Order

1. [Stable initial markup](../../src/components/shared/ShareButtons.tsx) — capability detection after hydration.
2. [Actual component regression](../../scripts/qa-share-buttons-hydration.cjs) — SSR plus browser hydration at 390/1280 widths, available/absent/non-callable/cancelled sharing, copy and X links.

The eight synthetic browser cases passed, including a post-hydration state-transition assertion added after independent review. The production build passed (1,564 static pages). No blocking review finding remains. A separate live metadata-boundary mismatch with Termly's floating preferences markup was also observed and remains under investigation; this patch does not claim to fix it or disable consent.
